"use client";

import { useState, useEffect } from "react";
import { calculateInvoice, LineInput, PriceEntryMode } from "@/lib/money";
import { fetchFromApi } from "@/lib/api";

export function PosEngine() {
  const [items, setItems] = useState<any[]>([]);
  const [payments, setPayments] = useState<{amount: number, method: string}[]>([]);
  const [customerName, setCustomerName] = useState("");

  const [finalizedInvoiceId, setFinalizedInvoiceId] = useState<string | null>(null);

  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchFromApi("/products?limit=500").then(data => {
      setAvailableProducts(data || []);
    });
  }, []);

  const addItem = () => {
    setItems([...items, {
      id: Math.random().toString(),
      name: "New Item",
      mrp: 100,
      enteredPrice: 100,
      quantity: 1,
      gstRate: 18,
      priceEntryMode: "INCLUDES_GST" as PriceEntryMode,
      discountType: "NONE",
      discountValue: 0
    }]);
  };

  const addSavedProduct = (productId: string) => {
    if (!productId) return;
    const product = availableProducts.find(p => p.id === productId);
    if (product) {
      setItems([...items, {
        id: Math.random().toString(),
        name: product.name,
        mrp: Number(product.mrp),
        enteredPrice: Number(product.sellingPrice),
        quantity: 1,
        gstRate: Number(product.gstRate),
        priceEntryMode: product.priceEntryMode as PriceEntryMode,
        discountType: "NONE",
        discountValue: 0
      }]);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const totals = calculateInvoice(items, payments.map(p => p.amount));

  const handleCheckout = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerName,
          payments,
          taxSplitMode: "INTER_STATE",
          totals
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFinalizedInvoiceId(data.id);
        setItems([]);
        setPayments([]);
      } else {
        alert("Failed to create invoice.");
      }
    } catch (e) {
      alert("Error checking out.");
    }
  };

  if (finalizedInvoiceId) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-12 mt-12 bg-white rounded-lg border shadow-sm">
        <div className="text-teal-600 text-6xl">✓</div>
        <h1 className="text-3xl font-bold">Invoice Finalized Successfully!</h1>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => window.open(`/print?id=${finalizedInvoiceId}`, '_blank')}
            className="flex-1 rounded-md bg-teal-600 px-4 py-2 text-white font-medium hover:bg-teal-700"
          >
            Print Invoice
          </button>
          <button 
            className="rounded-md bg-gray-100 px-6 py-3 text-lg font-semibold text-gray-800 hover:bg-gray-200"
            onClick={() => setFinalizedInvoiceId(null)}
          >
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold">New Bill</h1>
      
      <div className="flex gap-4 mb-4 items-center">
        <input 
          type="text" 
          placeholder="Customer Name (Walk-in)" 
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <select 
          onChange={(e) => {
            addSavedProduct(e.target.value);
            e.target.value = ""; // Reset selector
          }} 
          className="border p-2 rounded bg-white text-gray-800"
          defaultValue=""
        >
          <option value="" disabled>Search & Select Saved Product...</option>
          {availableProducts.map(p => (
            <option key={p.id} value={p.id}>{p.name} (Rs. {p.sellingPrice})</option>
          ))}
        </select>
        <button onClick={addItem} className="bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
          + Custom Item
        </button>
      </div>

      <div className="border rounded">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Item Name</th>
              <th className="p-2">MRP</th>
              <th className="p-2">Price</th>
              <th className="p-2">Qty</th>
              <th className="p-2">GST Rate</th>
              <th className="p-2">Mode</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">
                  <input value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} className="border p-1 w-full" />
                </td>
                <td className="p-2">
                  <input type="number" value={item.mrp} onChange={(e) => updateItem(idx, "mrp", Number(e.target.value))} className="border p-1 w-20" />
                </td>
                <td className="p-2">
                  <input type="number" value={item.enteredPrice} onChange={(e) => updateItem(idx, "enteredPrice", Number(e.target.value))} className="border p-1 w-24" />
                </td>
                <td className="p-2">
                  <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} className="border p-1 w-16" />
                </td>
                <td className="p-2">
                  <select value={item.gstRate} onChange={(e) => updateItem(idx, "gstRate", Number(e.target.value))} className="border p-1">
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </td>
                <td className="p-2">
                  <select value={item.priceEntryMode} onChange={(e) => updateItem(idx, "priceEntryMode", e.target.value)} className="border p-1">
                    <option value="INCLUDES_GST">Includes GST</option>
                    <option value="EXCLUDES_GST">Excludes GST</option>
                    <option value="NO_GST">No GST</option>
                  </select>
                </td>
                <td className="p-2 font-mono">₹{totals.lines[idx]?.lineTotal || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4 text-right">
        <div className="w-64 bg-gray-50 p-4 rounded border">
          <div className="flex justify-between mb-2"><span>Subtotal:</span> <span>₹{totals.subtotal}</span></div>
          <div className="flex justify-between mb-2"><span>Taxable:</span> <span>₹{totals.totalTaxableValue}</span></div>
          <div className="flex justify-between mb-2"><span>CGST:</span> <span>₹{totals.totalCgst}</span></div>
          <div className="flex justify-between mb-2"><span>SGST:</span> <span>₹{totals.totalSgst}</span></div>
          <div className="flex justify-between mb-4 font-bold text-xl border-t pt-2"><span>Grand Total:</span> <span>₹{totals.grandTotal}</span></div>
          
          <button onClick={handleCheckout} className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-bold text-lg hover:bg-green-700">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
