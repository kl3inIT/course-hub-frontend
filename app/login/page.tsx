import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-16'>
        <LoginForm />
      </div>
    </div>
  )
}
