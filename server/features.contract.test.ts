import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("monev feature contracts", () => {
  it("exposes protected data routers for the dashboard workspace", () => {
    expect(appRouter.dashboard.overview).toBeDefined();
    expect(appRouter.locations.list).toBeDefined();
    expect(appRouter.locations.create).toBeDefined();
    expect(appRouter.reports.list).toBeDefined();
    expect(appRouter.reports.updateStatus).toBeDefined();
    expect(appRouter.insights.generate).toBeDefined();
    expect(appRouter.documentation.list).toBeDefined();
    expect(appRouter.documentation.upload).toBeDefined();
  });

  it("keeps auth session procedures available alongside feature routers", () => {
    expect(appRouter.auth.me).toBeDefined();
    expect(appRouter.auth.logout).toBeDefined();
    expect(appRouter.system).toBeDefined();
  });
});
