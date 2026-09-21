import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { documentation, locations, reports } from "../drizzle/schema";
import { getDashboardStats, getUserByUsername, listDocumentation, listLocations, listReports, requireDb, touchUser } from "./db";
import { storagePut } from "./storage";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { generateInsight } from "./insights";
import { verifyPassword } from "./password";
import { sdk } from "./_core/sdk";
import { ONE_YEAR_MS } from "@shared/const";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    localLogin: publicProcedure.input(z.object({ username: z.string().trim().min(3).max(80), password: z.string().min(12).max(200) })).mutation(async ({ ctx, input }) => {
      const user = await getUserByUsername(input.username.toLowerCase());
      if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
        throw new Error("Username atau password salah.");
      }
      const token = await sdk.createSessionToken(user.openId, { name: user.name || user.username || input.username, expiresInMs: ONE_YEAR_MS });
      await touchUser(user);
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
      return { success: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  dashboard: router({
    overview: protectedProcedure.query(() => getDashboardStats()),
  }),
  locations: router({
    list: protectedProcedure.query(() => listLocations()),
    create: protectedProcedure.input(z.object({ name: z.string().min(2), province: z.string().min(2), address: z.string().optional(), latitude: z.number(), longitude: z.number() })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.insert(locations).values(input);
      return { success: true } as const;
    }),
  }),
  reports: router({
    list: protectedProcedure.query(() => listReports()),
    updateStatus: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["completed", "review", "in_progress"]) })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.update(reports).set({ status: input.status, updatedAt: new Date() }).where((await import("drizzle-orm")).eq(reports.id, input.id));
      return { success: true } as const;
    }),
  }),
  insights: router({
    generate: protectedProcedure.input(z.object({ question: z.string().min(3).max(600) })).mutation(({ input }) => generateInsight(input.question)),
  }),
  documentation: router({
    list: protectedProcedure.query(() => listDocumentation()),
    upload: protectedProcedure.input(z.object({ title: z.string().min(2), filename: z.string().min(1), mimeType: z.string().min(1), base64: z.string().min(1), locationId: z.number().optional() })).mutation(async ({ ctx, input }) => {
      if (input.base64.length > 7_000_000) throw new Error("File terlalu besar. Maksimal 5 MB.");
      const buffer = Buffer.from(input.base64, "base64");
      const uploaded = await storagePut(`documentation/${ctx.user.id}/${input.filename}`, buffer, input.mimeType);
      const db = await requireDb();
      await db.insert(documentation).values({ title: input.title, filename: input.filename, mimeType: input.mimeType, storageKey: uploaded.key, storageUrl: uploaded.url, uploadedBy: ctx.user.id, locationId: input.locationId, status: "review" });
      return { success: true, url: uploaded.url } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
