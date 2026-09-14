"use client";

import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { EmptyState } from "@/components/empty-state";
import { inr } from "@/lib/money";
import { useApi } from "@/app/useApi";

export default function DashboardPage() {
  const { data: invoices, loading: loading1 } = useApi<any[]>("/invoices?limit=6", []);
  const { data: payments, loading: loading2 } = useApi<any[]>("/payments?limit=100", []);
  const { data: lowStock, loading: loading3 } = useApi<any[]>("/products?limit=5", []);

  if (loading1 || loading2 || loading3) return <div className="p-8 text-gray-500">Loading dashboard...</div>;

  const sales = invoices.reduce((acc, invoice) => acc + Number(invoice.grandTotal), 0);
  const collected = payments.reduce((acc, payment) => acc + Number(payment.amount), 0);
  const outstanding = invoices.reduce((acc, invoice) => acc + Number(invoice.balanceDue), 0);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Daily sales, collections, stock alerts, GST and recent activity." />
      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Today's sales" value={`Rs. ${inr(sales)}`} detail={`${invoices.length} invoice(s)`} />
        <KpiCard label="Today's collections" value={`Rs. ${inr(collected)}`} />
        <KpiCard label="Outstanding today" value={`Rs. ${inr(outstanding)}`} />
      </section>
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--line)] bg-white p-4">
          <h2 className="font-semibold">Recent invoices</h2>
          {invoices.length ? (
            <div className="mt-4 divide-y divide-gray-100">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 text-sm">
                  <span>{invoice.invoiceNumber}</span>
                  <span className="font-semibold">Rs. {inr(invoice.grandTotal.toString())}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4"><EmptyState title="No invoices today" body="Create a bill and the dashboard will update from database records." /></div>
          )}
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-white p-4">
          <h2 className="font-semibold">Low-stock products</h2>
          {lowStock.length ? (
            <div className="mt-4 divide-y divide-gray-100">
              {lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-3 text-sm">
                  <span>{product.name}</span>
                  <span>{product.stockQuantity.toString()} {product.unit}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4"><EmptyState title="No stock alerts" body="Inventory-enabled products with low quantities will appear here." /></div>
          )}
        </div>
      </section>
    </>
  );
}
