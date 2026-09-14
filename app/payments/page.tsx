import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { SimpleTable } from "@/components/simple-table";
import { fetchFromApi } from "@/lib/api";
import { inr } from "@/lib/money";

export default async function PaymentsPage() {
  const payments = await fetchFromApi("/payments?limit=100") || [];
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
