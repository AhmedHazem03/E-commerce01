import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mockProducts = [
  {
    name: "فستان سهرة كلاسيكي",
    description: "فستان سهرة أنيق يعكس الفخامة بتصميم كلاسيكي ليناسب أرقى المناسبات، بأقمشة حريرية ناعمة.",
    price: 3200,
    oldPrice: 4500,
    category: "فساتين",
    stock: 12,
    images: {
      create: [
        { url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
        { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop", isMain: false, position: 1 },
      ],
    },
  },
  {
    name: "عباية فاخرة مطرزة",
    description: "عباية عصرية فاخرة بتطريز يدوي دقيق، تجمع بين الأصالة والأناقة في تصميم واحد.",
    price: 2800,
    oldPrice: null,
    category: "عبايات",
    stock: 8,
    images: {
      create: [
        { url: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
      ],
    },
  },
  {
    name: "بلوزة حرير فاخرة",
    description: "بلوزة حرير فاخرة بقصات عصري أنيق وألوان هادئة تناسب جميع المناسبات.",
    price: 1200,
    oldPrice: 1600,
    category: "بلوزات",
    stock: 15,
    images: {
      create: [
        { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
      ],
    },
  },
  {
    name: "بنطلون كلاسيكي واسع",
    description: "بنطلون كلاسيكي واسع بقماش فاخر مريح، مناسب للاستخدام اليومي والمناسبات.",
    price: 950,
    oldPrice: null,
    category: "بناطيل",
    stock: 20,
    images: {
      create: [
        { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
      ],
    },
  },
];

async function main() {
  console.log("Seeding mock products...");
  for (const product of mockProducts) {
    await prisma.product.create({
      data: product,
    });
  }
  console.log("Mock data seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
