import { ReportDetail } from '@/components/admin/report-detail'
import { RoleGuard } from '@/components/auth/role-guard'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function ReportDetailPage() {
  return (
    <RoleGuard allowedRoles={['admin']} redirectOnUnauthorized={true}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <div className='flex items-center justify-between space-y-2'>
              <div className='flex items-center space-x-2'>
                <Button variant='ghost' size='sm' asChild>
                  <Link href='/admin/reports'>
                    <ChevronLeft className='h-4 w-4' />
                    Back to Reports
                  </Link>
                </Button>
                <h2 className='text-3xl font-bold tracking-tight'>
                  Report Details
                </h2>
              </div>
            </div>
            <ReportDetail />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}