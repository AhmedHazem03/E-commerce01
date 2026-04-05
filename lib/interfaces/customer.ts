// lib/interfaces/customer.ts
// Pure TypeScript interfaces — no Prisma types exported here.

export interface Address {
  id: number;
  label: string;
  city: string;
  area: string;
  street: string;
  notes: string | null;
  isDefault: boolean;
  customerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyAccount {
  id: number;
  points: number;
  customerId: number;
  createdAt: Date;
  updatedAt: Date;
}
