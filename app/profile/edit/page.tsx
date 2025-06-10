import { Navbar } from '@/components/layout/navbar'
import { ProfileEditor } from '@/components/profile/profile-editor'

export default function ProfileEditPage() {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        <ProfileEditor />
      </div>
    </div>
  )
}
