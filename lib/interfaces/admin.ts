// lib/interfaces/admin.ts
// Pure TypeScript interfaces — no Prisma types exported here.
// passwordHash is NEVER included — strip before returning to callers.

export interface Admin {
  id: number;
  phone: string;
  storeName: string;
  logo: string | null;
  whatsappNumber: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  returnPolicy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Public store settings — returned by GET /api/settings (no auth). */
export interface IStoreSettings {
  storeName: string;
  logo: string | null;
  whatsappNumber: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  returnPolicy: string | null;
}
