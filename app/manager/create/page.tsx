import { CourseCreationForm } from "@/components/courses/course-creation-form"
import { ManagerSidebar } from "@/components/manager/manager-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RoleGuard } from "@/components/auth/role-guard"

export default function ManagerCreateCoursePage() {
  return (
    <RoleGuard allowedRoles={["manager", "admin"]}>
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Create New Course</h1>
                <p className="text-muted-foreground mt-2">
                  Share your knowledge with learners around the world. Create a comprehensive course with modules and
                  lessons.
                </p>
              </div>
              <CourseCreationForm />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
