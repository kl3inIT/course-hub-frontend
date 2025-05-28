import { Navbar } from "@/components/layout/navbar"
import { ProfileCreator } from "@/components/profile/profile-creator"

export default function ProfileCreatePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <ProfileCreator />
      </div>
    </div>
  )
}
