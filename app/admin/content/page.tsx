import { ContentManagement } from '@/components/admin/content-management'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { RoleGuard } from '@/components/auth/role-guard'

export default function AdminContentPage() {
  return (
    <RoleGuard allowedRoles={['admin']} redirectOnUnauthorized={true}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-3xl font-bold tracking-tight'>
                  Content Management
                </h2>
                <p className='text-muted-foreground'>
                  Create, edit, and manage platform content and media assets
                </p>
              </div>
            </div>
            <ContentManagement />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
