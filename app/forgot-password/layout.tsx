import { Footer } from '@/components/layout/footer'

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='min-h-screen flex flex-col'>
      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  )
}
