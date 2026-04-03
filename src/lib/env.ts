import "server-only";

const MIN_SESSION_SECRET_LENGTH = 32;
const DEVELOPMENT_SESSION_SECRET =
  "local-development-session-secret-change-before-production";

let hasWarnedAboutDevelopmentSessionSecret = false;

export function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}

export function getSessionSecret() {
  const sessionSecret = process.env.SESSION_SECRET?.trim();
  if (sessionSecret) {
    if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) {
      throw new Error(
        `SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters long.`,
      );
    }

    return sessionSecret;
  }

  if (isProductionEnvironment()) {
    throw new Error(
      "Missing SESSION_SECRET. Set a long random SESSION_SECRET in the deployment environment.",
    );
  }

  if (!hasWarnedAboutDevelopmentSessionSecret) {
    console.warn(
      "SESSION_SECRET is not set. Falling back to a development-only secret. Set SESSION_SECRET in .env before deploying.",
    );
    hasWarnedAboutDevelopmentSessionSecret = true;
  }

  return DEVELOPMENT_SESSION_SECRET;
}
