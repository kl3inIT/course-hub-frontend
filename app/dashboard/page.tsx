import { StudentDashboard } from "@/components/dashboard/student-dashboard"
import { Navbar } from "@/components/layout/navbar"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <StudentDashboard />
      </div>
    </div>
  )
}
