import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    sku: "premium_monthly",
    name: "Premium Monthly",
    description: "Full premium access billed monthly.",
    amountCents: 999,
    currency: "usd"
  },
  {
    sku: "premium_yearly",
    name: "Premium Yearly",
    description: "Best value yearly premium unlock.",
    amountCents: 7999,
    currency: "usd"
  }
];

async function main() {
  const testPasswordHash = await bcrypt.hash("Pookie1234!", 12);

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product
    });
  }

  await prisma.user.upsert({
    where: { email: "test@pookiestudios.local" },
    update: {
      name: "Test User",
      passwordHash: testPasswordHash,
      emailVerified: true
    },
    create: {
      email: "test@pookiestudios.local",
      name: "Test User",
      passwordHash: testPasswordHash,
      emailVerified: true
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
