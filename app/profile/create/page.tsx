import { Navbar } from '@/components/layout/navbar'
import { ProfileCreator } from '@/components/profile/profile-creator'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function ProfileCreatePage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className='min-h-screen bg-background'>
        <Navbar />
        <div className='container mx-auto px-4 py-8'>
          <ProfileCreator />
        </div>
      </div>
    </ProtectedRoute>
  )
}
