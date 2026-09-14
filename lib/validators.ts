import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  itemType: z.enum(["PRODUCT", "SERVICE", "TICKET", "RECHARGE", "USED_PRODUCT", "OTHER"]),
  unit: z.string().min(1),
  mrp: z.coerce.number().nonnegative(),
  sellingPrice: z.coerce.number().nonnegative(),
  costPrice: z.coerce.number().nonnegative().optional(),
  gstEnabled: z.coerce.boolean(),
  gstRate: z.coerce.number().nonnegative().max(99),
  priceEntryMode: z.enum(["INCLUDES_GST", "EXCLUDES_GST", "NO_GST"]),
  inventoryTracked: z.coerce.boolean(),
  stockQuantity: z.coerce.number().optional(),
  minimumStockLevel: z.coerce.number().optional()
});

export const invoiceItemSchema = z.object({
  productId: z.string().cuid().optional(),
  description: z.string().min(1),
  sku: z.string().optional(),
  hsnCode: z.string().optional(),
  unit: z.string().min(1),
  mrp: z.coerce.number().nonnegative(),
  enteredPrice: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().positive(),
  discountType: z.enum(["NONE", "AMOUNT", "PERCENT"]),
  discountValue: z.coerce.number().nonnegative(),
  gstRate: z.coerce.number().nonnegative(),
  priceEntryMode: z.enum(["INCLUDES_GST", "EXCLUDES_GST", "NO_GST"])
});

export const createInvoiceSchema = z.object({
  customerId: z.string().cuid().optional(),
  taxSplitMode: z.enum(["INTRA_STATE", "INTER_STATE"]),
  items: z.array(invoiceItemSchema).min(1),
  amountPaid: z.coerce.number().nonnegative(),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"]).optional(),
  paymentReference: z.string().optional()
});
