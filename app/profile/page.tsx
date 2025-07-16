import { Navbar } from '@/components/layout/navbar'
import { ProfileSettings } from '@/components/profile/profile-settings'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function ProfilePage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className='min-h-screen bg-background'>
        <Navbar />
        <div className='container mx-auto px-4 py-8'>
          <ProfileSettings />
        </div>
      </div>
    </ProtectedRoute>
  )
}
