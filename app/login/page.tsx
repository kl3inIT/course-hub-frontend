import { LoginForm } from "@/components/auth/login-form"
import { Navbar } from "@/components/layout/navbar"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <LoginForm />
      </div>
    </div>
  )
}
