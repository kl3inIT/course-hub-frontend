import { ReviewManagement } from "@/components/manager/review-management"
import { ManagerSidebar } from "@/components/manager/manager-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ManagerReviewsPage() {
  return (
    <SidebarProvider>
      <ManagerSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ReviewManagement />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
