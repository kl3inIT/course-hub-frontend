import { StudentProfile } from "@/components/manager/student-profile"
import { ManagerSidebar } from "@/components/layout/manager-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  return (
    <SidebarProvider>
      <ManagerSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <StudentProfile studentId={params.id} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
