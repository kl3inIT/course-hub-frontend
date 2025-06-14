'use client'

import type React from 'react'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  HelpCircle,
  Users,
  Briefcase,
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      category: '',
      message: '',
    })
    alert("Thank you for your message! We'll get back to you soon.")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const contactInfo = [
    {
      icon: <Mail className='h-6 w-6' />,
      title: 'Email Us',
      details: 'hello@learnhub.com',
      description: 'Send us an email anytime',
    },
    {
      icon: <Phone className='h-6 w-6' />,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 5pm',
    },
    {
      icon: <MapPin className='h-6 w-6' />,
      title: 'Visit Us',
      details: '123 Learning Street, San Francisco, CA 94105',
      description: 'Come say hello at our office',
    },
    {
      icon: <Clock className='h-6 w-6' />,
      title: 'Business Hours',
      details: 'Monday - Friday: 8:00 AM - 5:00 PM PST',
      description: 'Weekend support available',
    },
  ]

  const supportCategories = [
    {
      icon: <HelpCircle className='h-8 w-8' />,
      title: 'General Support',
      description: 'Get help with your account, courses, or technical issues',
    },
    {
      icon: <Users className='h-8 w-8' />,
      title: 'Student Services',
      description:
        'Questions about enrollment, certificates, or learning paths',
    },
    {
      icon: <Briefcase className='h-8 w-8' />,
      title: 'Business Inquiries',
      description: 'Corporate training, partnerships, or bulk licensing',
    },
    {
      icon: <MessageSquare className='h-8 w-8' />,
      title: 'Feedback',
      description: 'Share your thoughts and suggestions to help us improve',
    },
  ]

  return (
    <div className='min-h-screen bg-background'>
      <Navbar />

      {/* Hero Section */}
      <section className='py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5'>
        <div className='container mx-auto text-center space-y-6'>
          <h1 className='text-4xl md:text-5xl font-bold'>Get in Touch</h1>
          <p className='text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
            Have questions, feedback, or need support? We're here to help! Reach
            out to us and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className='py-16 px-4'>
        <div className='container mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
            {/* Contact Form */}
            <Card className='border-2'>
              <CardHeader>
                <CardTitle className='text-2xl'>Send us a Message</CardTitle>
                <p className='text-muted-foreground'>
                  Fill out the form below and we'll get back to you within 24
                  hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='name'>Full Name</Label>
                      <Input
                        id='name'
                        placeholder='Your full name'
                        value={formData.name}
                        onChange={e =>
                          handleInputChange('name', e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='email'>Email Address</Label>
                      <Input
                        id='email'
                        type='email'
                        placeholder='your.email@example.com'
                        value={formData.email}
                        onChange={e =>
                          handleInputChange('email', e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='category'>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={value =>
                        handleInputChange('category', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a category' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='general'>General Support</SelectItem>
                        <SelectItem value='technical'>
                          Technical Issue
                        </SelectItem>
                        <SelectItem value='billing'>
                          Billing Question
                        </SelectItem>
                        <SelectItem value='course'>Course Related</SelectItem>
                        <SelectItem value='business'>
                          Business Inquiry
                        </SelectItem>
                        <SelectItem value='feedback'>Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='subject'>Subject</Label>
                    <Input
                      id='subject'
                      placeholder='Brief description of your inquiry'
                      value={formData.subject}
                      onChange={e =>
                        handleInputChange('subject', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='message'>Message</Label>
                    <Textarea
                      id='message'
                      placeholder='Please provide details about your inquiry...'
                      rows={6}
                      value={formData.message}
                      onChange={e =>
                        handleInputChange('message', e.target.value)
                      }
                      required
                    />
                  </div>

                  <Button type='submit' className='w-full' size='lg'>
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className='space-y-8'>
              <div>
                <h2 className='text-2xl font-bold mb-6'>Contact Information</h2>
                <div className='grid grid-cols-1 gap-6'>
                  {contactInfo.map((info, index) => (
                    <Card
                      key={index}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardContent className='p-6'>
                        <div className='flex items-start gap-4'>
                          <div className='p-3 rounded-lg bg-primary/10 text-primary'>
                            {info.icon}
                          </div>
                          <div>
                            <h3 className='font-semibold text-lg'>
                              {info.title}
                            </h3>
                            <p className='text-muted-foreground font-medium'>
                              {info.details}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              {info.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* FAQ Link */}
              <Card className='bg-muted/50'>
                <CardContent className='p-6 text-center'>
                  <h3 className='font-semibold text-lg mb-2'>
                    Looking for Quick Answers?
                  </h3>
                  <p className='text-muted-foreground mb-4'>
                    Check out our FAQ section for instant answers to common
                    questions.
                  </p>
                  <Button variant='outline'>Visit FAQ</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className='py-16 px-4 bg-muted/50'>
        <div className='container mx-auto space-y-12'>
          <div className='text-center space-y-4'>
            <h2 className='text-3xl font-bold'>How Can We Help?</h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Choose the category that best describes your inquiry for faster
              assistance.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {supportCategories.map((category, index) => (
              <Card
                key={index}
                className='text-center hover:shadow-lg transition-shadow cursor-pointer'
              >
                <CardHeader>
                  <div className='flex justify-center mb-4'>
                    <div className='p-4 rounded-full bg-primary/10 text-primary'>
                      {category.icon}
                    </div>
                  </div>
                  <CardTitle className='text-lg'>{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground text-sm leading-relaxed'>
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className='py-16 px-4'>
        <div className='container mx-auto'>
          <div className='text-center space-y-4 mb-8'>
            <h2 className='text-3xl font-bold'>Find Us</h2>
            <p className='text-muted-foreground'>
              Visit our office in the heart of San Francisco
            </p>
          </div>
          <div className='bg-muted/50 rounded-lg h-96 flex items-center justify-center'>
            <div className='text-center space-y-2'>
              <MapPin className='h-12 w-12 text-muted-foreground mx-auto' />
              <p className='text-muted-foreground'>
                Interactive map would be displayed here
              </p>
              <p className='text-sm text-muted-foreground'>
                123 Learning Street, San Francisco, CA 94105
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
