import { PageHeader } from "@/components/page-header";
import { SimpleTable } from "@/components/simple-table";
import { fetchFromApi } from "@/lib/api";

export default async function UsersPage() {
  const users = await fetchFromApi("/users?limit=100") || [];
  return (
    <>
      <PageHeader title="Users and Roles" subtitle="Admin-only role and permission management. Backend authorization must guard sensitive actions." />
      <SimpleTable columns={["Name", "Email", "Role", "Status"]} rows={users.map((user) => [user.name, user.email, user.role, user.active ? "Active" : "Inactive"])} />
    </>
  );
}
