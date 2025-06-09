import { CourseEditor } from "@/components/manager/course-editor"
import { ManagerSidebar } from "@/components/layout/manager-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RoleGuard } from "@/components/auth/role-guard"

export default function EditCoursePage({ params }: { params: { id: string } }) {
  return (
    <RoleGuard allowedRoles={["manager", "admin"]}>
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <CourseEditor courseId={params.id} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
