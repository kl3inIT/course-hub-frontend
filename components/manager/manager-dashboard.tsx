'use client'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PlusCircle,
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
  Star,
  ArrowUpRight,
  Activity,
  Clock,
  Target,
  Home,
  Settings,
  Tags,
} from 'lucide-react'

export function ManagerDashboard() {
  const router = useRouter()

  // Analytics data with navigation handlers
  const analyticsCards = [
    {
      title: 'Total Courses',
      value: '12',
      change: '+2 from last month',
      icon: BookOpen,
      onClick: () => router.push('/manager/courses'),
      trend: 'up',
    },
    {
      title: 'Total Students',
      value: '2,456',
      change: '+180 from last month',
      icon: Users,
      onClick: () => router.push('/manager/students'),
      trend: 'up',
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+20.1% from last month',
      icon: DollarSign,
      onClick: () => router.push('/manager/analytics'),
      trend: 'up',
    },
    {
      title: 'Course Completion',
      value: '87%',
      change: '+5% from last month',
      icon: TrendingUp,
      onClick: () => router.push('/manager/analytics'),
      trend: 'up',
    },
  ]

  // Quick action buttons with navigation
  const quickActions = [
    {
      title: 'Create New Course',
      description: 'Start building your next course',
      icon: PlusCircle,
      onClick: () => router.push('/manager/create'),
      variant: 'default' as const,
    },
    {
      title: 'Manage Categories',
      description: 'Organize course categories',
      icon: Tags,
      onClick: () => router.push('/manager/categories'),
      variant: 'outline' as const,
    },
    {
      title: 'Manage Courses',
      description: 'Edit and organize your courses',
      icon: BookOpen,
      onClick: () => router.push('/manager/courses'),
      variant: 'outline' as const,
    },
    {
      title: 'View Students',
      description: 'Monitor student progress',
      icon: Users,
      onClick: () => router.push('/manager/students'),
      variant: 'outline' as const,
    },
    {
      title: 'Analytics Dashboard',
      description: 'View detailed insights',
      icon: BarChart3,
      onClick: () => router.push('/manager/analytics'),
      variant: 'outline' as const,
    },
  ]

  // Recent activity with navigation
  const recentActivities = [
    {
      title: 'New student enrolled in "React Fundamentals"',
      time: '2 hours ago',
      type: 'enrollment',
      color: 'bg-green-500',
      onClick: () => router.push('/manager/students'),
    },
    {
      title: 'Course "Advanced JavaScript" published',
      time: '1 day ago',
      type: 'course',
      color: 'bg-blue-500',
      onClick: () => router.push('/manager/courses'),
    },
    {
      title: 'Review received for "CSS Mastery"',
      time: '3 days ago',
      type: 'review',
      color: 'bg-yellow-500',
      onClick: () => router.push('/manager/reviews'),
    },
    {
      title: 'Monthly revenue target achieved',
      time: '1 week ago',
      type: 'milestone',
      color: 'bg-purple-500',
      onClick: () => router.push('/manager/analytics'),
    },
  ]

  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Manager Dashboard</h1>
          <p className='text-muted-foreground mt-2'>
            Welcome back! Here's an overview of your course management
            activities.
          </p>
        </div>
        <Button
          onClick={() => router.push('/manager/analytics')}
          className='gap-2'
        >
          <BarChart3 className='h-4 w-4' />
          View Full Analytics
          <ArrowUpRight className='h-4 w-4' />
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {analyticsCards.map((card, index) => (
          <Card
            key={index}
            className='cursor-pointer transition-all hover:shadow-md hover:scale-105'
            onClick={card.onClick}
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {card.title}
              </CardTitle>
              <div className='flex items-center gap-2'>
                <card.icon className='h-4 w-4 text-muted-foreground' />
                <ArrowUpRight className='h-3 w-3 text-muted-foreground opacity-50' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{card.value}</div>
              <p className='text-xs text-muted-foreground flex items-center gap-1'>
                <TrendingUp className='h-3 w-3 text-green-500' />
                {card.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Quick Actions */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5' />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4 sm:grid-cols-2'>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.onClick}
                className='h-auto p-4 justify-start flex-col items-start gap-2'
              >
                <div className='flex items-center gap-2 w-full'>
                  <action.icon className='h-4 w-4' />
                  <span className='font-medium'>{action.title}</span>
                  <ArrowUpRight className='h-3 w-3 ml-auto opacity-50' />
                </div>
                <span className='text-xs text-muted-foreground text-left'>
                  {action.description}
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className='flex items-start space-x-4 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors'
                  onClick={activity.onClick}
                >
                  <div
                    className={`w-2 h-2 ${activity.color} rounded-full mt-2 flex-shrink-0`}
                  ></div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium leading-tight'>
                      {activity.title}
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {activity.time}
                    </p>
                  </div>
                  <ArrowUpRight className='h-3 w-3 text-muted-foreground opacity-50 flex-shrink-0 mt-1' />
                </div>
              ))}
            </div>
            <Button
              variant='ghost'
              className='w-full mt-4 justify-center gap-2'
              onClick={() => router.push('/manager/analytics')}
            >
              View All Activity
              <ArrowUpRight className='h-4 w-4' />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Course Performance */}
        <Card
          className='cursor-pointer transition-all hover:shadow-md'
          onClick={() => router.push('/manager/analytics')}
        >
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <Target className='h-5 w-5' />
                Course Performance
              </span>
              <ArrowUpRight className='h-4 w-4 text-muted-foreground' />
            </CardTitle>
            <CardDescription>Top performing courses this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[
                { name: 'React Fundamentals', students: 324, rating: 4.8 },
                { name: 'Advanced JavaScript', students: 256, rating: 4.7 },
                { name: 'CSS Mastery', students: 189, rating: 4.6 },
              ].map((course, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium'>{course.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {course.students} students
                    </p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    <span className='text-sm font-medium'>{course.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Insights */}
        <Card
          className='cursor-pointer transition-all hover:shadow-md'
          onClick={() => router.push('/manager/analytics')}
        >
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span className='flex items-center gap-2'>
                <DollarSign className='h-5 w-5' />
                Revenue Insights
              </span>
              <ArrowUpRight className='h-4 w-4 text-muted-foreground' />
            </CardTitle>
            <CardDescription>Monthly revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[
                { period: 'This Month', amount: '$15,420', change: '+12%' },
                { period: 'Last Month', amount: '$13,750', change: '+8%' },
                { period: '3 Months Ago', amount: '$12,680', change: '+15%' },
              ].map((period, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium'>{period.period}</p>
                    <p className='text-sm text-muted-foreground'>
                      {period.change} growth
                    </p>
                  </div>
                  <span className='text-lg font-bold'>{period.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
