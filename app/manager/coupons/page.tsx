'use client'

import { RoleGuard } from '@/components/auth/role-guard'
import { ManagerSidebar } from '@/components/layout/manager-sidebar'
import { CouponManagement } from '@/components/manager/coupon-management'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function ManagerCouponsPage() {
  return (
    <RoleGuard allowedRoles={['manager', 'admin']}>
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <CouponManagement />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
} 