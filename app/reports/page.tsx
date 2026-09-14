"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { inr } from "@/lib/money";
import { useApi } from "@/app/useApi";

export default function ReportsPage() {
  const { data: salesResponse, loading: l1 } = useApi<any>("/reports/invoices-agg", null);
  const { data: refundsResponse, loading: l2 } = useApi<any>("/reports/refunds-agg", null);

  if (l1 || l2) return <div className="p-8 text-gray-500">Loading reports...</div>;

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
