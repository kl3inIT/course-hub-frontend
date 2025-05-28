import { StudentManagement } from "@/components/manager/student-management"
import { ManagerSidebar } from "@/components/manager/manager-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ManagerStudentsPage() {
  return (
    <SidebarProvider>
      <ManagerSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <StudentManagement />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
