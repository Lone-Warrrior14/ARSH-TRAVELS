import Image from "next/image";
import { BUSINESS } from "@/lib/constants";
import { calculateInvoice, type LineInput } from "@/lib/money";

export type InvoicePreviewData = {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerAddress?: string;
  customerGstin?: string;
  customerPhone?: string;
  vehicleNo?: string;
  lines: Array<LineInput & { description: string; hsnCode?: string }>;
  amountPaid?: string | number;
  footer?: string;
};

export function ReferenceInvoice({ data }: { data: InvoicePreviewData }) {
  const totals = calculateInvoice(data.lines, data.amountPaid ? [data.amountPaid] : []);

  // Assuming a single GST rate for simplicity to show in the "Add: SGST @ X%" label
  // Since mixed rates can exist, this logic would ideally group by rate, but we'll show the primary rate for now.
  const primaryGstRate = totals.lines.find(l => Number(l.gstRate) > 0)?.gstRate || "0";
  const sgstRate = (Number(primaryGstRate) / 2).toString();
  const cgstRate = (Number(primaryGstRate) / 2).toString();

  return (
    <article className="print-surface mx-auto bg-white p-8 text-black shadow-sm" style={{ width: "210mm", minHeight: "297mm", fontFamily: "sans-serif" }}>
      <header className="border-b-2 border-black pb-4 text-center relative flex flex-col items-center justify-center">
        <Image src={BUSINESS.logoPath} alt="ARSH ENTERPRISES logo" width={160} height={160} className="h-32 w-auto object-contain" priority />
      </header>

      <div className="flex justify-center my-2">
        <h1 className="text-xl font-bold text-blue-900 px-6 uppercase tracking-wider">TAX INVOICE</h1>
      </div>

      <section className="bg-blue-100 text-center pb-2 pt-1 border border-black mb-1">
        <h2 className="text-2xl font-bold uppercase">{BUSINESS.name}</h2>
        <p className="mt-1 text-sm font-medium">{BUSINESS.address}</p>
        <div className="mt-2 flex justify-between px-6 text-sm font-bold">
          <span>Email: {BUSINESS.email || "-"}</span>
          <span>Mob. No.: {BUSINESS.phone || "-"}</span>
        </div>
        <p className="mt-2 text-sm font-bold uppercase">GST NO.: {BUSINESS.gstin}</p>
      </section>

      <section className="grid grid-cols-[60%_40%] border-x border-b border-black text-sm">
        <div className="min-h-24 border-r border-black p-2 flex flex-col gap-1">
          <p><b>To,</b> {data.customerName}</p>
          <p><b>SITE:</b> {data.customerAddress || ""}</p>
          <p><b>GST:</b> {data.customerGstin || ""}</p>
        </div>
        <div className="p-2 flex flex-col gap-1 font-bold">
          <p>Invoice No.: <span className="text-red-600 font-bold">{data.invoiceNumber}</span></p>
          <p>Invoice Date: {data.invoiceDate}</p>
          <p>Vehicle No.: {data.vehicleNo || "-"}</p>
        </div>
      </section>

      <table className="w-full border-collapse border border-black text-sm text-center">
        <thead>
          <tr className="bg-blue-100 border-b border-black">
            <th className="border-r border-black px-1 py-1 font-bold w-12">S.N.</th>
            <th className="border-r border-black px-2 py-1 font-bold">DESCRIPTION</th>
            <th className="border-r border-black px-2 py-1 font-bold w-24">HSN CODE</th>
            <th className="border-r border-black px-2 py-1 font-bold w-16">QTY</th>
            <th className="border-r border-black px-2 py-1 font-bold w-24">RATE</th>
            <th className="px-2 py-1 font-bold w-28">AMOUNT</th>
          </tr>
        </thead>
        <tbody className="align-top">
          {data.lines.map((line, index) => {
            const calculated = totals.lines[index];
            return (
              <tr key={index} className="border-b border-black h-8">
                <td className="border-r border-black px-1 py-1">{index + 1}</td>
                <td className="border-r border-black px-2 py-1 text-left">{line.description}</td>
                <td className="border-r border-black px-2 py-1">{line.hsnCode || ""}</td>
                <td className="border-r border-black px-2 py-1 text-right">{calculated.quantity}</td>
                <td className="border-r border-black px-2 py-1 text-right">{calculated.priceBeforeDiscount}</td>
                <td className="px-2 py-1 text-right">{calculated.lineTotal}</td>
              </tr>
            );
          })}
          {/* Fill blank rows */}
          {Array.from({ length: Math.max(0, 5 - data.lines.length) }).map((_, index) => (
            <tr key={`blank-${index}`} className="border-b border-black h-8">
              <td className="border-r border-black px-1 py-1">&nbsp;</td>
              <td className="border-r border-black px-2 py-1 text-left"></td>
              <td className="border-r border-black px-2 py-1"></td>
              <td className="border-r border-black px-2 py-1 text-right"></td>
              <td className="border-r border-black px-2 py-1 text-right"></td>
              <td className="px-2 py-1 text-right"></td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="ml-auto w-full text-sm border-x border-b border-black">
        <div className="grid grid-cols-[1fr_8rem] border-b border-black">
          <div className="px-3 py-1.5 text-right font-bold border-r border-black">Total Taxable Amount</div>
          <div className="px-3 py-1.5 text-right font-bold">{totals.totalTaxableValue}</div>
        </div>
        
        {Number(totals.totalSgst) > 0 && (
          <div className="grid grid-cols-[1fr_8rem] border-b border-black">
            <div className="px-3 py-1.5 text-right font-bold border-r border-black">Add: SGST @ {sgstRate}%</div>
            <div className="px-3 py-1.5 text-right font-bold">{totals.totalSgst}</div>
          </div>
        )}
        
        {Number(totals.totalCgst) > 0 && (
          <div className="grid grid-cols-[1fr_8rem] border-b border-black">
            <div className="px-3 py-1.5 text-right font-bold border-r border-black">Add: CGST @ {cgstRate}%</div>
            <div className="px-3 py-1.5 text-right font-bold">{totals.totalCgst}</div>
          </div>
        )}

        {Number(totals.totalIgst) > 0 && (
          <div className="grid grid-cols-[1fr_8rem] border-b border-black">
            <div className="px-3 py-1.5 text-right font-bold border-r border-black">Add: IGST @ {primaryGstRate}%</div>
            <div className="px-3 py-1.5 text-right font-bold">{totals.totalIgst}</div>
          </div>
        )}

        <div className="grid grid-cols-[1fr_8rem] border-b border-black">
          <div className="px-3 py-1.5 text-right font-bold border-r border-black">Round Off (R/O)</div>
          <div className="px-3 py-1.5 text-right font-bold">0.00</div>
        </div>
        
        <div className="grid grid-cols-[1fr_8rem]">
          <div className="px-3 py-1.5 text-right font-bold border-r border-black">Grand Total Amount</div>
          <div className="px-3 py-1.5 text-right font-bold text-base">{totals.grandTotal}</div>
        </div>
      </section>

      <footer className="mt-6 flex justify-between text-sm border-t border-black pt-4">
        <div className="font-bold flex-1">
          Amount in Words: Rupees {totals.grandTotal} Only
        </div>
        <div className="text-right flex-1 flex flex-col justify-end">
          <p className="font-bold mb-16 uppercase">For {BUSINESS.name}</p>
          <p className="font-bold">Authorised Signatory</p>
        </div>
      </footer>
    </article>
  );
}
