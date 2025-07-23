'use client'

import OverviewDashboard from '@/components/admin/admin-dashboard'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']} requireAuth={true}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6 p-8 pt-6 bg-gray-50 min-h-screen">
            <OverviewDashboard />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
