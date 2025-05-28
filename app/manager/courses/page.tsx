import { ManagerCourseList } from "@/components/manager/manager-course-list"
import { ManagerSidebar } from "@/components/manager/manager-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ManagerCoursesPage() {
  return (
    <SidebarProvider>
      <ManagerSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ManagerCourseList />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
