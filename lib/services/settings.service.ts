// server-only
import prisma from "@/lib/prisma";
import type { IStoreSettings } from "@/lib/interfaces";

/**
 * GET /api/settings (public, no auth).
 * Returns store settings from the first Admin record.
 * If no Admin record exists, returns defaults.
 */
export async function getStoreSettings(): Promise<IStoreSettings> {
  const admin = await prisma.admin.findFirst({
    select: {
      storeName: true,
      logo: true,
      whatsappNumber: true,
      instagram: true,
      facebook: true,
      tiktok: true,
      returnPolicy: true,
    },
  });

  return {
    storeName: admin?.storeName ?? "المتجر",
    logo: admin?.logo ?? null,
    whatsappNumber: admin?.whatsappNumber ?? null,
    instagram: admin?.instagram ?? null,
    facebook: admin?.facebook ?? null,
    tiktok: admin?.tiktok ?? null,
    returnPolicy: admin?.returnPolicy ?? null,
  };
}
