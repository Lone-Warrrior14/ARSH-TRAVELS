"use client";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { SimpleTable } from "@/components/simple-table";
import { inr } from "@/lib/money";
import { useApi } from "@/app/useApi";

export default function PaymentsPage() {
  const { data: payments, loading } = useApi<any[]>("/payments?limit=100", []);

  if (loading) return <div className="p-8 text-gray-500">Loading payments...</div>;
  return (
    <>
      <PageHeader title="Payments" subtitle="Record full payments, partial payments, multiple collections, references, refunds, and history." />
      {payments.length ? (
        <SimpleTable columns={["Date", "Invoice", "Method", "Amount", "Reference"]} rows={payments.map((payment) => [new Date(payment.paidAt).toLocaleString("en-IN"), payment.invoice?.invoiceNumber ?? "-", payment.method, `Rs. ${inr(payment.amount.toString())}`, payment.reference ?? "-"])} />
      ) : (
        <EmptyState title="No payments yet" body="Payment and refund records are append-only so old collections are never overwritten." />
      )}
    </>
  );
}
