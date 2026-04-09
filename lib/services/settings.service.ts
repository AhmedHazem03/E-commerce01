// server-only
import prisma from "@/lib/prisma";
import type { IStoreSettings, LandingPageConfig } from "@/lib/interfaces";
import { defaultLandingConfig } from "@/lib/interfaces";

/**
 * Deep-merges stored landing config with defaults so that new sections always
 * appear even when the DB row was saved before those sections were added.
 */
function mergeLandingConfig(stored: unknown): LandingPageConfig {
  if (!stored || typeof stored !== "object") return defaultLandingConfig;
  const s = stored as Partial<LandingPageConfig>;
  return {
    announcementBar: { ...defaultLandingConfig.announcementBar, ...(s.announcementBar ?? {}) },
    marquee: { ...defaultLandingConfig.marquee, ...(s.marquee ?? {}) },
    flashSale: { ...defaultLandingConfig.flashSale, ...(s.flashSale ?? {}) },
    brandStory: { ...defaultLandingConfig.brandStory, ...(s.brandStory ?? {}) },
    newArrivals: { ...defaultLandingConfig.newArrivals, ...(s.newArrivals ?? {}) },
    offersSection: { ...defaultLandingConfig.offersSection, ...(s.offersSection ?? {}) },
  };
}

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
      landingPage: true,
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
    landingPage: mergeLandingConfig(admin?.landingPage),
  };
}
