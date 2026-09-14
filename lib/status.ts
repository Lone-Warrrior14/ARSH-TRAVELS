import { money } from "@/lib/money";

export function paymentStatus(grandTotal: string | number, paid: string | number) {
  const total = money(grandTotal);
  const amountPaid = money(paid);
  if (amountPaid.lte(0)) return "UNPAID";
  if (amountPaid.gte(total)) return "PAID";
  return "PARTIALLY_PAID";
}
