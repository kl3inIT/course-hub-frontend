'use client'
import { AnnouncementManagement } from '@/components/admin/announcement/announcement-management'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function AnnouncementsPage() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className='flex-1 space-y-4 p-8 pt-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>
                Announcement Management
              </h2>
              <p className='text-muted-foreground'>
                Manage and view all announcements in the system
              </p>
            </div>
          </div>
          <AnnouncementManagement />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
