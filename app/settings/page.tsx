import { PageHeader } from "@/components/page-header";
import { BUSINESS } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Business, tax, catalog, payment method, invoice numbering, and role settings." />
      <form className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-5 md:grid-cols-2">
        <label className="text-sm font-medium">Business name<input defaultValue={BUSINESS.name} className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2" /></label>
        <label className="text-sm font-medium">GSTIN<input defaultValue={BUSINESS.gstin} className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2" /></label>
        <label className="text-sm font-medium md:col-span-2">Address<textarea defaultValue={BUSINESS.address} className="mt-2 min-h-24 w-full rounded-md border border-gray-300 px-3 py-2" /></label>
        <label className="text-sm font-medium">Default GST rate<select defaultValue="18" className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"><option>0</option><option>5</option><option>12</option><option>18</option><option>28</option></select></label>
        <label className="text-sm font-medium">Default tax mode<select defaultValue="INCLUDES_GST" className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"><option value="INCLUDES_GST">Price includes GST</option><option value="EXCLUDES_GST">Price excludes GST</option><option value="NO_GST">No GST</option></select></label>
        <p className="md:col-span-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Logo is fixed at public/arsh-enterprises-logo.png and intentionally has no upload, replace, or delete control.</p>
      </form>
    </>
  );
}
