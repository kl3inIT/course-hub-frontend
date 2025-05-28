import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { RoleGuard } from "@/components/auth/role-guard"

export default function AdminAnalyticsPage() {
  return (
    <RoleGuard allowedRoles={["admin"]} redirectOnUnauthorized={true}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
                <p className="text-muted-foreground">
                  Comprehensive insights into platform performance and user behavior
                </p>
              </div>
            </div>
            <AnalyticsDashboard />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
