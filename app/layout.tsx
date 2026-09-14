import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARSH ENTERPRISES Billing",
  description: "Billing, POS, inventory, invoice, customer, payment, and GST management for ARSH ENTERPRISES"
};

const nav = [
  ["Dashboard", "/dashboard"],
  ["New Bill", "/billing"],
  ["Invoices", "/invoices"],
  ["Payments", "/payments"],
  ["Customers", "/customers"],
  ["Products & Services", "/products"],
  ["Inventory", "/inventory"],
  ["Reports", "/reports"],
  ["Settings", "/settings"],
  ["Users and Roles", "/users"]
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen lg:flex">
          <aside className="app-shell border-r border-[var(--line)] bg-white px-4 py-5 lg:fixed lg:inset-y-0 lg:w-72">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image src="/arsh-enterprises-logo.png" alt="ARSH ENTERPRISES" width={52} height={52} className="h-13 w-auto object-contain" priority />
              <div>
                <div className="text-lg font-bold text-[var(--ink)]">ARSH ENTERPRISES</div>
                <div className="text-xs text-[var(--muted)]">GSTIN 29AIGPR1899C1ZU</div>
              </div>
            </Link>
            <nav className="mt-7 grid gap-1">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-900">
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="min-h-screen flex-1 lg:pl-72">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
