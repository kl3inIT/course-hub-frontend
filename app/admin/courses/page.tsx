import { AdminCourseManagement } from "@/components/admin/admin-course-management"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AdminCoursesPage() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Course Management</h2>
              <p className="text-muted-foreground">Review, approve, and manage all courses on the platform</p>
            </div>
          </div>
          <AdminCourseManagement />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
