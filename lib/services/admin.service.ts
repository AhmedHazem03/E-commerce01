// server-only
// lib/services/admin.service.ts — Admin authentication & store settings service.
// RULE: passwordHash is NEVER returned to callers.

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import type { UpdateAdminInput, UpdateStoreSettingsInput } from "@/lib/validations/auth";

// ─────────────────────────────────────────────────────────────────────────────
// bootstrapAdmin
// ─────────────────────────────────────────────────────────────────────────────

/** Ensure the single Admin record exists. Called on every login attempt so the
 *  very first login seeds the database from env vars.  Safe to call repeatedly. */
export async function bootstrapAdmin(): Promise<void> {
  const phone = process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;

  if (!phone || !password) {
    throw new Error("ADMIN_PHONE and ADMIN_PASSWORD env vars are required");
  }

  const existing = await prisma.admin.findUnique({ where: { phone } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.admin.create({
      data: {
        phone,
        passwordHash,
        storeName: "المتجر",
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// verifyAdminCredentials
// ─────────────────────────────────────────────────────────────────────────────

/** Verify phone + password against the Admin record.
 *  Returns `{ id: string }` on success, `null` on failure. */
export async function verifyAdminCredentials(
  phone: string,
  password: string
): Promise<{ id: string } | null> {
  const admin = await prisma.admin.findUnique({ where: { phone } });
  if (!admin) return null;

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;

  return { id: String(admin.id) };
}

// ─────────────────────────────────────────────────────────────────────────────
// updateAdminCredentials
// ─────────────────────────────────────────────────────────────────────────────

/** Update admin phone and/or password. Hashes new password with bcrypt. */
export async function updateAdminCredentials(
  id: number,
  data: UpdateAdminInput
): Promise<void> {
  const update: Record<string, unknown> = {};

  if (data.phone !== undefined) update.phone = data.phone;
  if (data.password !== undefined) {
    update.passwordHash = await bcrypt.hash(data.password, 12);
  }

  if (Object.keys(update).length === 0) return;

  await prisma.admin.update({ where: { id }, data: update });
}

// ─────────────────────────────────────────────────────────────────────────────
// updateStoreSettings
// ─────────────────────────────────────────────────────────────────────────────

/** Update store meta fields for a specific admin. */
export async function updateStoreSettings(
  id: number,
  data: UpdateStoreSettingsInput
): Promise<void> {
  const update: Record<string, unknown> = {};

  if (data.storeName !== undefined) update.storeName = data.storeName;
  if (data.logo !== undefined) update.logo = data.logo;
  if (data.whatsappNumber !== undefined) update.whatsappNumber = data.whatsappNumber;
  if (data.instagram !== undefined) update.instagram = data.instagram;
  if (data.facebook !== undefined) update.facebook = data.facebook;
  if (data.tiktok !== undefined) update.tiktok = data.tiktok;
  if (data.returnPolicy !== undefined) update.returnPolicy = data.returnPolicy;
  if (data.landingPage !== undefined) update.landingPage = data.landingPage;

  if (Object.keys(update).length === 0) return;

  await prisma.admin.update({ where: { id }, data: update });
}
