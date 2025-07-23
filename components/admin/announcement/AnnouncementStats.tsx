import { announcementApi } from '@/services/announcement-api'
import type { AnnouncementStats } from '@/types/announcement'
import { Clock, Edit, EyeOff, Send, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StatCard } from './StatCard'

export function AnnouncementStats({ reloadKey }: { reloadKey: number }) {
  const [stats, setStats] = useState<AnnouncementStats>({
    sent: 0,
    draft: 0,
    scheduled: 0,
    hidden: 0,
    cancelled: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    announcementApi
      .getAnnouncementStats()
      .then(res => {
        const data = res.data.data
        setStats({
          sent: data.sent || 0,
          draft: data.draft || 0,
          scheduled: data.scheduled || 0,
          hidden: data.hidden || 0,
          cancelled: data.cancelled || 0,
        })
      })
      .finally(() => setLoading(false))
  }, [reloadKey])

  return (
    <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 w-full'>
      <StatCard
        title='Sent'
        value={loading ? '-' : stats.sent}
        icon={<Send />}
        iconColor='text-blue-500'
        valueColor='text-blue-700'
      />
      <StatCard
        title='Draft'
        value={loading ? '-' : stats.draft}
        icon={<Edit />}
        iconColor='text-gray-500'
        valueColor='text-gray-700'
      />
      <StatCard
        title='Scheduled'
        value={loading ? '-' : stats.scheduled}
        icon={<Clock />}
        iconColor='text-yellow-500'
        valueColor='text-yellow-700'
      />
      <StatCard
        title='Hidden'
        value={loading ? '-' : stats.hidden}
        icon={<EyeOff />}
        iconColor='text-orange-500'
        valueColor='text-orange-700'
      />
      <StatCard
        title='Cancelled'
        value={loading ? '-' : stats.cancelled}
        icon={<X />}
        iconColor='text-red-500'
        valueColor='text-red-700'
      />
    </div>
  )
}
