'use client'

import type React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  ArrowLeft,
} from 'lucide-react'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  location: string
  bio: string
  website: string
  linkedin: string
  twitter: string
  profilePicture: File | null
}

interface ValidationErrors {
  [key: string]: string
}

export function ProfileCreator() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    location: '',
    bio: '',
    website: '',
    linkedin: '',
    twitter: '',
    profilePicture: null,
  })

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Required fields validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^\+?[\d\s\-$$$$]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old'
      }
    }

    // Bio length validation
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }

    // URL validation for website
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website =
        'Please enter a valid URL (starting with http:// or https://)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Please select an image file',
        }))
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Image size must be less than 5MB',
        }))
        return
      }

      setFormData(prev => ({ ...prev, profilePicture: file }))

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Simulate upload progress
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 100)

      // Clear any previous errors
      setErrors(prev => ({ ...prev, profilePicture: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update user context
      updateUser({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        avatar: previewUrl || undefined,
      })

      // Store additional profile data in localStorage (in real app, this would be sent to backend)
      const profileData = {
        ...formData,
        id: user?.id || `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem(`profile-${user?.id}`, JSON.stringify(profileData))

      // Redirect to profile view
      router.push('/profile')
    } catch (error) {
      console.error('Profile creation error:', error)
      setErrors({ submit: 'Failed to create profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const completionPercentage = () => {
    const fields = Object.values(formData)
    const filledFields = fields.filter(field => field && field !== '').length
    return Math.round((filledFields / fields.length) * 100)
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back
        </Button>
        <div>
          <h1 className='text-3xl font-bold'>Create Your Profile</h1>
          <p className='text-muted-foreground'>
            Set up your profile to get started
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className='pt-6'>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Profile Completion</span>
              <span>{completionPercentage()}%</span>
            </div>
            <Progress value={completionPercentage()} className='h-2' />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Camera className='h-5 w-5' />
              Profile Picture
            </CardTitle>
            <CardDescription>
              Upload a profile picture to personalize your account
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-6'>
              <Avatar className='h-24 w-24'>
                <AvatarImage src={previewUrl || '/placeholder.svg'} />
                <AvatarFallback className='text-lg'>
                  <User className='h-8 w-8' />
                </AvatarFallback>
              </Avatar>
              <div className='space-y-2'>
                <Label htmlFor='profilePicture' className='cursor-pointer'>
                  <div className='flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors'>
                    <Upload className='h-4 w-4' />
                    <span>Upload Photo</span>
                  </div>
                  <Input
                    id='profilePicture'
                    type='file'
                    accept='image/*'
                    onChange={handleFileUpload}
                    className='hidden'
                  />
                </Label>
                <p className='text-xs text-muted-foreground'>
                  JPG, PNG or GIF. Max size 5MB.
                </p>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress value={uploadProgress} className='h-1' />
                )}
              </div>
            </div>
            {errors.profilePicture && (
              <Alert variant='destructive'>
                <AlertDescription>{errors.profilePicture}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Basic Information
            </CardTitle>
            <CardDescription>Your basic profile information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>First Name *</Label>
                <Input
                  id='firstName'
                  value={formData.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  placeholder='Enter your first name'
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className='text-sm text-red-500'>{errors.firstName}</p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>Last Name *</Label>
                <Input
                  id='lastName'
                  value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  placeholder='Enter your last name'
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className='text-sm text-red-500'>{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email' className='flex items-center gap-2'>
                <Mail className='h-4 w-4' />
                Email Address *
              </Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder='Enter your email address'
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className='text-sm text-red-500'>{errors.email}</p>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='phone' className='flex items-center gap-2'>
                  <Phone className='h-4 w-4' />
                  Phone Number
                </Label>
                <Input
                  id='phone'
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  placeholder='Enter your phone number'
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className='text-sm text-red-500'>{errors.phone}</p>
                )}
              </div>
              <div className='space-y-2'>
                <Label
                  htmlFor='dateOfBirth'
                  className='flex items-center gap-2'
                >
                  <Calendar className='h-4 w-4' />
                  Date of Birth
                </Label>
                <Input
                  id='dateOfBirth'
                  type='date'
                  value={formData.dateOfBirth}
                  onChange={e =>
                    handleInputChange('dateOfBirth', e.target.value)
                  }
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                />
                {errors.dateOfBirth && (
                  <p className='text-sm text-red-500'>{errors.dateOfBirth}</p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='gender'>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={value => handleInputChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select gender' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                    <SelectItem value='prefer-not-to-say'>
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='location' className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4' />
                  Location
                </Label>
                <Input
                  id='location'
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  placeholder='City, Country'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Optional information to complete your profile
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio</Label>
              <Textarea
                id='bio'
                value={formData.bio}
                onChange={e => handleInputChange('bio', e.target.value)}
                placeholder='Tell us about yourself...'
                rows={4}
                className={errors.bio ? 'border-red-500' : ''}
              />
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>
                  {errors.bio && (
                    <span className='text-red-500'>{errors.bio}</span>
                  )}
                </span>
                <span>{formData.bio.length}/500</span>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='website'>Website</Label>
              <Input
                id='website'
                value={formData.website}
                onChange={e => handleInputChange('website', e.target.value)}
                placeholder='https://yourwebsite.com'
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && (
                <p className='text-sm text-red-500'>{errors.website}</p>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='linkedin'>LinkedIn</Label>
                <Input
                  id='linkedin'
                  value={formData.linkedin}
                  onChange={e => handleInputChange('linkedin', e.target.value)}
                  placeholder='https://linkedin.com/in/username'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='twitter'>Twitter</Label>
                <Input
                  id='twitter'
                  value={formData.twitter}
                  onChange={e => handleInputChange('twitter', e.target.value)}
                  placeholder='https://twitter.com/username'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        {errors.submit && (
          <Alert variant='destructive'>
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <div className='flex gap-4'>
          <Button type='button' variant='outline' onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading} className='flex-1'>
            {isLoading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                Creating Profile...
              </>
            ) : (
              <>
                <Save className='h-4 w-4 mr-2' />
                Create Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
