import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { SimpleTable } from "@/components/simple-table";
import { fetchFromApi } from "@/lib/api";

export default async function CustomersPage() {
  const customers = await fetchFromApi("/customers?limit=100") || [];
  return (
    <>
      <PageHeader title="Customers" subtitle="Customer profiles, phone search, GSTIN, invoice history, payments, and outstanding balances." action={<button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Add customer</button>} />
      {customers.length ? (
        <div className="mt-6">
          <SimpleTable columns={["Name", "Phone", "GSTIN", "Type", "Created"]} rows={customers.map((customer) => [customer.name, customer.phone ?? "-", customer.gstin ?? "-", customer.customerType, new Date(customer.createdAt).toLocaleDateString("en-IN")])} />
        </div>
      ) : (
        <EmptyState title="No customers yet" body="The POS can use Walk-in Customer, while named customers can store GSTIN, address, payments, and history." />
      )}
    </>
  );
}
