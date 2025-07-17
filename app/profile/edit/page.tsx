import { Navbar } from '@/components/layout/navbar'
import { ProfileEditor } from '@/components/profile/profile-editor'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function ProfileEditPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className='min-h-screen bg-background'>
        <Navbar />
        <div className='container mx-auto px-4 py-8'>
          <ProfileEditor />
        </div>
      </div>
    </ProtectedRoute>
  )
}
