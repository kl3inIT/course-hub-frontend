import { ManagerAnalytics } from "@/components/manager/manager-analytics"
import { ManagerSidebar } from "@/components/layout/manager-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ManagerAnalyticsPage() {
  return (
    <SidebarProvider>
      <ManagerSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ManagerAnalytics />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
