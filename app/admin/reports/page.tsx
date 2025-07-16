import { ReportManagement } from '@/components/admin/report-management'
import { RoleGuard } from '@/components/auth/role-guard'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function ReportsPage() {
  return (
    <RoleGuard allowedRoles={['admin']} redirectOnUnauthorized={true}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <div className='flex items-center justify-between space-y-2'>
              <div>
                <h2 className='text-3xl font-bold tracking-tight'>
                  Report Management
                </h2>
                <p className='text-muted-foreground'>
                  Manage and view reports from the system
                </p>
              </div>
            </div>
            <ReportManagement />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
