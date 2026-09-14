import { calculateInvoice, calculateLine } from "./lib/money";

const checks: Array<[string, boolean]> = [];
const inclusive = calculateLine({ enteredPrice: 1180, gstRate: 18, priceEntryMode: "INCLUDES_GST" });
checks.push(["inclusive taxable", inclusive.taxableValue === "1000.00"]);
checks.push(["inclusive gst", inclusive.totalGst === "180.00"]);
checks.push(["inclusive cgst", inclusive.cgst === "90.00"]);
checks.push(["inclusive sgst", inclusive.sgst === "90.00"]);
checks.push(["inclusive total", inclusive.lineTotal === "1180.00"]);

const exclusive = calculateLine({ enteredPrice: 1000, gstRate: 18, priceEntryMode: "EXCLUDES_GST" });
checks.push(["exclusive total", exclusive.lineTotal === "1180.00"]);

const interstate = calculateLine({ enteredPrice: 1180, gstRate: 18, priceEntryMode: "INCLUDES_GST", taxSplitMode: "INTER_STATE" });
checks.push(["igst only", interstate.igst === "180.00" && interstate.cgst === "0.00" && interstate.sgst === "0.00"]);

const noGst = calculateLine({ enteredPrice: 500, gstRate: 18, priceEntryMode: "NO_GST" });
checks.push(["no gst", noGst.lineTotal === "500.00" && noGst.totalGst === "0.00"]);

const mixed = calculateInvoice(
  [
    { enteredPrice: 1180, gstRate: 18, priceEntryMode: "INCLUDES_GST" },
    { enteredPrice: 500, priceEntryMode: "NO_GST" },
    { enteredPrice: 100, quantity: 2, gstRate: 5, priceEntryMode: "EXCLUDES_GST" }
  ],
  [500]
);
checks.push(["mixed total", mixed.grandTotal === "1890.00"]);
checks.push(["partial balance", mixed.balanceDue === "1390.00"]);

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(failed.map(([name]) => name).join(", "));
  process.exit(1);
}

console.log("GST checks passed");
