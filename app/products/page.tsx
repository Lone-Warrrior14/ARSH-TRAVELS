"use client";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { SimpleTable } from "@/components/simple-table";
import { inr } from "@/lib/money";
import { useApi } from "@/app/useApi";

export default function ProductsPage() {
  const { data: products, loading } = useApi<any[]>("/products?limit=100", []);

  if (loading) return <div className="p-8 text-gray-500">Loading products...</div>;
  return (
    <>
      <PageHeader title="Products & Services" subtitle="Catalog for products, services, tickets, recharges, mobiles, stationery, online services, and custom categories." action={<button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Add item</button>} />
      {products.length ? (
        <SimpleTable
          columns={["Name", "SKU", "Type", "MRP", "Selling price", "GST", "Mode", "Stock"]}
          rows={products.map((product) => [
            product.name,
            product.sku ?? "-",
            product.itemType,
            `Rs. ${inr(product.mrp.toString())}`,
            `Rs. ${inr(product.sellingPrice.toString())}`,
            product.gstEnabled ? `${product.gstRate.toString()}%` : "No GST",
            product.priceEntryMode,
            product.inventoryTracked ? `${product.stockQuantity.toString()} ${product.unit}` : "Not tracked"
          ])}
        />
      ) : (
        <EmptyState title="No catalog items yet" body="Add products and services with MRP, selling price, GST mode, item type, unit, stock, and category settings." />
      )}
    </>
  );
}
