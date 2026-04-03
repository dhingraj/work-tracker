import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/server/actions/auth";

export default async function LogoutPage() {
  const user = await getCurrentUser();

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-4 py-6">
      <div className="space-y-2 px-1">
        <p className="text-[13px] font-medium tracking-[-0.01em] text-[color:var(--app-text-tertiary)]">
          Account
        </p>
        <h1 className="text-[1.85rem] font-semibold tracking-[-0.045em] text-[color:var(--app-text)]">
          Sign out
        </h1>
        <p className="text-sm leading-6 text-[color:var(--app-text-secondary)]">
          {user ? `You are signed in as ${user.email}.` : "Your current session is already inactive."}
        </p>
      </div>

      <div className="grouped-section p-4">
        <form action={logoutAction} className="space-y-3">
          <p className="text-sm text-[color:var(--app-text-secondary)]">
            Signing out only removes the current browser session. Your private workspace data stays intact.
          </p>
          <Button fullWidth variant="danger">
            Sign out
          </Button>
        </form>
      </div>
    </section>
  );
}
