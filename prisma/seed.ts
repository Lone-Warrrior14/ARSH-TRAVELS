import bcrypt from "bcryptjs";
import { PrismaClient, ItemType, PriceEntryMode, RoleName } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(process.env.INITIAL_ADMIN_PASSWORD ?? "ChangeMe123!", 12);

  await prisma.user.upsert({
    where: { email: process.env.INITIAL_ADMIN_EMAIL ?? "owner@arsh-enterprises.local" },
    update: {},
    create: {
      name: "Owner",
      email: process.env.INITIAL_ADMIN_EMAIL ?? "owner@arsh-enterprises.local",
      passwordHash,
      role: RoleName.ADMIN
    }
  });

  await prisma.businessSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      businessName: "ARSH ENTERPRISES",
      gstin: "29AIGPR1899C1ZU",
      state: "Karnataka",
      invoicePrefix: "ARSH"
    }
  });

  const categories = ["Mobile Phones", "Used Mobiles", "Accessories", "Electronics", "Stationery", "Printing", "Xerox", "Scanning", "Lamination", "Recharge", "Travel", "Passport Services", "Online Services", "Other"];
  for (const name of categories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  const units = ["Piece", "Page", "Copy", "Set", "Ticket", "Recharge", "Service", "Hour", "Package", "Other"];
  for (const name of units) {
    await prisma.unit.upsert({ where: { name }, update: {}, create: { name } });
  }

  const mobileCategory = await prisma.category.findUniqueOrThrow({ where: { name: "Mobile Phones" } });
  await prisma.productOrService.upsert({
    where: { sku: "EX-MOBILE-001" },
    update: {},
    create: {
      name: "Example Mobile",
      sku: "EX-MOBILE-001",
      itemType: ItemType.PRODUCT,
      unit: "Piece",
      mrp: "1500.00",
      sellingPrice: "1180.00",
      gstEnabled: true,
      gstRate: "18.00",
      priceEntryMode: PriceEntryMode.INCLUDES_GST,
      inventoryTracked: true,
      stockQuantity: "10",
      minimumStockLevel: "2",
      categoryId: mobileCategory.id
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
