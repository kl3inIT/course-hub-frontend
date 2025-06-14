import { Navbar } from '@/components/layout/navbar'
import { ProfileViewer } from '@/components/profile/profile-viewer'

interface ProfilePageProps {
  params: {
    id: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <div className='min-h-screen bg-background'>
      <Navbar />
      <div className='container mx-auto px-4 py-8'>
        <ProfileViewer userId={params.id} />
      </div>
    </div>
  )
}
