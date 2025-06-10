import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { RoleGuard } from '@/components/auth/role-guard'

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['admin']} redirectOnUnauthorized={true}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <AdminDashboard />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
