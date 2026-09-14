import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { fetchFromApi } from "@/lib/api";
import { inr } from "@/lib/money";

export default async function ReportsPage() {
  const [salesResponse, refundsResponse] = await Promise.all([
    fetchFromApi("/reports/invoices-agg"),
    fetchFromApi("/reports/refunds-agg")
  ]).catch(() => [null, null]);

  const sales = (salesResponse && salesResponse._sum) ? salesResponse : { _sum: { grandTotal: 0, totalGst: 0, totalDiscount: 0 } };
  const refunds = (refundsResponse && refundsResponse._sum) ? refundsResponse : { _sum: { amount: 0 } };
  return (
    <>
      <PageHeader title="Reports" subtitle="GST summary, daily sales, payment collection, staff performance, and tax exports." />
      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Total sales" value={`Rs. ${inr(String(sales._sum.grandTotal ?? 0))}`} />
        <KpiCard label="GST collected" value={`Rs. ${inr(String(sales._sum.totalGst ?? 0))}`} />
        <KpiCard label="Discounts" value={`Rs. ${inr(String(sales._sum.totalDiscount ?? 0))}`} />
        <KpiCard label="Refunds" value={`Rs. ${inr(String(refunds._sum.amount ?? 0))}`} />
      </section>
      <div className="mt-6 rounded-lg border border-[var(--line)] bg-white p-5 text-sm text-[var(--muted)]">
        Date, customer, category, payment method, CSV export, and print-friendly report controls are structured here for database-backed reporting.
      </div>
    </>
  );
}
