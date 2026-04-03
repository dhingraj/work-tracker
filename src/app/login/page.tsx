import { AuthForm } from "@/components/auth/auth-form";
import { redirectIfAuthenticated } from "@/lib/auth";
import { loginAction } from "@/server/actions/auth";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-6">
      <section className="w-full space-y-5">
        <div className="px-1">
          <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[color:var(--app-text)]">
            Sign in
          </h1>
        </div>

        <div className="grouped-section p-4 sm:p-5">
          <AuthForm mode="login" action={loginAction} />
        </div>
      </section>
    </main>
  );
}
