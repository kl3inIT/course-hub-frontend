"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Shield, Save, Camera } from "lucide-react"
import { RoleBadge } from "@/components/ui/role-badge"
import { PaymentHistory } from "@/components/profile/payment-history"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast, Toaster } from "sonner"
import { ResponseGeneral } from "@/types/User"

const BACKEND_URL = "http://localhost:8080"

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  phone: string;
  address: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
}

// Thêm hàm format date
const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  
  try {
    // Nếu date string có chứa time
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Return empty string if invalid date
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
    
    // Nếu date string đã ở dạng YYYY-MM-DD
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // Thử parse date string và format lại
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Return empty string if invalid date
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return '';
  }
};

export function ProfileSettings() {
  const { user, updateUser, getToken } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    bio: "",
    phone: "",
    address: "",
    avatar: "",
    dateOfBirth: "",
    gender: ""
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      
      try {
        console.log("Fetching profile data...")
        const token = getToken()
        if (!token) {
          throw new Error("No auth token")
        }

        const response = await fetch(`${BACKEND_URL}/api/users/myInfo`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const result = await response.json()
        console.log("Profile data result:", result)
        if (result.message === "Success" && result.data) {
          setProfileData({
            name: result.data.name || "",
            email: result.data.email || "",
            bio: result.data.bio || "",
            phone: result.data.phone || "",
            address: result.data.address || "",
            avatar: result.data.avatar || "",
            dateOfBirth: formatDateForInput(result.data.dateOfBirth),
            gender: result.data.gender || ""
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, getToken])

  // Cleanup preview URL when component unmounts
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

    // Kiểm tra kích thước file (giới hạn 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB")
      return
    }

    // Kiểm tra định dạng file
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError("File must be JPEG, PNG or GIF")
      return
    }

    // Tạo preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(newPreviewUrl)
    setSelectedFile(file)
  }

  const uploadAvatar = async () => {
    if (!selectedFile) return null

    try {
      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const token = getToken()
      if (!token) {
        throw new Error("No auth token")
      }

      const response = await fetch(`${BACKEND_URL}/api/users/avatar`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error("Failed to upload avatar")
      }

      const result = await response.json()
      if (result.message === "Success" && result.data?.avatar) {
        return result.data.avatar
      }
      return null
    } catch (error) {
      console.error("Error uploading avatar:", error)
      throw new Error("Failed to upload avatar")
    }
  }

  const handleSave = async () => {
    try {
      setError("")
      setValidationErrors([])
      const token = getToken()
      if (!token) {
        throw new Error("No auth token")
      }

      // Create FormData with all profile fields and avatar
      const formData = new FormData()
      
      // Add profile data fields
      formData.append('name', profileData.name)
      formData.append('email', profileData.email)
      formData.append('bio', profileData.bio || '')
      formData.append('phone', profileData.phone || '')
      formData.append('address', profileData.address || '')
      formData.append('dateOfBirth', profileData.dateOfBirth || '')
      formData.append('gender', profileData.gender || '')

      // Add avatar file if selected
      if (selectedFile) {
        formData.append('avatar', selectedFile)
      }

      console.log("Sending profile update request...")

      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log("Error response from server:", errorData)
        if (errorData.message === "Validation Error" && Array.isArray(errorData.data)) {
          setValidationErrors(errorData.data)
          return
        }
        throw new Error(errorData.message || "Failed to update profile")
      }

      const result = await response.json()
      if (result.message === "Success") {
        // Update local state and user context with new data
        const updatedProfile = result.data
        setProfileData(prev => ({
          ...prev,
          ...updatedProfile,
          // Ensure dateOfBirth is formatted correctly for input
          dateOfBirth: formatDateForInput(updatedProfile.dateOfBirth)
        }))
        
        // Update user context
        updateUser({
          ...user,
          name: updatedProfile.name,
          email: updatedProfile.email,
          avatar: updatedProfile.avatar
        })

        setIsEditing(false)
        
        // Clear selected file and preview
        setSelectedFile(null)
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
          setPreviewUrl("")
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setError(error instanceof Error ? error.message : "Failed to update profile")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = async () => {
    try {
      setPasswordError("")
      
      // Validate passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError("New passwords do not match")
        toast.error("New passwords do not match")
        return
      }

      const token = getToken()
      if (!token) {
        toast.error("No auth token")
        throw new Error("No auth token")
      }

      const response = await fetch(`${BACKEND_URL}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const errorData = await response.json()
      
      if (!response.ok) {
        let errorMessage = "Failed to change password"
        
        if (errorData.message) {
          if (errorData.message.includes("Current password is incorrect")) {
            errorMessage = "Current password is incorrect"
          } else if (errorData.message.includes("must be different")) {
            errorMessage = "New password must be different from current password"
          } else {
            errorMessage = errorData.message
          }
        }
        
        setPasswordError(errorMessage)
        toast.error(errorMessage)
        return
      }

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      setIsChangingPassword(false)
      
      // Chuyển về tab General
      const tabsElement = document.querySelector('[role="tablist"]') as HTMLElement
      const generalTab = tabsElement?.querySelector('[value="general"]') as HTMLElement
      if (generalTab) {
        generalTab.click()
      }

      // Đợi một chút để tab switch hoàn tất rồi mới hiển thị toast
      setTimeout(() => {
        toast.success("Password changed successfully")
      }, 1000)

    } catch (error) {
      console.error("Error changing password:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to change password"
      setPasswordError(errorMessage)
      toast.error(errorMessage)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Toaster position="top-center" richColors />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={previewUrl || profileData.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {profileData.name ? profileData.name[0].toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleAvatarSelect}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={!isEditing}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                  {selectedFile && (
                    <p className="text-sm text-blue-500">
                      Click "Save Changes" to upload.
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    disabled={!isEditing}
                    max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profileData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Account Role</span>
                    <RoleBadge role={user.role} />
                  </div>
                  <p className="text-sm text-muted-foreground">Member since {user.joinDate || "2024"}</p>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {!isChangingPassword ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-muted-foreground">Change your account password</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                      Change Password
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  
                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="outline" onClick={() => {
                        setIsChangingPassword(false)
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: ""
                        })
                        setPasswordError("")
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handlePasswordChange}>
                        Save Password
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
