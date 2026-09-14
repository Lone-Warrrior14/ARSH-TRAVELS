export type RoleName = "ADMIN" | "MANAGER" | "STAFF";

const rolePermissions: Record<RoleName, string[]> = {
  ADMIN: ["*"],
  MANAGER: ["dashboard.read", "billing.write", "invoice.read", "payment.write", "customer.write", "product.write", "inventory.write", "report.read"],
  STAFF: ["billing.write", "customer.read", "product.read", "invoice.basic", "payment.write"]
};

export function can(role: RoleName, permission: string) {
  const permissions = rolePermissions[role] ?? [];
  return permissions.includes("*") || permissions.includes(permission);
}
