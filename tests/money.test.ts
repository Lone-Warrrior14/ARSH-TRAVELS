import { describe, expect, it } from "vitest";
import { calculateInvoice, calculateLine } from "@/lib/money";

describe("GST and pricing engine", () => {
  it("separates inclusive GST without adding tax again", () => {
    const line = calculateLine({ enteredPrice: 1180, gstRate: 18, priceEntryMode: "INCLUDES_GST" });
    expect(line.taxableValue).toBe("1000.00");
    expect(line.totalGst).toBe("180.00");
    expect(line.cgst).toBe("90.00");
    expect(line.sgst).toBe("90.00");
    expect(line.lineTotal).toBe("1180.00");
  });

  it("adds GST for exclusive prices", () => {
    const line = calculateLine({ enteredPrice: 1000, gstRate: 18, priceEntryMode: "EXCLUDES_GST" });
    expect(line.taxableValue).toBe("1000.00");
    expect(line.totalGst).toBe("180.00");
    expect(line.lineTotal).toBe("1180.00");
  });

  it("uses IGST without CGST or SGST for interstate billing", () => {
    const line = calculateLine({ enteredPrice: 1180, gstRate: 18, priceEntryMode: "INCLUDES_GST", taxSplitMode: "INTER_STATE" });
    expect(line.taxableValue).toBe("1000.00");
    expect(line.igst).toBe("180.00");
    expect(line.cgst).toBe("0.00");
    expect(line.sgst).toBe("0.00");
    expect(line.lineTotal).toBe("1180.00");
  });

  it("does not calculate GST from MRP when selling price is different", () => {
    const line = calculateLine({ mrp: 1500, enteredPrice: 1180, gstRate: 18, priceEntryMode: "INCLUDES_GST" });
    expect(line.mrp).toBe("1500.00");
    expect(line.taxableValue).toBe("1000.00");
    expect(line.lineTotal).toBe("1180.00");
  });

  it("handles no GST mode", () => {
    const line = calculateLine({ enteredPrice: 500, gstRate: 18, priceEntryMode: "NO_GST" });
    expect(line.taxableValue).toBe("500.00");
    expect(line.totalGst).toBe("0.00");
    expect(line.lineTotal).toBe("500.00");
  });

  it("calculates GST on the discounted inclusive transaction amount", () => {
    const line = calculateLine({ mrp: 1500, enteredPrice: 1500, discountType: "AMOUNT", discountValue: 320, gstRate: 18, priceEntryMode: "INCLUDES_GST" });
    expect(line.discountAmount).toBe("320.00");
    expect(line.taxableValue).toBe("1000.00");
    expect(line.totalGst).toBe("180.00");
    expect(line.lineTotal).toBe("1180.00");
  });

  it("totals multiple items with mixed GST rates and partial payments", () => {
    const invoice = calculateInvoice(
      [
        { enteredPrice: 1180, gstRate: 18, priceEntryMode: "INCLUDES_GST" },
        { enteredPrice: 500, gstRate: 0, priceEntryMode: "NO_GST" },
        { enteredPrice: 100, quantity: 2, gstRate: 5, priceEntryMode: "EXCLUDES_GST" }
      ],
      [500]
    );
    expect(invoice.totalTaxableValue).toBe("1700.00");
    expect(invoice.totalGst).toBe("190.00");
    expect(invoice.grandTotal).toBe("1890.00");
    expect(invoice.balanceDue).toBe("1390.00");
  });
});
