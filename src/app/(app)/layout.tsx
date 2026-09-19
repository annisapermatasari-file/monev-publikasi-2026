import { auth, signOut } from "@/lib/auth";
import { AppNavigation } from "@/components/AppNavigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user.role;

  return (
    <div className="flex min-h-screen">
      <AppNavigation
        role={role}
        userName={session?.user.name}
        onSignOut={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      />

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
