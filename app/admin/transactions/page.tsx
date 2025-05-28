import { TransactionManagement } from "@/components/admin/transaction-management"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RoleGuard } from "@/components/auth/role-guard"

export default function TransactionsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]} redirectOnUnauthorized={true}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <TransactionManagement />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
