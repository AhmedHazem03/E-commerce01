const { PrismaClient } = require('@prisma/client');

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
        { url: "https://images.unsplash.com/photo-1678534953171-6ced3e50f803?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
        { url: "https://images.unsplash.com/photo-1752047763267-a05dfe67e442?q=80&w=800&auto=format&fit=crop", isMain: false, position: 1 },
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
        { url: "https://images.unsplash.com/photo-1760083545495-b297b1690672?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
        { url: "https://images.unsplash.com/photo-1772474500365-c2c520545f44?q=80&w=800&auto=format&fit=crop", isMain: false, position: 1 },
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
        { url: "https://images.unsplash.com/photo-1761117228880-df2425bd70da?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
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
        { url: "https://images.unsplash.com/photo-1597308805088-ef24a8a77160?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
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
