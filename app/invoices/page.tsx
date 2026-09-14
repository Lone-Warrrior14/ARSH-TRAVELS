"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { inr } from "@/lib/money";
import { useApi } from "@/app/useApi";

export default function InvoicesPage() {
  const { data: invoices, loading } = useApi<any[]>("/invoices?limit=50", []);

  if (loading) return <div className="p-8 text-gray-500">Loading invoices...</div>;
  return (
    <>
      <PageHeader title="Invoices" subtitle="Search, print, duplicate, cancel, refund, and record payments without changing finalized history." action={<Link href="/billing" className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white">New bill</Link>} />
      <div className="rounded-lg border border-[var(--line)] bg-white p-4">
        {invoices.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead><tr className="text-left text-gray-600"><th className="py-2">Invoice</th><th>Date</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-gray-100">
                    <td className="py-3 font-semibold">{invoice.invoiceNumber}</td>
                    <td>{new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</td>
                    <td>{invoice.customerName}</td>
                    <td>Rs. {inr(invoice.grandTotal.toString())}</td>
                    <td>Rs. {inr(invoice.amountPaid.toString())}</td>
                    <td>Rs. {inr(invoice.balanceDue.toString())}</td>
                    <td className="text-right">
                      <Link href={`/print?id=${invoice.id}`} target="_blank" className="text-teal-600 hover:underline font-medium text-sm">Print</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No invoices yet" body="Invoices will appear here after the first bill is finalized." />
        )}
      </div>
    </>
  );
}
