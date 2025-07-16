import { RoleGuard } from '@/components/auth/role-guard'
import { ManagerSidebar } from '@/components/layout/manager-sidebar'
import { ManagerDashboard } from '@/components/manager/manager-dashboard'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function ManagerPage() {
  return (
    <RoleGuard
      allowedRoles={['manager', 'admin']}
      redirectOnUnauthorized={true}
    >
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <ManagerDashboard />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
