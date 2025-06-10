import { Navbar } from '@/components/layout/navbar'
import { ProfileSettings } from '@/components/profile/profile-settings'

export default function ProfilePage() {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        <ProfileSettings />
      </div>
    </div>
  )
}
