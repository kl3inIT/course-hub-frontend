import { ManagerSidebar } from '@/components/layout/manager-sidebar'
import { ManagerAnalytics } from '@/components/manager/manager-analytics/manager-analytics'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { RoleGuard } from '@/components/auth/role-guard'

export default function ManagerAnalyticsPage() {
  return (
    <RoleGuard
      allowedRoles={['manager', 'admin']}
      redirectOnUnauthorized={true}
    >
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <ManagerAnalytics />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
