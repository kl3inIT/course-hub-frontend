import Link from 'next/link'
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react'
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
              <span className='font-bold text-xl'>LearnHub</span>
            </div>
            <p className='text-muted-foreground leading-relaxed'>
              Empowering learners worldwide with quality education and expert
              instruction. Transform your career with our comprehensive courses.
            </p>
            <div className='flex items-center gap-4'>
              <Link
                href='#'
                className='text-muted-foreground hover:text-primary transition-colors'
              >
                <Facebook className='h-5 w-5' />
              </Link>
              <Link
                href='#'
                className='text-muted-foreground hover:text-primary transition-colors'
              >
                <Twitter className='h-5 w-5' />
              </Link>
              <Link
                href='#'
                className='text-muted-foreground hover:text-primary transition-colors'
              >
                <Instagram className='h-5 w-5' />
              </Link>
              <Link
                href='#'
                className='text-muted-foreground hover:text-primary transition-colors'
              >
                <Linkedin className='h-5 w-5' />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h4 className='font-semibold text-lg'>Quick Links</h4>
            <div className='space-y-3 text-muted-foreground'>
              <Link
                href='/'
                className='block hover:text-primary transition-colors'
              >
                Home
              </Link>
              <Link
                href='/courses'
                className='block hover:text-primary transition-colors'
              >
                All Courses
              </Link>
              <Link
                href='/about'
                className='block hover:text-primary transition-colors'
              >
                About Us
              </Link>
              <Link
                href='/contact'
                className='block hover:text-primary transition-colors'
              >
                Contact
              </Link>
              <Link
                href='/blog'
                className='block hover:text-primary transition-colors'
              >
                Blog
              </Link>
            </div>
          </div>

          {/* Course Categories */}
          <div className='space-y-4'>
            <h4 className='font-semibold text-lg'>Categories</h4>
            <div className='space-y-3 text-muted-foreground'>
              <Link
                href='/courses?category=web-development'
                className='block hover:text-primary transition-colors'
              >
                Web Development
              </Link>
              <Link
                href='/courses?category=design'
                className='block hover:text-primary transition-colors'
              >
                Design
              </Link>
              <Link
                href='/courses?category=data-science'
                className='block hover:text-primary transition-colors'
              >
                Data Science
              </Link>
              <Link
                href='/courses?category=mobile'
                className='block hover:text-primary transition-colors'
              >
                Mobile Development
              </Link>
              <Link
                href='/courses?category=business'
                className='block hover:text-primary transition-colors'
              >
                Business
              </Link>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className='space-y-4'>
            <h4 className='font-semibold text-lg'>Stay Connected</h4>
            <div className='space-y-3 text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <Mail className='h-4 w-4' />
                <span className='text-sm'>hello@learnhub.com</span>
              </div>
              <div className='flex items-center gap-2'>
                <Phone className='h-4 w-4' />
                <span className='text-sm'>+1 (555) 123-4567</span>
              </div>
              <div className='flex items-center gap-2'>
                <MapPin className='h-4 w-4' />
                <span className='text-sm'>San Francisco, CA</span>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Subscribe to our newsletter</p>
              <div className='flex gap-2'>
                <Input placeholder='Enter your email' className='text-sm' />
                <Button size='sm'>Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        <div className='border-t mt-8 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-muted-foreground text-sm'>
              &copy; 2024 LearnHub. All rights reserved. Made with ❤️ for
              learners worldwide.
            </p>
            <div className='flex items-center gap-6 text-sm text-muted-foreground'>
              <Link
                href='/privacy'
                className='hover:text-primary transition-colors'
              >
                Privacy Policy
              </Link>
              <Link
                href='/terms'
                className='hover:text-primary transition-colors'
              >
                Terms of Service
              </Link>
              <Link
                href='/cookies'
                className='hover:text-primary transition-colors'
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
