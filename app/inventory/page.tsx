"use client";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { SimpleTable } from "@/components/simple-table";
import { useApi } from "@/app/useApi";

export default function InventoryPage() {
  const { data: products, loading } = useApi<any[]>("/products?limit=100", []);

  if (loading) return <div className="p-8 text-gray-500">Loading inventory...</div>;
  return (
    <>
      <PageHeader title="Inventory" subtitle="Optional stock tracking, movement history, IMEI/serial metadata, low-stock alerts, and invoice stock reversal." />
      {products.length ? (
        <SimpleTable columns={["Item", "SKU", "Current stock", "Minimum stock", "Status"]} rows={products.map((product) => [product.name, product.sku ?? "-", `${product.stockQuantity.toString()} ${product.unit}`, product.minimumStockLevel.toString(), Number(product.stockQuantity) <= Number(product.minimumStockLevel) ? "Low stock" : "OK"])} />
      ) : (
        <EmptyState title="No inventory-tracked items" body="Services, recharges, and tickets stay free of stock tracking unless an item explicitly enables inventory." />
      )}
    </>
  );
}
