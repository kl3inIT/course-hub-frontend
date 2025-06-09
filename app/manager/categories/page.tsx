import { CategoryManagement } from "@/components/manager/category-management"
import { ManagerSidebar } from "@/components/layout/manager-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RoleGuard } from "@/components/auth/role-guard"

export default function ManagerCategoriesPage() {
  return (
    <RoleGuard allowedRoles={["manager", "admin"]}>
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <CategoryManagement />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
} 