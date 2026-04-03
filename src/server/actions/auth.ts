"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { clearCurrentSession, createUserSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, normalizeEmail, verifyPassword } from "@/lib/password";
import { loginSchema, signupSchema } from "@/lib/validators";

export type AuthActionState = {
  error?: string;
};

function getValidationErrorMessage(error: { issues?: Array<{ message: string }> }) {
  return error.issues?.[0]?.message ?? "Please check the form and try again.";
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: getValidationErrorMessage(parsed.error),
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user?.passwordHash) {
    return {
      error: "Invalid email or password.",
    };
  }

  const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!isValid) {
    return {
      error: "Invalid email or password.",
    };
  }

  await createUserSession(user.id);
  redirect("/");
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error: getValidationErrorMessage(parsed.error),
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      error: "An account with that email already exists.",
    };
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name.trim(),
        email,
        passwordHash: await hashPassword(parsed.data.password),
      },
      select: {
        id: true,
      },
    });

    await createUserSession(user.id);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "An account with that email already exists.",
      };
    }

    throw error;
  }

  redirect("/");
}

export async function logoutAction() {
  await clearCurrentSession();
  redirect("/login");
}
