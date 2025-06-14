import { ReportDetailPublic } from '@/components/report-detail-public'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function ReportDetailPublicPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <div className='flex items-center justify-between space-y-2'>
          <div className='flex items-center space-x-2'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/'>
                <ChevronLeft className='h-4 w-4' />
                Back to Home
              </Link>
            </Button>
            <h2 className='text-3xl font-bold tracking-tight'>
              Report Details
            </h2>
          </div>
        </div>
        <ReportDetailPublic />
      </div>
    </div>
  )
}
