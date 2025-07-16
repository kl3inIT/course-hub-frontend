'use client'

import { UserDetail } from '@/components/profile/user-detail'
import { Skeleton } from '@/components/ui/skeleton'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { ManagerSidebar } from '@/components/layout/manager-sidebar'
import { RoleGuard } from '@/components/auth/role-guard'
import { Suspense, use } from 'react'

interface UserPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ManagerUserDetailPage({ params }: UserPageProps) {
  const resolvedParams = use(params)
  const userId = resolvedParams.id

  return (
    <RoleGuard
      allowedRoles={['manager', 'admin']}
      redirectOnUnauthorized={true}
    >
      <Suspense
        fallback={
          <div className='w-full min-h-screen bg-gray-50/30'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
              <div className='space-y-6'>
                <div className='flex items-center space-x-4'>
                  <Skeleton className='h-16 w-16 rounded-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-[200px]' />
                    <Skeleton className='h-4 w-[150px]' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <SidebarProvider>
          <ManagerSidebar />
          <SidebarInset>
            <div className='flex-1 space-y-4 p-8 pt-6'>
              <UserDetail userId={userId} />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </Suspense>
    </RoleGuard>
  )
} 