import { ReviewManagement } from '@/components/manager/review-management'
import { ManagerSidebar } from '@/components/layout/manager-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { RoleGuard } from '@/components/auth/role-guard'

export default function ManagerReviewsPage() {
  return (
    <RoleGuard
      allowedRoles={['manager', 'admin']}
      redirectOnUnauthorized={true}
    >
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <ReviewManagement />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
