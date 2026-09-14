"use client";

import { PageHeader } from "@/components/page-header";
import { SimpleTable } from "@/components/simple-table";
import { useApi } from "@/app/useApi";

export default function UsersPage() {
  const { data: users, loading } = useApi<any[]>("/users?limit=100", []);

  if (loading) return <div className="p-8 text-gray-500">Loading users...</div>;
  return (
    <>
      <PageHeader title="Users and Roles" subtitle="Admin-only role and permission management. Backend authorization must guard sensitive actions." />
      <SimpleTable columns={["Name", "Email", "Role", "Status"]} rows={users.map((user) => [user.name, user.email, user.role, user.active ? "Active" : "Inactive"])} />
    </>
  );
}
