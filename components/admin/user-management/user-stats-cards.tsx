import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserStatsCardsProps } from '@/types/user-management'
import { AlertTriangle, Ban, CheckCircle, Users } from 'lucide-react'

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
}) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <CardTitle className='text-sm font-medium'>{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className='text-2xl font-bold'>{value || 0}</div>
    </CardContent>
  </Card>
)

export function UserStatsCards({
  userStats,
  courseStats,
  activeTab,
}: UserStatsCardsProps) {
  const isManager = activeTab === 'manager'

  return (
    <div
      className={`grid gap-4 md:grid-cols-2 ${isManager ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}
    >
      <StatCard
        title={`Total ${isManager ? 'Managers' : 'Learners'}`}
        value={userStats.total}
        icon={<Users className='h-4 w-4 text-muted-foreground' />}
      />
      <StatCard
        title='Active'
        value={userStats.active}
        icon={<CheckCircle className='h-4 w-4 text-green-600' />}
      />
      {isManager && (
        <StatCard
          title='Inactive'
          value={userStats.inactive}
          icon={<AlertTriangle className='h-4 w-4 text-gray-600' />}
        />
      )}
      <StatCard
        title='Banned'
        value={userStats.banned}
        icon={<Ban className='h-4 w-4 text-red-600' />}
      />
    </div>
  )
}
