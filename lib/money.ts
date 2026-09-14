import Decimal from "decimal.js";

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type PriceEntryMode = "INCLUDES_GST" | "EXCLUDES_GST" | "NO_GST";
export type TaxSplitMode = "INTRA_STATE" | "INTER_STATE";
export type DiscountType = "NONE" | "AMOUNT" | "PERCENT";

export type LineInput = {
  mrp?: string | number;
  enteredPrice: string | number;
  quantity?: string | number;
  gstRate?: string | number;
  priceEntryMode: PriceEntryMode;
  taxSplitMode?: TaxSplitMode;
  discountType?: DiscountType;
  discountValue?: string | number;
};

export type LineTotals = {
  mrp: string;
  quantity: string;
  priceBeforeDiscount: string;
  discountAmount: string;
  taxableValue: string;
  gstRate: string;
  cgst: string;
  sgst: string;
  igst: string;
  totalGst: string;
  lineTotal: string;
};

const zero = new Decimal(0);

export function money(value: string | number | Decimal | undefined | null) {
  if (value === undefined || value === null || value === "") return zero;
  return new Decimal(value);
}

export function inr(value: string | number | Decimal) {
  return money(value).toDecimalPlaces(2).toFixed(2);
}

function discountFor(amount: Decimal, type: DiscountType, value: Decimal) {
  if (type === "AMOUNT") return Decimal.min(amount, Decimal.max(zero, value));
  if (type === "PERCENT") return Decimal.min(amount, amount.mul(Decimal.max(zero, value)).div(100));
  return zero;
}

export function calculateLine(input: LineInput): LineTotals {
  const quantity = Decimal.max(new Decimal("0.0001"), money(input.quantity ?? 1));
  const enteredPrice = money(input.enteredPrice);
  const rate = input.priceEntryMode === "NO_GST" ? zero : money(input.gstRate ?? 0);
  const mode = input.taxSplitMode ?? "INTRA_STATE";
  const priceBeforeDiscount = enteredPrice.mul(quantity);
  const discount = discountFor(priceBeforeDiscount, input.discountType ?? "NONE", money(input.discountValue ?? 0));
  const amountAfterDiscount = Decimal.max(zero, priceBeforeDiscount.minus(discount));

  let taxableValue = amountAfterDiscount;
  let totalGst = zero;
  let lineTotal = amountAfterDiscount;

  if (input.priceEntryMode === "INCLUDES_GST" && rate.gt(0)) {
    taxableValue = amountAfterDiscount.mul(100).div(new Decimal(100).plus(rate));
    totalGst = amountAfterDiscount.minus(taxableValue);
    lineTotal = amountAfterDiscount;
  }

  if (input.priceEntryMode === "EXCLUDES_GST" && rate.gt(0)) {
    totalGst = taxableValue.mul(rate).div(100);
    lineTotal = taxableValue.plus(totalGst);
  }

  const cgst = mode === "INTRA_STATE" ? totalGst.div(2) : zero;
  const sgst = mode === "INTRA_STATE" ? totalGst.div(2) : zero;
  const igst = mode === "INTER_STATE" ? totalGst : zero;

  return {
    mrp: inr(input.mrp ?? 0),
    quantity: quantity.toFixed(2),
    priceBeforeDiscount: inr(priceBeforeDiscount),
    discountAmount: inr(discount),
    taxableValue: inr(taxableValue),
    gstRate: rate.toFixed(2),
    cgst: inr(cgst),
    sgst: inr(sgst),
    igst: inr(igst),
    totalGst: inr(totalGst),
    lineTotal: inr(lineTotal)
  };
}

export function calculateInvoice(lines: LineInput[], payments: Array<string | number> = []) {
  const calculated = lines.map(calculateLine);
  const sum = (key: keyof LineTotals) => calculated.reduce((acc, line) => acc.plus(line[key]), zero);
  const grandTotal = sum("lineTotal");
  const amountPaid = payments.reduce((acc, payment) => acc.plus(payment), zero);

  return {
    lines: calculated,
    subtotal: inr(sum("priceBeforeDiscount")),
    totalDiscount: inr(sum("discountAmount")),
    totalTaxableValue: inr(sum("taxableValue")),
    totalCgst: inr(sum("cgst")),
    totalSgst: inr(sum("sgst")),
    totalIgst: inr(sum("igst")),
    totalGst: inr(sum("totalGst")),
    grandTotal: inr(grandTotal),
    amountPaid: inr(amountPaid),
    balanceDue: inr(Decimal.max(zero, grandTotal.minus(amountPaid)))
  };
}
