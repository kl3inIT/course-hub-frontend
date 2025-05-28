import { RegisterForm } from "@/components/auth/register-form"
import { Navbar } from "@/components/layout/navbar"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <RegisterForm />
      </div>
    </div>
  )
}
