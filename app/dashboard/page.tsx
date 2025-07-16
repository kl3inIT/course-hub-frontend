import { StudentDashboard } from '@/components/dashboard/student-dashboard'
import { Navbar } from '@/components/layout/navbar'
import { RoleGuard } from '@/components/auth/role-guard'

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={['learner']} redirectOnUnauthorized={true}>
      <div className='min-h-screen bg-background'>
        <Navbar />
        <div className='container mx-auto px-4 py-8'>
          <StudentDashboard />
        </div>
      </div>
    </RoleGuard>
  )
}
