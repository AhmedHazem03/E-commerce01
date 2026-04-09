// prisma/seed.js
// Comprehensive seed: Products + Variants + Customers + Orders + Reviews + Coupons + Delivery Zones + Landing Config
// Run: node prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const products = [
  // ── فساتين ──────────────────────────────────────────────────────────────────
  {
    name: "فستان سهرة كلاسيكي",
    description: "فستان سهرة أنيق يعكس الفخامة بتصميم كلاسيكي ليناسب أرقى المناسبات، بأقمشة حريرية ناعمة تمنحك إطلالة ساحرة.",
    price: 3200,
    oldPrice: 4500,
    category: "فساتين",
    stock: 12,
    images: [
      { url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
      { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop", isMain: false, position: 1 },
    ],
    variants: [{ name: "المقاس", options: ["S", "M", "L", "XL"] }],
  },
  {
    name: "فستان ميدي كاجوال",
    description: "فستان ميدي عصري بخامة قطن ناعمة، مناسب للنزهات اليومية والتجمعات العائلية، متوفر بألوان متعددة.",
    price: 1850,
    oldPrice: 2400,
    category: "فساتين",
    stock: 18,
    images: [
      { url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
      { url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop", isMain: false, position: 1 },
    ],
    variants: [{ name: "المقاس", options: ["S", "M", "L"] }],
  },
  {
    name: "فستان بوهيمي مطرز",
    description: "فستان بوهيمي بتطريز يدوي ملوّن على أقمشة شيفون خفيفة، يناسب أجواء الصيف والحفلات الخارجية.",
    price: 2200,
    oldPrice: null,
    category: "فساتين",
    stock: 7,
    images: [
      { url: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
    ],
    variants: [{ name: "المقاس", options: ["S", "M", "L", "XL", "XXL"] }],
  },
  {
    name: "فستان قصير بكشكش",
    description: "فستان قصير أنيق بتفاصيل كشكش على الأكمام والطرف، لمسة رومانسية خفيفة تناسب السهرات والمناسبات.",
    price: 980,
    oldPrice: 1350,
    category: "فساتين",
    stock: 25,
    images: [
      { url: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
    ],
    variants: [{ name: "المقاس", options: ["XS", "S", "M", "L"] }],
  },
  // ── عبايات ───────────────────────────────────────────────────────────────────
  {
    name: "عباية فاخرة مطرزة",
    description: "عباية عصرية فاخرة بتطريز يدوي دقيق على الأكمام والطرف، تجمع بين الأصالة والأناقة في تصميم عملي فاخر.",
    price: 2800,
    oldPrice: null,
    category: "عبايات",
    stock: 8,
    images: [
      { url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
      { url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop", isMain: false, position: 1 },
    ],
    variants: [{ name: "المقاس", options: ["M", "L", "XL", "XXL"] }],
  },
  {
    name: "عباية سادة كلاسيك",
    description: "عباية سادة بخط مستقيم أنيق من قماش كريب فاخر، تناسب جميع المناسبات الرسمية واليومية.",
    price: 1600,
    oldPrice: 2100,
    category: "عبايات",
    stock: 14,
    images: [
      { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
    ],
    variants: [{ name: "المقاس", options: ["S", "M", "L", "XL"] }],
  },
  {
    name: "عباية كيمونو جاكار",
    description: "عباية كيمونو بقماش جاكار فاخر، تصميم عصري يمزج بين الوقار والعالمية لإطلالة مميزة.",
    price: 3500,
    oldPrice: 4200,
    category: "عبايات",
    stock: 5,
    images: [
      { url: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
    ],
    variants: [{ name: "المقاس", options: ["M", "L", "XL"] }],
  },
  // ── بلوزات ───────────────────────────────────────────────────────────────────
  {
    name: "بلوزة حرير فاخرة",
    description: "بلوزة حرير فاخرة بقصة عصرية أنيقة وألوان هادئة تناسب جميع المناسبات، سهلة التنسيق مع أي ملابس.",
    price: 1200,
    oldPrice: 1600,
    category: "بلوزات",
    stock: 15,
    images: [
      { url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
      { url: "https://images.unsplash.com/photo-1524150328571-0e03ce8527d0?q=80&w=800&auto=format&fit=crop", isMain: false, position: 1 },
    ],
    variants: [
      { name: "المقاس", options: ["XS", "S", "M", "L", "XL"] },
      { name: "اللون", options: ["أبيض", "بيج", "وردي", "أسود"] },
    ],
  },
  {
    name: "بلوزة قطن مزركشة",
    description: "بلوزة قطن ناعمة بطباعة زهرية جميلة، مريحة وعصرية لإطلالة يومية مشرقة.",
    price: 750,
    oldPrice: 980,
    category: "بلوزات",
    stock: 30,
    images: [
      { url: "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
    ],
    variants: [
      { name: "المقاس", options: ["S", "M", "L", "XL"] },
      { name: "اللون", options: ["أزرق", "أخضر", "زهري", "أصفر"] },
    ],
  },
  {
    name: "توب شيفون كاجوال",
    description: "توب شيفون خفيف وأنيق بأكمام فراشة، تصميم رومانسي ناعم مثالي لفصل الصيف.",
    price: 620,
    oldPrice: null,
    category: "بلوزات",
    stock: 22,
    images: [
      { url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
    ],
    variants: [{ name: "المقاس", options: ["XS", "S", "M", "L"] }],
  },
  // ── تنانير ───────────────────────────────────────────────────────────────────
  {
    name: "تنورة ميدي ساتان",
    description: "تنورة ميدي من قماش الساتان اللامع بقصة A-Line أنيقة، تمنحك مظهراً راقياً في المناسبات.",
    price: 1100,
    oldPrice: 1500,
    category: "تنانير",
    stock: 10,
    images: [
      { url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
    ],
    variants: [{ name: "المقاس", options: ["S", "M", "L", "XL"] }],
  },
  {
    name: "تنورة جينز كاجوال",
    description: "تنورة جينز كلاسيكية بقصة مستقيمة، متعددة الاستخدامات وسهلة التنسيق مع كل شيء.",
    price: 850,
    oldPrice: null,
    category: "تنانير",
    stock: 16,
    images: [
      { url: "https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
    ],
    variants: [{ name: "المقاس", options: ["S", "M", "L"] }],
  },
  // ── بناطيل ───────────────────────────────────────────────────────────────────
  {
    name: "بنطلون كلاسيكي واسع",
    description: "بنطلون كلاسيكي واسع بقماش فاخر مريح، مناسب للاستخدام اليومي والمناسبات الرسمية.",
    price: 950,
    oldPrice: null,
    category: "بناطيل",
    stock: 20,
    images: [
      { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
    ],
    variants: [{ name: "المقاس", options: ["S", "M", "L", "XL", "XXL"] }],
  },
  {
    name: "بنطلون لينن صيفي",
    description: "بنطلون لينن خفيف وناعم لفصل الصيف، تصميم عصري مريح يناسب نزهات الشاطئ والأماكن العامة.",
    price: 780,
    oldPrice: 1050,
    category: "بناطيل",
    stock: 18,
    images: [
      { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop", isMain: true, position: 0 },
    ],
    variants: [
      { name: "المقاس", options: ["S", "M", "L", "XL"] },
      { name: "اللون", options: ["أبيض", "بيج", "رمادي", "كحلي"] },
    ],
  },
];

const customers = [
  { name: "سارة أحمد", phone: "01000000001", city: "القاهرة", area: "المعادي" },
  { name: "نور الدمرداش", phone: "01111111102", city: "الإسكندرية", area: "سيدي بشر" },
  { name: "منى خالد", phone: "01222222203", city: "الجيزة", area: "الدقي" },
  { name: "ريم عصام", phone: "01333333304", city: "المنصورة", area: "المنصورة الجديدة" },
  { name: "دينا فاروق", phone: "01444444405", city: "طنطا", area: "المدينة" },
  { name: "ياسمين محمد", phone: "01555555506", city: "أسيوط", area: "أسيوط الجديدة" },
  { name: "هبة إبراهيم", phone: "01666666607", city: "الشرقية", area: "الزقازيق" },
  { name: "نادية عبداللطيف", phone: "01777777708", city: "بورسعيد", area: "الضاحية" },
];

const reviewComments = [
  { rating: 5, comment: "منتج رائع جداً ومطابق للمواصفات! الخامة فاخرة جداً وجودة الخياطة ممتازة." },
  { rating: 5, comment: "وصل بسرعة والتغليف أنيق. المنتج يستحق كل جنيه." },
  { rating: 4, comment: "الجودة ممتازة لكن الشحن أخذ يوم إضافي. المنتج نفسه 10/10." },
  { rating: 5, comment: "اشتريته هدية وكانوا منبهرين منه. شكراً جزيلاً!" },
  { rating: 4, comment: "الألوان أجمل من الصور. سأتسوق منكم مجدداً بالتأكيد." },
  { rating: 5, comment: "المقاس مظبوط والخامة ناعمة جداً. أفضل من أي متجر تاني." },
  { rating: 3, comment: "المنتج كويس لكن اللون اختلف قليلاً عن الصورة." },
  { rating: 5, comment: "النعومة والجودة فوق التوقعات. استلمت في نفس اليوم!" },
];

const deliveryZones = [
  { name: "القاهرة الكبرى", deliveryFee: 50 },
  { name: "الإسكندرية", deliveryFee: 65 },
  { name: "الدلتا (الوجه البحري)", deliveryFee: 70 },
  { name: "الصعيد", deliveryFee: 80 },
  { name: "سيناء وقناة السويس", deliveryFee: 75 },
  { name: "الساحل الشمالي", deliveryFee: 90 },
];

const coupons = [
  {
    code: "WELCOME10",
    type: "PERCENTAGE",
    value: 10,
    minOrder: 500,
    maxUses: 1000,
    isActive: true,
  },
  {
    code: "SUMMER25",
    type: "PERCENTAGE",
    value: 25,
    minOrder: 1500,
    maxUses: 500,
    isActive: true,
  },
  {
    code: "FREESHIP",
    type: "FIXED",
    value: 60,
    minOrder: 800,
    maxUses: null,
    isActive: true,
  },
  {
    code: "VIP200",
    type: "FIXED",
    value: 200,
    minOrder: 2000,
    maxUses: 200,
    isActive: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting comprehensive seed...\n");

  // ── 1. Clear existing data (order matters for FK constraints) ──────────────
  console.log("🗑  Cleaning old data...");
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.loyaltyAccount.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.variantOption.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.abandonedCart.deleteMany();
  console.log("   ✓ Done\n");

  // ── 2. Delivery Zones ──────────────────────────────────────────────────────
  console.log("📍 Seeding delivery zones...");
  const createdZones = [];
  for (const zone of deliveryZones) {
    const z = await prisma.deliveryZone.create({ data: zone });
    createdZones.push(z);
  }
  console.log(`   ✓ ${createdZones.length} zones\n`);

  // ── 3. Coupons ──────────────────────────────────────────────────────────────
  console.log("🎟  Seeding coupons...");
  for (const coupon of coupons) {
    await prisma.coupon.create({ data: coupon });
  }
  console.log(`   ✓ ${coupons.length} coupons\n`);

  // ── 4. Products + Variants ─────────────────────────────────────────────────
  console.log("👗 Seeding products...");
  const createdProducts = [];
  for (const p of products) {
    const { images, variants, ...rest } = p;
    const product = await prisma.product.create({
      data: {
        ...rest,
        images: { create: images },
        variants: variants
          ? {
              create: variants.map((v, vi) => ({
                name: v.name,
                position: vi,
                options: {
                  create: v.options.map((opt, oi) => ({
                    value: opt,
                    stock: randomBetween(5, 25),
                    position: oi,
                  })),
                },
              })),
            }
          : undefined,
      },
    });
    createdProducts.push(product);
  }
  console.log(`   ✓ ${createdProducts.length} products with variants\n`);

  // ── 5. Customers + Addresses ───────────────────────────────────────────────
  console.log("👥 Seeding customers...");
  const createdCustomers = [];
  for (const c of customers) {
    const { city, area, ...customerData } = c;
    const customer = await prisma.customer.create({
      data: {
        ...customerData,
        addresses: {
          create: [
            {
              label: "المنزل",
              city,
              area,
              street: `شارع ${randomBetween(1, 50)} عمارة ${randomBetween(1, 20)}`,
              isDefault: true,
            },
          ],
        },
        loyaltyAccount: {
          create: { points: randomBetween(0, 500) },
        },
      },
      include: { addresses: true },
    });
    createdCustomers.push(customer);
  }
  console.log(`   ✓ ${createdCustomers.length} customers\n`);

  // ── 6. Reviews ──────────────────────────────────────────────────────────────
  console.log("⭐ Seeding reviews...");
  let reviewCount = 0;
  for (const product of createdProducts) {
    // Each product gets 2–5 reviews from different customers
    const shuffled = [...createdCustomers].sort(() => Math.random() - 0.5);
    const reviewers = shuffled.slice(0, randomBetween(2, Math.min(5, createdCustomers.length)));
    for (const customer of reviewers) {
      const review = randomItem(reviewComments);
      await prisma.review.create({
        data: {
          rating: review.rating,
          comment: review.comment,
          productId: product.id,
          customerId: customer.id,
        },
      });
      reviewCount++;
    }
  }
  console.log(`   ✓ ${reviewCount} reviews\n`);

  // ── 7. Orders ──────────────────────────────────────────────────────────────
  console.log("📦 Seeding orders...");
  const statuses = ["DELIVERED", "DELIVERED", "DELIVERED", "SHIPPED", "CONFIRMED", "NEW", "CANCELLED"];
  const paymentMethods = ["CASH", "CASH", "CASH", "VODAFONE_CASH", "INSTAPAY"];
  const sources = ["INSTAGRAM", "WHATSAPP", "DIRECT", "GOOGLE", "TIKTOK"];

  let orderCount = 0;
  for (const customer of createdCustomers) {
    const address = customer.addresses[0];
    if (!address) continue;
    const zone = randomItem(createdZones);

    // 2–5 orders per customer
    const numOrders = randomBetween(2, 5);
    for (let o = 0; o < numOrders; o++) {
      // 1–3 items per order
      const numItems = randomBetween(1, 3);
      const orderProducts = [...createdProducts]
        .sort(() => Math.random() - 0.5)
        .slice(0, numItems);

      const items = orderProducts.map((p) => ({
        name: p.name,
        price: p.price,
        quantity: randomBetween(1, 3),
        productId: p.id,
        image: null,
      }));

      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const deliveryFee = zone.deliveryFee;
      const discount = 0;
      const total = subtotal + deliveryFee - discount;
      const status = randomItem(statuses);
      const paymentMethod = randomItem(paymentMethods);

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

      const order = await prisma.order.create({
        data: {
          orderNumber,
          status,
          paymentMethod,
          paymentStatus: status === "DELIVERED" ? "PAID" : "PENDING",
          subtotal,
          deliveryFee,
          discount,
          total,
          source: randomItem(sources),
          customerId: customer.id,
          addressId: address.id,
          deliveryZoneId: zone.id,
          createdAt: daysAgo(randomBetween(0, 60)),
          items: { create: items },
        },
      });

      // Add loyalty points for delivered orders
      if (status === "DELIVERED") {
        const account = await prisma.loyaltyAccount.findUnique({
          where: { customerId: customer.id },
        });
        if (account) {
          const pts = Math.floor(total / 100);
          await prisma.loyaltyTransaction.create({
            data: {
              points: pts,
              reason: "شراء منتجات",
              accountId: account.id,
              orderId: order.id,
            },
          });
          await prisma.loyaltyAccount.update({
            where: { id: account.id },
            data: { points: { increment: pts } },
          });
        }
      }

      orderCount++;
    }
  }
  console.log(`   ✓ ${orderCount} orders\n`);

  // ── 8. Landing Page Config ─────────────────────────────────────────────────
  console.log("🎨 Updating landing page config in Admin...");
  const admin = await prisma.admin.findFirst();
  if (admin) {
    const flashSaleEnd = new Date();
    flashSaleEnd.setHours(flashSaleEnd.getHours() + 48);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        landingPage: {
          announcementBar: {
            enabled: true,
            text: "🎁 شحن مجاني على الطلبات فوق ٣٠٠ جنيه — اطلبي دلوقتي!",
          },
          marquee: {
            enabled: true,
            items: [
              "🔥 تخفيضات الصيف وصلت",
              "شحن مجاني فوق ٣٠٠ جنيه",
              "✨ مجموعة جديدة كل أسبوع",
              "دفع عند الاستلام متاح",
              "🎀 أقمشة فاخرة مختارة بعناية",
              "⭐ أكثر من ٥٠٠٠ عميلة سعيدة",
            ],
          },
          flashSale: {
            enabled: true,
            title: "عرض ليوم واحد فقط 🔥",
            endsAt: flashSaleEnd.toISOString(),
          },
          brandStory: {
            enabled: true,
            headline: "قصتنا",
            body: "بدأنا في ٢٠٢١ من شقة صغيرة في المنصورة، ودلوقتي بنوصل لأكثر من ٣٠ محافظة في مصر كلها. كل قطعة بنختارها بحب وعناية عشان تحسّي إنك مميّزة.",
            image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1287&auto=format&fit=crop",
          },
          newArrivals: {
            enabled: true,
            title: "وصل حديثًا ✨",
            limit: 8,
          },
          offersSection: {
            enabled: true,
            title: "عروض وتخفيضات 🎯",
            limit: 8,
          },
        },
      },
    });
    console.log("   ✓ Landing config updated\n");
  } else {
    console.log("   ⚠ No admin found — skipping landing config\n");
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════");
  console.log("✅ Seed completed successfully!");
  console.log(`   • ${createdProducts.length} products`);
  console.log(`   • ${createdCustomers.length} customers`);
  console.log(`   • ${reviewCount} reviews`);
  console.log(`   • ${orderCount} orders`);
  console.log(`   • ${coupons.length} coupons`);
  console.log(`   • ${createdZones.length} delivery zones`);
  console.log("═══════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
