import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AnnouncementHistory } from './AnnouncementHistory'
import { AnnouncementList, HiddenAnnouncementList } from './AnnouncementList'
import { AnnouncementStats } from './AnnouncementStats'

export function AnnouncementManagement() {
  const router = useRouter()
  // Example stats, replace with real data
  const stats = { sent: 10, draft: 3, scheduled: 2 }
  // Tách filter cho từng tab
  const [listFilters, setListFilters] = useState({
    search: '',
    type: 'ALL',
    status: 'ALL',
  })
  const [historyFilters, setHistoryFilters] = useState({
    search: '',
    type: 'ALL',
    status: 'ALL',
  })
  const [hiddenFilters, setHiddenFilters] = useState({
    search: '',
    type: 'ALL',
  })
  const [tab, setTab] = useState('list')

  // Handler cho từng tab
  const handleListFilterChange = (key: string, value: string) => {
    setListFilters(prev => ({ ...prev, [key]: value }))
  }
  const handleHistoryFilterChange = (key: string, value: string) => {
    setHistoryFilters(prev => ({ ...prev, [key]: value }))
  }
  const handleHiddenFilterChange = (key: string, value: string) => {
    setHiddenFilters(prev => ({ ...prev, [key]: value }))
  }
  const clearListFilters = () =>
    setListFilters({ search: '', type: 'ALL', status: 'ALL' })
  const clearHistoryFilters = () =>
    setHistoryFilters({ search: '', type: 'ALL', status: 'ALL' })
  const clearHiddenFilters = () => setHiddenFilters({ search: '', type: 'ALL' })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Announcement Overview</CardTitle>
        <CardDescription>
          Overview of all announcements in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats - stretch horizontally */}
        <div className='flex gap-4 mb-4'>
          <div className='flex-1'>
            <AnnouncementStats />
          </div>
        </div>
        {/* Create Button */}
        <div className='mb-6 flex justify-end'>
          <Button onClick={() => router.push('/admin/announcements/create')}>
            + Create Announcement
          </Button>
        </div>
        {/* Tabs for List, History & Hidden */}
        <Tabs value={tab} onValueChange={setTab} className='w-full'>
          <TabsList className='mb-4'>
            <TabsTrigger value='list'>All Announcements</TabsTrigger>
            <TabsTrigger value='history'>History</TabsTrigger>
            <TabsTrigger value='hidden'>Hidden</TabsTrigger>
          </TabsList>
          <TabsContent value='list'>
            {/* Filters */}
            <div className='mb-4 flex flex-wrap items-center gap-4'>
              <input
                className='border rounded px-3 py-2'
                placeholder='Search announcements...'
                value={listFilters.search}
                onChange={e => handleListFilterChange('search', e.target.value)}
              />
              <select
                className='border rounded px-3 py-2'
                value={listFilters.type}
                onChange={e => handleListFilterChange('type', e.target.value)}
              >
                <option value='ALL'>All Types</option>
                <option value='GENERAL'>General</option>
                <option value='COURSE_UPDATE'>Course Update</option>
                <option value='SYSTEM_MAINTENANCE'>System Maintenance</option>
                <option value='PROMOTION'>Promotion</option>
                <option value='EMERGENCY'>Emergency</option>
              </select>
              <select
                className='border rounded px-3 py-2'
                value={listFilters.status}
                onChange={e => handleListFilterChange('status', e.target.value)}
              >
                <option value='ALL'>All Statuses</option>
                <option value='DRAFT'>Draft</option>
                <option value='SCHEDULED'>Scheduled</option>
              </select>
              {(listFilters.search ||
                listFilters.type !== 'ALL' ||
                listFilters.status !== 'ALL') && (
                <Button variant='outline' onClick={clearListFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
            <AnnouncementList filters={listFilters} />
          </TabsContent>
          <TabsContent value='history'>
            {/* Filters */}
            <div className='mb-4 flex flex-wrap items-center gap-4'>
              <input
                className='border rounded px-3 py-2'
                placeholder='Search announcements...'
                value={historyFilters.search}
                onChange={e =>
                  handleHistoryFilterChange('search', e.target.value)
                }
              />
              <select
                className='border rounded px-3 py-2'
                value={historyFilters.type}
                onChange={e =>
                  handleHistoryFilterChange('type', e.target.value)
                }
              >
                <option value='ALL'>All Types</option>
                <option value='GENERAL'>General</option>
                <option value='COURSE_UPDATE'>Course Update</option>
                <option value='SYSTEM_MAINTENANCE'>System Maintenance</option>
                <option value='PROMOTION'>Promotion</option>
                <option value='EMERGENCY'>Emergency</option>
              </select>
              <select
                className='border rounded px-3 py-2'
                value={historyFilters.status}
                onChange={e =>
                  handleHistoryFilterChange('status', e.target.value)
                }
              >
                <option value='ALL'>All Statuses</option>
                <option value='SENT'>Sent</option>
                <option value='CANCELLED'>Cancelled</option>
              </select>
              {(historyFilters.search ||
                historyFilters.type !== 'ALL' ||
                historyFilters.status !== 'ALL') && (
                <Button variant='outline' onClick={clearHistoryFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
            <AnnouncementHistory filters={historyFilters} />
          </TabsContent>
          <TabsContent value='hidden'>
            {/* Filters */}
            <div className='mb-4 flex flex-wrap items-center gap-4'>
              <input
                className='border rounded px-3 py-2'
                placeholder='Search hidden announcements...'
                value={hiddenFilters.search}
                onChange={e =>
                  handleHiddenFilterChange('search', e.target.value)
                }
              />
              <select
                className='border rounded px-3 py-2'
                value={hiddenFilters.type}
                onChange={e => handleHiddenFilterChange('type', e.target.value)}
              >
                <option value='ALL'>All Types</option>
                <option value='GENERAL'>General</option>
                <option value='COURSE_UPDATE'>Course Update</option>
                <option value='SYSTEM_MAINTENANCE'>System Maintenance</option>
                <option value='PROMOTION'>Promotion</option>
                <option value='EMERGENCY'>Emergency</option>
              </select>
              {(hiddenFilters.search || hiddenFilters.type !== 'ALL') && (
                <Button variant='outline' onClick={clearHiddenFilters}>
                  Clear
                </Button>
              )}
            </div>
            <HiddenAnnouncementList filters={hiddenFilters} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
