import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

import { ProtectedRoute } from '@/components/auth/protected-route'
export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']} requireAuth={true}>

      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <AdminDashboard />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
