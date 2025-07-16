import { CourseEditor } from '@/components/manager/manager-course/course-editor'
import { ManagerSidebar } from '@/components/layout/manager-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { RoleGuard } from '@/components/auth/role-guard'

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <RoleGuard allowedRoles={['manager', 'admin']}>
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <CourseEditor courseId={id} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
