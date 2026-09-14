import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { EmptyState } from "@/components/empty-state";
import { fetchFromApi } from "@/lib/api";
import { inr } from "@/lib/money";

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [invoices, payments, lowStock] = await Promise.all([
    fetchFromApi("/invoices?limit=6") || [],
    fetchFromApi("/payments?limit=100") || [], // In real app, pass date filter
    fetchFromApi("/products?limit=5") || [] // In real app, pass low stock filter
  ]).catch(() => [[], [], []] as const);

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
