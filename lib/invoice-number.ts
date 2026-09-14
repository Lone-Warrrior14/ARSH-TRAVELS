import { prisma } from "@/lib/db";

export async function nextInvoiceNumber(prefix: string) {
  const year = new Date().getFullYear();
  const counterKey = `${prefix}-${year}`;

  const counter = await prisma.invoiceCounter.upsert({
    where: { key: counterKey },
    create: { key: counterKey, nextNumber: 2 },
    update: { nextNumber: { increment: 1 } }
  });

  const number = counter.nextNumber - 1;
  return `${counterKey}-${String(number).padStart(4, "0")}`;
}
