'use client'

import { notificationDropdown } from '@/components/notifications/notification-dropdown'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { RoleBadge } from '@/components/ui/role-badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/context/auth-context'
import { announcementApi } from '@/services/announcement-api'
import { categoryApi } from '@/services/category-api'
import { notificationApi } from '@/services/notification-api'
import { websocketService } from '@/services/websocket-service'
import { Announcement } from '@/types/announcement'
import { CategoryResponseDTO } from '@/types/category'
import { NotificationDTO } from '@/types/notification'
import {
  Bell,
  BookOpen,
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  Settings,
  Shield,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Navbar() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false)
  const pathname = usePathname()

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return
    try {
      setLoadingNotifications(true)
      const response = await notificationApi.getNotifications({
        page: 0,
        size: 10,
        sortBy: 'createdAt',
        direction: 'DESC',
      })
      const notifications = response.data?.data?.content || []
      setNotifications(notifications)
    } catch (error) {
      setNotifications([])
    } finally {
      setLoadingNotifications(false)
    }
  }

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user) return
    try {
      const response = await notificationApi.getUnreadCount()
      const count = response.data?.data || 0
      setUnreadCount(count)
    } catch (error) {
      setUnreadCount(0)
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, isRead: 1 }))
      )
      setUnreadCount(0)
    } catch (error) {}
  }

  // Mark single notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId)
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notificationId ? { ...n, isRead: 1 } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {}
  }

  // Delete single notification
  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await notificationApi.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  // Delete all notifications
  const handleDeleteAllNotifications = async () => {
    try {
      await notificationApi.deleteAllNotifications()
      setNotifications([])
      setUnreadCount(0)
    } catch {}
  }

  // Fetch announcements
  const fetchAnnouncements = async () => {
    if (!user) return
    try {
      setLoadingAnnouncements(true)
      const response = await announcementApi.getUserAnnouncements()
      setAnnouncements(response.data?.data || [])
    } catch (error) {
      setAnnouncements([])
    } finally {
      setLoadingAnnouncements(false)
    }
  }

  // Gộp notification và announcement
  const getAllNotiItems = () => {
    const notiItems = notifications.map(n => ({
      ...n,
      type: 'notification',
      createdAt: n.createdAt,
    }))
    const annItems = announcements.map(a => ({
      ...a,
      type: 'announcement',
      createdAt: a.createdAt,
    }))
    return [...notiItems, ...annItems].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // Unread count
  const unreadCountAll = getAllNotiItems().filter(i => i.isRead !== 1).length

  // Mark as read
  const handleMarkAsReadUnified = async (item: any) => {
    if (item.isRead === 1) return
    if (item.type === 'notification') {
      await handleMarkAsRead(item.id)
    } else if (item.type === 'announcement') {
      await announcementApi.markAsRead(item.id)
      setAnnouncements(prev =>
        prev.map(a => (a.id === item.id ? { ...a, isRead: 1 } : a))
      )
    }
  }

  // Delete all notifications and announcements
  const handleDeleteAllUnified = async () => {
    await handleDeleteAllNotifications()
    // Xóa tất cả announcement (gọi API xóa từng cái)
    await Promise.all(
      announcements.map(a => announcementApi.markAnnouncementAsDeleted(a.id))
    )
    setAnnouncements([])
  }

  // Delete
  const handleDeleteUnified = async (item: any) => {
    if (item.type === 'notification') {
      await handleDeleteNotification(item.id)
    } else if (item.type === 'announcement') {
      await announcementApi.markAnnouncementAsDeleted(item.id)
      setAnnouncements(prev => prev.filter(a => a.id !== item.id))
    }
  }

  // Mark all as read
  const handleMarkAllAsReadUnified = async () => {
    // Mark all notifications as read
    await handleMarkAllAsRead()
    // Mark all announcements as read
    const unreadAnnouncements = announcements.filter(a => a.isRead !== 1)
    await Promise.all(
      unreadAnnouncements.map(a => announcementApi.markAsRead(a.id))
    )
    setAnnouncements(prev => prev.map(a => ({ ...a, isRead: 1 })))
  }

  // Connect to WebSocket
  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('accessToken')
    if (!token) return

    websocketService.connect(token, () => {
      websocketService.addSubscriber(
        'notification',
        (notification: NotificationDTO) => {
          setNotifications(prev => [notification, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      websocketService.subscribeTopic(
        '/user/queue/notifications',
        'notification'
      )

      // Đăng ký nhận announcement theo role
      websocketService.addSubscriber(
        'announcement-all',
        (announcement: Announcement) => {
          setAnnouncements(prev => [announcement, ...prev])
        }
      )
      websocketService.addSubscriber(
        'announcement-learners',
        (announcement: Announcement) => {
          setAnnouncements(prev => [announcement, ...prev])
        }
      )
      websocketService.addSubscriber(
        'announcement-managers',
        (announcement: Announcement) => {
          setAnnouncements(prev => [announcement, ...prev])
        }
      )
      websocketService.subscribeAnnouncements(user.role)
    })

    // Cleanup
    return () => {
      websocketService.removeSubscriber('notification')
      websocketService.removeSubscriber('announcement-all')
      websocketService.removeSubscriber('announcement-learners')
      websocketService.removeSubscriber('announcement-managers')
      websocketService.disconnect()
    }
  }, [user])

  // Fetch both on login
  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchUnreadCount()
      fetchAnnouncements()
    }
  }, [user])

  // Fetch categories for course dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await categoryApi.getAllCategories({
          page: 0,
          size: 100,
        })
        const sortedCategories = response.data.content
          .sort((a, b) => (b.courseCount || 0) - (a.courseCount || 0))
          .slice(0, 6)
        setCategories(sortedCategories)
      } catch (error) {
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center gap-8'>
            <Link
              href='/'
              className='flex items-center gap-2 hover:opacity-80 transition-opacity'
            >
              <BookOpen className='h-6 w-6' />
              <span className='font-bold text-xl'>CourseHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className='hidden lg:flex items-center gap-6'>
              {/* Home Link */}
              <Link
                href='/'
                className={`text-sm font-medium transition-colors relative group ${
                  isActiveLink('/')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                Home
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                    isActiveLink('/') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </Link>

              {/* Courses Dropdown */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={`text-sm font-medium transition-colors relative group h-auto p-0 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent [&>svg]:hidden ${
                        isActiveLink('/courses')
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <span className='flex items-center gap-1'>
                        Courses
                        <ChevronDown className='h-3 w-3 transition-transform group-data-[state=open]:rotate-180' />
                      </span>
                      <span
                        className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                          isActiveLink('/courses')
                            ? 'w-full'
                            : 'w-0 group-hover:w-full'
                        }`}
                      ></span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className='w-[280px] p-3 bg-white dark:bg-slate-950 border border-border rounded-lg shadow-lg'>
                        <div className='space-y-1'>
                          <Link
                            href='/courses'
                            className='flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'
                          >
                            <BookOpen className='mr-2 h-4 w-4' />
                            All Courses
                          </Link>

                          {loadingCategories ? (
                            <div className='px-3 py-2 text-sm text-muted-foreground flex items-center'>
                              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2'></div>
                              Loading categories...
                            </div>
                          ) : categories.length > 0 ? (
                            <>
                              <div className='px-3 py-1 text-xs font-medium text-muted-foreground border-t pt-2 mt-2'>
                                CATEGORIES
                              </div>
                              {categories.map(category => (
                                <Link
                                  key={category.id}
                                  href={`/courses?category=${encodeURIComponent(category.name)}`}
                                  className='flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary group'
                                >
                                  <span>{category.name}</span>
                                  <span className='text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full group-hover:bg-slate-200 dark:group-hover:bg-slate-700'>
                                    {category.courseCount}
                                  </span>
                                </Link>
                              ))}
                            </>
                          ) : (
                            <div className='px-3 py-2 text-sm text-muted-foreground'>
                              No categories available
                            </div>
                          )}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* Other Navigation Links */}
              <Link
                href='/about'
                className={`text-sm font-medium transition-colors relative group ${
                  isActiveLink('/about')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                About
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                    isActiveLink('/about') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </Link>

              <Link
                href='/contact'
                className={`text-sm font-medium transition-colors relative group ${
                  isActiveLink('/contact')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                Contact
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                    isActiveLink('/contact')
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </Link>

              <Link
                href='/coupons'
                className={`text-sm font-medium transition-colors relative group ${
                  isActiveLink('/coupons')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                Coupons
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                    isActiveLink('/coupons')
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </Link>

              {/* Only show "My Learning" link for learners */}
              {user && user.role === 'learner' && (
                <Link
                  href='/dashboard'
                  className={`text-sm font-medium transition-colors relative group ${
                    isActiveLink('/dashboard')
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  My Learning
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                      isActiveLink('/dashboard')
                        ? 'w-full'
                        : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Side - Auth & Mobile Menu */}
          <div className='flex items-center gap-4'>
            <ThemeToggle />
            {/* Desktop User Menu - Keep avatar dropdown with Course Management and Admin Panel */}
            {user ? (
              <div className='hidden lg:flex items-center gap-4'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='relative h-8 w-8 rounded-full'
                    >
                      <Bell className='h-5 w-5' />
                      {unreadCountAll > 0 && (
                        <span className='absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center'>
                          {unreadCountAll}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  {notificationDropdown({
                    items: getAllNotiItems(),
                    loading: loadingNotifications || loadingAnnouncements,
                    onMarkAllAsRead: handleMarkAllAsReadUnified,
                    onDeleteAll: handleDeleteAllUnified,
                    onMarkAsRead: handleMarkAsReadUnified,
                    onDelete: handleDeleteUnified,
                  })}
                </DropdownMenu>

                <div className='text-sm'>
                  <span className='text-muted-foreground'>Hello, </span>
                  <span className='font-medium'>{user.name}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='relative h-8 w-8 rounded-full ml-2'
                    >
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={user.avatar || '/assets/default-avatar.svg'}
                          alt={user.name || 'User avatar'}
                        />
                        <AvatarFallback>
                          {user.name
                            ? user.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                            : user.email && user.email[0]
                              ? user.email[0].toUpperCase()
                              : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-56' align='end' forceMount>
                    <div className='flex items-center justify-start gap-2 p-2'>
                      <div className='flex flex-col space-y-1 leading-none'>
                        <p className='font-medium'>{user.name || user.email}</p>
                        <p className='w-[200px] truncate text-sm text-muted-foreground'>
                          {user.email}
                        </p>
                        <RoleBadge role={user.role} size='sm' />
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {user.role === 'learner' && (
                      <DropdownMenuItem asChild>
                        <Link href='/dashboard'>
                          <GraduationCap className='mr-2 h-4 w-4' />
                          My Learning
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href='/profile'>
                        <Settings className='mr-2 h-4 w-4' />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    {/* Role-based panels */}
                    {(user.role === 'manager' || user.role === 'admin') && (
                      <DropdownMenuItem asChild>
                        <Link href='/manager'>
                          <BookOpen className='mr-2 h-4 w-4' />
                          Manager Panel
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href='/admin'>
                          <Shield className='mr-2 h-4 w-4' />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className='mr-2 h-4 w-4' />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className='hidden lg:flex items-center gap-2'>
                <Link href='/login'>
                  <Button variant='ghost'>Sign In</Button>
                </Link>
                <Link href='/register'>
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <div className='lg:hidden'>
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='sm'>
                    <Menu className='h-5 w-5' />
                  </Button>
                </SheetTrigger>
                <SheetContent side='right' className='w-80'>
                  <div className='flex flex-col gap-6 mt-6'>
                    <div className='flex items-center gap-2'>
                      <BookOpen className='h-6 w-6' />
                      <span className='font-bold text-xl'>CourseHub</span>
                    </div>

                    <div className='flex flex-col gap-4'>
                      <Link
                        href='/'
                        className={`text-lg font-medium transition-colors py-2 ${
                          isActiveLink('/')
                            ? 'text-primary'
                            : 'hover:text-primary'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Home
                      </Link>

                      {/* Mobile Courses Section */}
                      <div className='space-y-2'>
                        <Link
                          href='/courses'
                          className={`text-lg font-medium transition-colors py-2 ${
                            isActiveLink('/courses')
                              ? 'text-primary'
                              : 'hover:text-primary'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          All Courses
                        </Link>
                        <div className='ml-4 space-y-2'>
                          {categories.map(category => (
                            <Link
                              key={category.id}
                              href={`/courses?category=${encodeURIComponent(category.name)}`}
                              className='block text-sm text-muted-foreground hover:text-primary py-1'
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <Link
                        href='/about'
                        className={`text-lg font-medium transition-colors py-2 ${
                          isActiveLink('/about')
                            ? 'text-primary'
                            : 'hover:text-primary'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        About
                      </Link>

                      <Link
                        href='/contact'
                        className={`text-lg font-medium transition-colors py-2 ${
                          isActiveLink('/contact')
                            ? 'text-primary'
                            : 'hover:text-primary'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Contact
                      </Link>

                      <Link
                        href='/coupons'
                        className={`text-lg font-medium transition-colors py-2 ${
                          isActiveLink('/coupons')
                            ? 'text-primary'
                            : 'hover:text-primary'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Coupons
                      </Link>

                      {/* Only show "My Learning" link for learners in mobile */}
                      {user && user.role === 'learner' && (
                        <Link
                          href='/dashboard'
                          className={`text-lg font-medium transition-colors py-2 ${
                            isActiveLink('/dashboard')
                              ? 'text-primary'
                              : 'hover:text-primary'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          My Learning
                        </Link>
                      )}
                    </div>

                    {user ? (
                      <div className='border-t pt-4 space-y-4'>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-10 w-10'>
                            <AvatarImage
                              src={user.avatar || '/assets/default-avatar.svg'}
                              alt={user.name || 'User avatar'}
                            />
                            <AvatarFallback>
                              {user.name
                                ? user.name
                                    .split(' ')
                                    .map((n: string) => n[0])
                                    .join('')
                                : user.email && user.email[0]
                                  ? user.email[0].toUpperCase()
                                  : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-medium'>Hello, {user.name}</p>
                            <p className='text-sm text-muted-foreground'>
                              {user.email}
                            </p>
                            <RoleBadge role={user.role} size='sm' />
                          </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                          <Link
                            href='/profile'
                            className='flex items-center gap-2 text-sm py-2 hover:text-primary'
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings className='h-4 w-4' />
                            Profile
                          </Link>

                          {/* Role-based panels for mobile */}
                          {(user.role === 'manager' ||
                            user.role === 'admin') && (
                            <Link
                              href='/manager'
                              className='flex items-center gap-2 text-sm py-2 hover:text-primary'
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <BookOpen className='h-4 w-4' />
                              Manager Panel
                            </Link>
                          )}

                          {user.role === 'admin' && (
                            <Link
                              href='/admin'
                              className='flex items-center gap-2 text-sm py-2 hover:text-primary'
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <Shield className='h-4 w-4' />
                              Admin Panel
                            </Link>
                          )}

                          <Button
                            onClick={() => {
                              handleLogout()
                              setIsMobileMenuOpen(false)
                            }}
                            variant='outline'
                            className='justify-start gap-2'
                          >
                            <LogOut className='h-4 w-4' />
                            Log out
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className='border-t pt-4 flex flex-col gap-3'>
                        <Link
                          href='/login'
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button variant='outline' className='w-full'>
                            Sign In
                          </Button>
                        </Link>
                        <Link
                          href='/register'
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button className='w-full'>Sign Up</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
