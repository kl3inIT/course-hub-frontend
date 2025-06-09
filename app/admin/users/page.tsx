import { UserManagement } from "@/components/admin/user-management"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AdminUsersPage() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
              <p className="text-muted-foreground">Manage all users, roles, and permissions across the platform</p>
            </div>
          </div>
          <UserManagement />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
