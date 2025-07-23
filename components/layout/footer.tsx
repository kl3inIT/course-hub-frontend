import Link from 'next/link'
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Footer() {
  return (
    <footer className='bg-background border-t'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Company Info */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <BookOpen className='h-6 w-6' />
              <span className='font-bold text-xl'>Course Hub</span>
            </div>
            <p className='text-muted-foreground leading-relaxed'>
              Empowering learners worldwide with quality education and expert instruction.
            </p>
            <div className='flex items-center gap-4'>
              <Link href='#' className='text-muted-foreground hover:text-primary transition-colors'>
                <Facebook className='h-5 w-5' />
              </Link>
              <Link href='#' className='text-muted-foreground hover:text-primary transition-colors'>
                <Twitter className='h-5 w-5' />
              </Link>
              <Link href='#' className='text-muted-foreground hover:text-primary transition-colors'>
                <Instagram className='h-5 w-5' />
              </Link>
              <Link href='#' className='text-muted-foreground hover:text-primary transition-colors'>
                <Linkedin className='h-5 w-5' />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h4 className='font-semibold text-lg'>Quick Links</h4>
            <div className='space-y-3 text-muted-foreground'>
              <Link href='/' className='block hover:text-primary transition-colors'>Home</Link>
              <Link href='/courses' className='block hover:text-primary transition-colors'>All Courses</Link>
              <Link href='/about' className='block hover:text-primary transition-colors'>About</Link>
              <Link href='/contact' className='block hover:text-primary transition-colors'>Contact</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className='space-y-4'>
            <h4 className='font-semibold text-lg'>Contact</h4>
            <div className='space-y-3 text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <Mail className='h-4 w-4' />
                <span className='text-sm'>it4beginer@gmail.com</span>
              </div>
              <div className='flex items-center gap-2'>
                <Phone className='h-4 w-4' />
                <span className='text-sm'>+1 (555) 123-4567</span>
              </div>
              <div className='flex items-center gap-2'>
                <MapPin className='h-4 w-4' />
                <span className='text-sm'>Hoa Lac, Ha Noi</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className='space-y-4'>
            <h4 className='font-semibold text-lg'>Newsletter</h4>
            <p className='text-sm text-muted-foreground'>Subscribe for updates and offers</p>
            <div className='flex gap-2'>
              <Input placeholder='Enter your email' className='text-sm' />
              <Button size='sm'>Subscribe</Button>
            </div>
          </div>
        </div>

        <div className='border-t mt-8 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-muted-foreground text-sm'>
              &copy; 2024 Course Hub. All rights reserved.
            </p>
            <div className='flex items-center gap-6 text-sm text-muted-foreground'>
              <Link href='/privacy' className='hover:text-primary transition-colors'>Privacy Policy</Link>
              <Link href='/terms' className='hover:text-primary transition-colors'>Terms of Service</Link>
              <Link href='/cookies' className='hover:text-primary transition-colors'>Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
