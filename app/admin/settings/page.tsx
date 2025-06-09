import { SystemSettings } from "@/components/admin/system-settings"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AdminSettingsPage() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
              <p className="text-muted-foreground">Configure platform settings, integrations, and system preferences</p>
            </div>
          </div>
          <SystemSettings />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
