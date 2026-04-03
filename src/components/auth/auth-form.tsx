"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import type { AuthActionState } from "@/server/actions/auth";

type AuthMode = "login" | "signup";

const emptyState: AuthActionState = {};

export function AuthForm({
  mode,
  action,
}: {
  mode: AuthMode;
  action: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, emptyState);
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-3">
        {isSignup ? (
          <input
            name="name"
            autoComplete="name"
            placeholder="Name"
            className="app-input"
            required
          />
        ) : null}
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          className="app-input"
          required
        />
        <input
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder="Password"
          className="app-input"
          minLength={8}
          required
        />
        {isSignup ? (
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm password"
            className="app-input"
            minLength={8}
            required
          />
        ) : null}
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-[color:var(--app-border-soft)] bg-[color:var(--app-blue-soft)] px-4 py-3 text-sm text-[color:var(--app-text)]">
          {state.error}
        </p>
      ) : null}

      <Button fullWidth disabled={pending}>
        {pending ? (isSignup ? "Creating account..." : "Signing in...") : isSignup ? "Create account" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-[color:var(--app-text-secondary)]">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-[color:var(--app-blue)]"
        >
          {isSignup ? "Sign in" : "Create account"}
        </Link>
      </p>
    </form>
  );
}
