'use client'

import {
  BarChart3,
  BookOpen,
  DollarSign,
  Home,
  LogOut,
  Settings,
  Star,
  Tags,
  Ticket,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RoleBadge } from '@/components/ui/role-badge'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/context/auth-context'

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/manager',
    icon: BarChart3,
  },
  {
    title: 'Courses List',
    url: '/manager/courses',
    icon: BookOpen,
  },
  {
    title: 'Categories',
    url: '/manager/categories',
    icon: Tags,
  },
  {
    title: 'Analytics',
    url: '/manager/analytics',
    icon: BarChart3,
  },
  {
    title: 'Reviews',
    url: '/manager/reviews',
    icon: Star,
  },
  {
    title: 'Payments',
    url: '/manager/payments',
    icon: DollarSign,
  },
  {
    title: 'Coupons',
    url: '/manager/coupons',
    icon: Ticket,
  },
]

export function ManagerSidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if API call fails, we should still clear local state and redirect
      router.push('/login')
    }
  }

  const handleHomeNavigation = () => {
    router.push('/')
  }

  return (
    <Sidebar variant='inset'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <div className='flex items-center gap-2'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                  <BookOpen className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Manager Panel</span>
                  <span className='truncate text-xs'>Course Management</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant='ghost'
                    onClick={handleHomeNavigation}
                    className='w-full justify-start'
                  >
                    <Home className='mr-2 h-4 w-4' />
                    Back to Home
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {navigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Button
                      variant='ghost'
                      className='w-full justify-start'
                      asChild
                    >
                      <Link href={item.url} className='flex items-center'>
                        <item.icon className='mr-2 h-4 w-4' />
                        <span>{item.title}</span>
                      </Link>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant='ghost'
          className='w-full justify-start'
          onClick={handleLogout}
        >
          <LogOut className='mr-2 h-4 w-4' />
          Logout
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
