const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const mockProducts = [
  {
    name: "فستان سهرة كلاسيكي",
    description: "فستان سهرة أنيق يعكس الفخامة بتصميم كلاسيكي ليناسب أرقى المناسبات، بأقمشة حريرية ناعمة.",
    price: 3200,
    oldPrice: 4500,
    category: "ملابس",
    stock: 12,
    images: {
      create: [
        { url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1171&auto=format&fit=crop", isMain: true, position: 0 },
        { url: "https://images.unsplash.com/photo-1566150908058-295f5bd21af4?q=80&w=1287&auto=format&fit=crop", isMain: false, position: 1 },
      ],
    },
  },
  {
    name: "حقيبة يد جلد طبيعي",
    description: "حقيبة نسائية فاخرة مصنوعة من الجلد الطبيعي بتفاصيل دقيقة تعزز من أناقتك اليومية.",
    price: 1800,
    oldPrice: null,
    category: "إكسسوارات",
    stock: 5,
    images: {
      create: [
        { url: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1015&auto=format&fit=crop", isMain: true, position: 0 },
      ],
    },
  },
  {
    name: "طقم مجوهرات مرصع",
    description: "طقم مجوهرات رائع يضيف لمسة من البريق والسحر إلى إطلالتك بتصميم عصري وفريد.",
    price: 5400,
    oldPrice: 6000,
    category: "إكسسوارات",
    stock: 3,
    images: {
      create: [
        { url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1170&auto=format&fit=crop", isMain: true, position: 0 },
      ],
    },
  },
  {
    name: "عطر ليالي الشرق الفاخر",
    description: "عطر فريد يمزج بين العود الأصيل والمكونات العصرية ليمنحك رائحة لا تُنسى.",
    price: 2100,
    oldPrice: 2800,
    category: "هدايا",
    stock: 20,
    images: {
      create: [
        { url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1287&auto=format&fit=crop", isMain: true, position: 0 },
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
