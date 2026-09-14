"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchFromApi } from "@/lib/api";
import { inr } from "@/lib/money";

export default function PrintInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFromApi(`/invoices/${id}`).then((data) => {
      setInvoice(data);
      setLoading(false);
      // Automatically print after a short delay to allow images to load
      setTimeout(() => {
        window.print();
      }, 500);
    });
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="p-12 text-center text-red-500">Invoice not found.</div>;
  }

  return (
    <div className="w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white p-8 sm:p-12 text-sm text-gray-900 print:p-0 print:m-0 print:shadow-none font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
        <div className="flex flex-col">
          <img src="/arsh-enterprises-logo.png" alt="ARSH ENTERPRISES" className="h-16 object-contain object-left mb-2" style={{width: "auto"}} />
          <h1 className="text-xl font-bold font-serif uppercase tracking-wider">{invoice.businessName}</h1>
          <p className="text-gray-600 mt-1">GSTIN: <span className="font-semibold text-gray-900">{invoice.businessGstin}</span></p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-widest mb-2">TAX INVOICE</h2>
          <table className="w-full text-right mt-4">
            <tbody>
              <tr>
                <td className="text-gray-600 pr-4">Invoice No:</td>
                <td className="font-bold text-base">{invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td className="text-gray-600 pr-4">Date:</td>
                <td className="font-semibold">{new Date(invoice.invoiceDate).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8 p-4 bg-gray-50 rounded-sm border border-gray-200">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Billed To</h3>
        <p className="font-bold text-lg">{invoice.customerName}</p>
        {invoice.customerPhone && <p className="text-gray-700">Ph: {invoice.customerPhone}</p>}
        {invoice.customerGstin && <p className="text-gray-700 mt-1">GSTIN: <span className="font-semibold">{invoice.customerGstin}</span></p>}
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-gray-800 text-left text-xs uppercase tracking-wider">
            <th className="border border-gray-300 p-2 text-center w-12">#</th>
            <th className="border border-gray-300 p-2">Item Description</th>
            <th className="border border-gray-300 p-2 text-right">Qty</th>
            <th className="border border-gray-300 p-2 text-right">Rate</th>
            <th className="border border-gray-300 p-2 text-right">Discount</th>
            <th className="border border-gray-300 p-2 text-right">Taxable</th>
            <th className="border border-gray-300 p-2 text-right">GST %</th>
            <th className="border border-gray-300 p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item: any, i: number) => (
            <tr key={i} className="text-gray-800">
              <td className="border border-gray-300 p-2 text-center">{i + 1}</td>
              <td className="border border-gray-300 p-2 font-medium">{item.description}</td>
              <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
              <td className="border border-gray-300 p-2 text-right">{inr(item.mrp.toString())}</td>
              <td className="border border-gray-300 p-2 text-right">{inr(item.discountAmount.toString())}</td>
              <td className="border border-gray-300 p-2 text-right">{inr(item.taxableValue.toString())}</td>
              <td className="border border-gray-300 p-2 text-right">{item.gstRate}%</td>
              <td className="border border-gray-300 p-2 text-right font-semibold">{inr(item.lineTotal.toString())}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-1/2">
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 text-gray-600 font-semibold">Subtotal</td>
                <td className="border border-gray-300 p-2 text-right">{inr(invoice.subtotal.toString())}</td>
              </tr>
              {invoice.totalDiscount > 0 && (
                <tr>
                  <td className="border border-gray-300 p-2 text-gray-600 font-semibold">Total Discount</td>
                  <td className="border border-gray-300 p-2 text-right text-red-600">-{inr(invoice.totalDiscount.toString())}</td>
                </tr>
              )}
              <tr>
                <td className="border border-gray-300 p-2 text-gray-600 font-semibold">Taxable Value</td>
                <td className="border border-gray-300 p-2 text-right">{inr(invoice.totalTaxableValue.toString())}</td>
              </tr>
              {invoice.totalCgst > 0 && (
                <tr>
                  <td className="border border-gray-300 p-2 text-gray-600 font-semibold">CGST</td>
                  <td className="border border-gray-300 p-2 text-right">{inr(invoice.totalCgst.toString())}</td>
                </tr>
              )}
              {invoice.totalSgst > 0 && (
                <tr>
                  <td className="border border-gray-300 p-2 text-gray-600 font-semibold">SGST</td>
                  <td className="border border-gray-300 p-2 text-right">{inr(invoice.totalSgst.toString())}</td>
                </tr>
              )}
              {invoice.totalIgst > 0 && (
                <tr>
                  <td className="border border-gray-300 p-2 text-gray-600 font-semibold">IGST</td>
                  <td className="border border-gray-300 p-2 text-right">{inr(invoice.totalIgst.toString())}</td>
                </tr>
              )}
              <tr className="bg-gray-100">
                <td className="border border-gray-300 p-3 text-lg font-bold text-gray-900">Grand Total</td>
                <td className="border border-gray-300 p-3 text-right text-lg font-bold text-gray-900">Rs. {inr(invoice.grandTotal.toString())}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer & Signature */}
      <div className="mt-16 flex justify-between items-end text-sm">
        <div className="text-gray-500 text-xs max-w-xs">
          <p className="mb-1 font-semibold text-gray-600">Thank you for your business!</p>
          <p>This is a computer generated invoice.</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-48 border-b-2 border-dashed border-gray-300 mb-2 flex items-center justify-center">
            <span className="text-gray-300 text-xs italic">Place Seal / Stamp Here</span>
          </div>
          <p className="font-semibold text-gray-800">Authorized Signatory</p>
          <p className="text-xs text-gray-500 mt-1">For {invoice.businessName}</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
