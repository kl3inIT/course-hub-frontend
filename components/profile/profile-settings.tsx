'use client'

import { useState, useEffect } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Shield, Save, Camera } from 'lucide-react'
import { RoleBadge } from '@/components/ui/role-badge'
import { PaymentHistory } from '@/components/profile/payment-history'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { userApi } from '@/api/user-api'
import type { ProfileData } from '@/types/user'

// Utils
const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return ''

  try {
    // Nếu là format dd/MM/yyyy từ database
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // Nếu là ISO format với timezone (có Z hoặc có +/-)
    if (dateString.includes('T')) {
      // Tạo date với UTC+7
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Nếu đã là YYYY-MM-DD
    return dateString
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

// Custom hooks
const useProfileData = () => {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    bio: '',
    phone: '',
    address: '',
    avatar: '',
    dateOfBirth: '',
    gender: '',
  })

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await userApi.getMyInfo()
      const userData = response.data

      // Format the date when receiving from server
      setProfileData({
        ...userData,
        dateOfBirth: formatDateForInput(userData.dateOfBirth),
      })
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Could not fetch user information'
      setError(errorMessage)
      toast.error(errorMessage)

      if (error?.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (formData: FormData) => {
    try {
      const result = await userApi.updateProfile(formData)

      if (result?.data) {
        // Format the date when receiving updated data from server
        setProfileData(prev => ({
          ...prev,
          ...result.data,
          dateOfBirth: formatDateForInput(result.data.dateOfBirth),
        }))

        updateUser({
          ...user,
          name: result.data.name,
          email: result.data.email,
          avatar: result.data.avatar,
        })

        toast.success('Profile updated successfully')
        return true
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to update profile'
      toast.error(errorMessage)
      return false
    }
  }

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  return {
    isLoading,
    error,
    profileData,
    setProfileData,
    updateProfile,
  }
}

const usePasswordChange = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const changePassword = async () => {
    if (isProcessing) return false

    try {
      setIsProcessing(true)

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match')
        return false
      }

      await userApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      )

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setIsChangingPassword(false)
      toast.success('Password changed successfully')
      return true
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'Failed to change password'
      toast.error(errorMessage)
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    isChangingPassword,
    setIsChangingPassword,
    passwordData,
    setPasswordData,
    changePassword,
    isProcessing,
  }
}

const useAvatarUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error('File must be JPEG, PNG or GIF')
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(URL.createObjectURL(file))
    setSelectedFile(file)
  }

  const resetAvatar = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl('')
    setSelectedFile(null)
  }

  return {
    selectedFile,
    previewUrl,
    handleAvatarSelect,
    resetAvatar,
  }
}

export function ProfileSettings() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const { isLoading, error, profileData, setProfileData, updateProfile } =
    useProfileData()
  const {
    isChangingPassword,
    setIsChangingPassword,
    passwordData,
    setPasswordData,
    changePassword,
    isProcessing,
  } = usePasswordChange()
  const { selectedFile, previewUrl, handleAvatarSelect, resetAvatar } =
    useAvatarUpload()

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev: ProfileData) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    const formData = new FormData()

    // Required fields
    formData.append('name', profileData.name)
    formData.append('email', profileData.email)

    // Optional fields
    if (profileData.bio) formData.append('bio', profileData.bio)
    if (profileData.phone) formData.append('phone', profileData.phone)
    if (profileData.address) formData.append('address', profileData.address)
    if (profileData.dateOfBirth) {
      // Gửi trực tiếp giá trị từ input date (đã ở định dạng YYYY-MM-DD)
      formData.append('dateOfBirth', profileData.dateOfBirth)
    }
    if (profileData.gender) formData.append('gender', profileData.gender)
    if (selectedFile) formData.append('avatar', selectedFile)

    const success = await updateProfile(formData)
    if (success) {
      setIsEditing(false)
      resetAvatar()
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-3'>
          <p>Loading...</p>
          {error && <p className='text-red-500'>{error}</p>}
        </div>
      </div>
    )
  }

  // Not logged in state
  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-3'>
          <p className='text-muted-foreground'>
            Vui lòng đăng nhập để xem thông tin.
          </p>
          {error && <p className='text-red-500'>{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Profile Settings</h1>
          <p className='text-muted-foreground'>
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue='general' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='general'>General</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='payments'>Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value='general' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='flex items-center space-x-4'>
                <Avatar className='h-20 w-20'>
                  <AvatarImage
                    src={previewUrl || profileData.avatar || '/placeholder.svg'}
                  />
                  <AvatarFallback className='text-lg'>
                    {profileData.name ? profileData.name[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-2'>
                  <div className='relative'>
                    <Input
                      type='file'
                      accept='image/jpeg,image/png,image/gif'
                      onChange={handleAvatarSelect}
                      className='hidden'
                      id='avatar-upload'
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        document.getElementById('avatar-upload')?.click()
                      }
                      disabled={!isEditing}
                    >
                      <Camera className='h-4 w-4 mr-2' />
                      Change Photo
                    </Button>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                  {selectedFile && (
                    <p className='text-sm text-blue-500'>
                      Click "Save Changes" to upload.
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Full Name</Label>
                  <Input
                    id='name'
                    value={profileData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='phone'>Phone Number</Label>
                  <Input
                    id='phone'
                    value={profileData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder='Enter your phone number'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='address'>Address</Label>
                  <Input
                    id='address'
                    value={profileData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    placeholder='Enter your address'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='dateOfBirth'>Date of Birth</Label>
                  <Input
                    id='dateOfBirth'
                    type='date'
                    value={profileData.dateOfBirth}
                    onChange={e =>
                      handleInputChange('dateOfBirth', e.target.value)
                    }
                    disabled={!isEditing}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='gender'>Gender</Label>
                  <Select
                    value={profileData.gender}
                    onValueChange={value => handleInputChange('gender', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id='gender'>
                      <SelectValue placeholder='Select your gender' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Male'>Male</SelectItem>
                      <SelectItem value='Female'>Female</SelectItem>
                      <SelectItem value='Other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='bio'>Bio</Label>
                <Textarea
                  id='bio'
                  value={profileData.bio}
                  onChange={e => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder='Tell us about yourself...'
                  rows={4}
                />
              </div>

              <div className='flex items-center justify-between pt-4'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Shield className='h-4 w-4' />
                    <span className='text-sm font-medium'>Account Role</span>
                    <RoleBadge role={user.role} />
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    Member since {user.joinDate || '2024'}
                  </p>
                </div>
                <div className='flex gap-2'>
                  {isEditing ? (
                    <>
                      <Button
                        variant='outline'
                        onClick={() => {
                          setIsEditing(false)
                          resetAvatar()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className='h-4 w-4 mr-2' />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                {!isChangingPassword ? (
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium'>Password</h4>
                      <p className='text-sm text-muted-foreground'>
                        Change your account password
                      </p>
                    </div>
                    <Button
                      variant='outline'
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='currentPassword'>Current Password</Label>
                      <Input
                        id='currentPassword'
                        type='password'
                        value={passwordData.currentPassword}
                        onChange={e =>
                          setPasswordData(prev => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='newPassword'>New Password</Label>
                      <Input
                        id='newPassword'
                        type='password'
                        value={passwordData.newPassword}
                        onChange={e =>
                          setPasswordData(prev => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='confirmPassword'>
                        Confirm New Password
                      </Label>
                      <Input
                        id='confirmPassword'
                        type='password'
                        value={passwordData.confirmPassword}
                        onChange={e =>
                          setPasswordData(prev => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='flex gap-2 justify-end pt-2'>
                      <Button
                        variant='outline'
                        onClick={() => {
                          setIsChangingPassword(false)
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          })
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={changePassword} disabled={isProcessing}>
                        Save Password
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='payments' className='space-y-6'>
          <PaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
