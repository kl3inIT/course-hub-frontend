import { announcementApi } from '@/services/announcement-api'
import { Clock, Edit, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { StatCard } from './StatCard'

export function AnnouncementStats() {
  const [stats, setStats] = useState({ sent: 0, draft: 0, scheduled: 0 })
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
        })
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 w-full'>
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
    </div>
  )
}
