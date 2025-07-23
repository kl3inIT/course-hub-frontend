import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DateRange } from 'react-day-picker'
import AnnouncementHidden from './AnnouncementHidden'
import { AnnouncementHistory } from './AnnouncementHistory'
import { AnnouncementList } from './AnnouncementList'
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
    startDate: '',
    endDate: '',
  })
  const [historyFilters, setHistoryFilters] = useState({
    search: '',
    type: 'ALL',
    status: 'ALL',
    startDate: '',
    endDate: '',
  })
  const [hiddenFilters, setHiddenFilters] = useState({
    search: '',
    type: 'ALL',
    startDate: '',
    endDate: '',
  })
  const [listDateRange, setListDateRange] = useState<DateRange | undefined>(
    undefined
  )
  const [historyDateRange, setHistoryDateRange] = useState<
    DateRange | undefined
  >(undefined)
  const [hiddenDateRange, setHiddenDateRange] = useState<DateRange | undefined>(
    undefined
  )
  const [tab, setTab] = useState('list')
  const [statsReloadKey, setStatsReloadKey] = useState(0)

  useEffect(() => {
    // Mặc định 7 ngày gần nhất cho tất cả tab
    const today = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 6)
    const defaultRange = { from: sevenDaysAgo, to: today }
    setListDateRange(defaultRange)
    setHistoryDateRange(defaultRange)
    setHiddenDateRange(defaultRange)
    setListFilters(prev => ({
      ...prev,
      startDate: format(sevenDaysAgo, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    }))
    setHistoryFilters(prev => ({
      ...prev,
      startDate: format(sevenDaysAgo, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    }))
    setHiddenFilters(prev => ({
      ...prev,
      startDate: format(sevenDaysAgo, 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    }))
  }, [])

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
    setListFilters({
      search: '',
      type: 'ALL',
      status: 'ALL',
      startDate: '',
      endDate: '',
    })
  const clearHistoryFilters = () =>
    setHistoryFilters({
      search: '',
      type: 'ALL',
      status: 'ALL',
      startDate: '',
      endDate: '',
    })
  const clearHiddenFilters = () =>
    setHiddenFilters({ search: '', type: 'ALL', startDate: '', endDate: '' })

  // Khi đổi dateRange thì cập nhật filter
  const handleListDateRangeChange = (range: DateRange | undefined) => {
    setListDateRange(range)
    setListFilters(prev => ({
      ...prev,
      startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
      endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
    }))
  }
  const handleHistoryDateRangeChange = (range: DateRange | undefined) => {
    setHistoryDateRange(range)
    setHistoryFilters(prev => ({
      ...prev,
      startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
      endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
    }))
  }
  const handleHiddenDateRangeChange = (range: DateRange | undefined) => {
    setHiddenDateRange(range)
    setHiddenFilters(prev => ({
      ...prev,
      startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
      endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
    }))
  }

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
            <AnnouncementStats reloadKey={statsReloadKey} />
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
            <TabsTrigger value='list'>Draft and Scheduled</TabsTrigger>
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
              {/* Date range picker */}
              <DateRangePicker
                value={listDateRange}
                onChange={handleListDateRangeChange}
              />
              {(listFilters.search ||
                listFilters.type !== 'ALL' ||
                listFilters.status !== 'ALL' ||
                listFilters.startDate ||
                listFilters.endDate) && (
                <Button variant='outline' onClick={clearListFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
            <AnnouncementList
              filters={listFilters}
              onStatsChange={() => setStatsReloadKey(k => k + 1)}
            />
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
              {/* Date range picker */}
              <DateRangePicker
                value={historyDateRange}
                onChange={handleHistoryDateRangeChange}
              />
              {(historyFilters.search ||
                historyFilters.type !== 'ALL' ||
                historyFilters.status !== 'ALL' ||
                historyFilters.startDate ||
                historyFilters.endDate) && (
                <Button variant='outline' onClick={clearHistoryFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
            <AnnouncementHistory
              filters={historyFilters}
              onStatsChange={() => setStatsReloadKey(k => k + 1)}
            />
          </TabsContent>
          <TabsContent value='hidden'>
            {/* Filters */}
            <div className='mb-4 flex flex-wrap items-center gap-4'>
              <input
                className='border rounded px-3 py-2'
                placeholder='Search announcements...'
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
              {/* Date range picker */}
              <DateRangePicker
                value={hiddenDateRange}
                onChange={handleHiddenDateRangeChange}
              />
              {(hiddenFilters.search ||
                hiddenFilters.type !== 'ALL' ||
                hiddenFilters.startDate ||
                hiddenFilters.endDate) && (
                <Button variant='outline' onClick={clearHiddenFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
            <AnnouncementHidden
              filters={hiddenFilters}
              onStatsChange={() => setStatsReloadKey(k => k + 1)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
