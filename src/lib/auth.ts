import { randomBytes, createHmac } from "node:crypto";

import type { Session, User } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSessionSecret, isProductionEnvironment } from "@/lib/env";

const SESSION_COOKIE_BASENAME = "work_tracker_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_MS / 1000;

function sessionExpiryDate(now = new Date()) {
  return new Date(now.getTime() + SESSION_MAX_AGE_MS);
}

function sessionCookieName() {
  return isProductionEnvironment()
    ? `__Secure-${SESSION_COOKIE_BASENAME}`
    : SESSION_COOKIE_BASENAME;
}

function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProductionEnvironment(),
    path: "/",
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
    priority: "high" as const,
  };
}

function hashSessionToken(token: string) {
  return createHmac("sha256", getSessionSecret()).update(token).digest("hex");
}

async function getSessionCookieValue() {
  const cookieStore = await cookies();
  return cookieStore.get(sessionCookieName())?.value ?? null;
}

async function persistSessionToken(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(), token, sessionCookieOptions(expiresAt));
}

async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName(), "", {
    ...sessionCookieOptions(new Date(0)),
    expires: new Date(0),
    maxAge: 0,
  });
}

export async function createUserSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = sessionExpiryDate();

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  await persistSessionToken(token, expiresAt);
}

export async function clearCurrentSession() {
  const token = await getSessionCookieValue();

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  await clearSessionCookie();
}

export async function getCurrentSession(): Promise<
  ({ user: User } & Pick<Session, "id" | "userId" | "expiresAt" | "lastSeenAt">) | null
> {
  const token = await getSessionCookieValue();
  if (!token) {
    return null;
  }

  const now = new Date();
  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
    include: {
      user: true,
    },
  });

  if (!session || session.expiresAt <= now) {
    if (session && session.expiresAt <= now) {
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      });
    }

    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }
}
