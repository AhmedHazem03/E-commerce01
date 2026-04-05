const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addReviews() {
  const products = await prisma.product.findMany();
  if (products.length === 0) {
    console.log("No products found.");
    return;
  }

  // Create a mock customer if not exists
  let customer = await prisma.customer.findFirst({ where: { phone: "01000000000" } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: { name: "سارة أحمد", phone: "01000000000" }
    });
  }

  let customer2 = await prisma.customer.findFirst({ where: { phone: "01111111111" } });
  if (!customer2) {
    customer2 = await prisma.customer.create({
      data: { name: "نور الدمرداش", phone: "01111111111" }
    });
  }

  console.log("Adding mock reviews to products...");
  
  for (const product of products) {
    // Avoid creating exact duplicates
    const exist = await prisma.review.findFirst({ where: { productId: product.id, customerId: customer.id } });
    if (!exist) {
      await prisma.review.create({
        data: {
          rating: 5,
          comment: "منتج رائع جداً ومطابق للمواصفات!",
          productId: product.id,
          customerId: customer.id
        }
      });
    }
    
    const exist2 = await prisma.review.findFirst({ where: { productId: product.id, customerId: customer2.id } });
    if (!exist2) {
      await prisma.review.create({
        data: {
          rating: 4,
          comment: "الجودة ممتازة لكن الشحن أخذ يوم إضافي.",
          productId: product.id,
          customerId: customer2.id
        }
      });
    }
  }
}

addReviews().then(() => console.log("Reviews added")).catch(console.error).finally(() => prisma.$disconnect());
