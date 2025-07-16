import { ManagerCourseList } from '@/components/manager/manager-course/manager-course-list'
import { ManagerSidebar } from '@/components/layout/manager-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { RoleGuard } from '@/components/auth/role-guard'

export default function ManagerCoursesPage() {
  return (
    <RoleGuard
      allowedRoles={['manager', 'admin']}
      redirectOnUnauthorized={true}
    >
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <ManagerCourseList />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
