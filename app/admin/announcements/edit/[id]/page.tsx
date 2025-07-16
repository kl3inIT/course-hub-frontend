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
import { announcementApi } from '@/services/announcement-api'
import { Announcement } from '@/types/announcement'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditAnnouncementPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>
}) {
  const router = useRouter()
  let id: string
  if (typeof (params as any).then === 'function') {
    id = React.use(params).id
  } else {
    id = (params as { id: string }).id
  }
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await announcementApi.getAnnouncementById(id)
        console.log('Announcement detail API response:', response)
        console.log('response.data:', response.data)
        console.log('response.data.data:', response.data?.data)
        setAnnouncement(response.data.data)
      } catch (error) {
        toast.error('Failed to load announcement')
        router.push('/admin/announcements')
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncement()
  }, [id, router])

  if (loading) {
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
                <CardContent className='py-12 px-12'>
                  <div className='text-center'>Loading...</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!announcement) {
    return null
  }

  const initialData = {
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    targetGroup: announcement.targetGroup,
    link: announcement.link,
    scheduledTime: announcement.scheduledTime,
    isScheduled: !!announcement.scheduledTime,
    isPersonalized: false,
    personalizedRecipients: [],
    attachments: [],
    createdByName: announcement.createdByName,
    sentTime: announcement.sentTime,
    isDeleted: announcement.isDeleted,
  }

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
                <CardTitle className='text-2xl'>Edit Announcement</CardTitle>
                <CardDescription>
                  Edit and manage your announcement.
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-2 pb-10 px-8'>
                <AnnouncementForm
                  onSuccess={() => router.push('/admin/announcements')}
                  initialData={initialData}
                  announcementId={id}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
