'use client'
import { AnnouncementForm } from '@/components/admin/announcement/AnnouncementForm'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useRouter } from 'next/navigation'

export default function CreateAnnouncementPage() {
  const router = useRouter()
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className='py-10 flex flex-row items-start gap-8'>
          <div className='flex-shrink-0 pt-2 ml-8'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push('/admin/announcements')}
            >
              ← Back
            </Button>
          </div>
          <div className='flex-1 flex justify-center'>
            <Card className='w-full max-w-4xl shadow-xl border-0'>
              <CardHeader>
                <CardTitle className='text-2xl'>Create Announcement</CardTitle>
                <CardDescription>
                  Create and schedule a new announcement.
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-2 pb-10 px-8'>
                <AnnouncementForm
                  onSuccess={() => router.push('/admin/announcements')}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
