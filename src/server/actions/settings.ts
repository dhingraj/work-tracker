"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeEmail } from "@/lib/password";
import { settingsSchema } from "@/lib/validators";

export async function updateSettingsAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = settingsSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    timezone: formData.get("timezone"),
    dailyTargetMinutes: Number.parseInt(String(formData.get("dailyTargetMinutes")), 10),
    deepWorkTarget: Number.parseInt(String(formData.get("deepWorkTarget")), 10),
    defaultSessionMinutes: Number.parseInt(
      String(formData.get("defaultSessionMinutes")),
      10,
    ),
    weekStartsOn: Number.parseInt(String(formData.get("weekStartsOn")), 10),
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.name,
      email: normalizeEmail(parsed.email),
      timezone: parsed.timezone,
      dailyTargetMinutes: parsed.dailyTargetMinutes,
      deepWorkTarget: parsed.deepWorkTarget,
      defaultSessionMinutes: parsed.defaultSessionMinutes,
      weekStartsOn: parsed.weekStartsOn,
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
}
