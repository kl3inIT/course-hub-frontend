"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { httpClient } from "@/api/http-client"
import { ApiResponse } from "@/types/common"
import { ProfileData } from "@/types/user"

interface ValidationErrors {
  [key: string]: string
}

interface ExtendedProfileData extends ProfileData {
  id: string;
  profilePicture: File | null;
}

export function ProfileEditor() {
  const router = useRouter()
  const { user, updateUser, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [formData, setFormData] = useState<ExtendedProfileData>({
    id: user?.id || "",
    name: "",
    email: user?.email || "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    bio: "",
    profilePicture: null,
    avatar: user?.avatar || "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await httpClient.get<ApiResponse<ProfileData>>("/api/users/myInfo")
        const apiResponse = response.data

        // Update form data with fetched profile
        setFormData(prev => ({
          ...prev,
          ...apiResponse.data,
          profilePicture: null // Reset profile picture since we don't get it from API
        }))

        // Set preview URL if avatar exists
        if (apiResponse.data.avatar) {
          setPreviewUrl(apiResponse.data.avatar)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        setErrors({ submit: "Failed to load profile data" })
      }
    }

    if (user?.id) {
      fetchProfile()
    }
  }, [user])

  useEffect(() => {
    // Warn user about unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    } else if (formData.address.length < 2) {
      newErrors.address = "Address must be at least 2 characters"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^\+?[\d\s\-$$$$]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 13) {
        newErrors.dateOfBirth = "You must be at least 13 years old"
      }
    }

    // Bio length validation
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, profilePicture: "Please select an image file" }))
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, profilePicture: "Image size must be less than 5MB" }))
        return
      }

      setFormData((prev) => ({ ...prev, profilePicture: file }))
      setHasUnsavedChanges(true)

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Simulate upload progress
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 100)

      // Clear any previous errors
      setErrors((prev) => ({ ...prev, profilePicture: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Upload avatar if changed
      if (formData.profilePicture) {
        const form = new FormData()
        form.append("file", formData.profilePicture)
        
        const avatarResponse = await httpClient.post<ApiResponse<{ avatar: string }>>("/api/users/avatar", form)
        const avatarApiResponse = avatarResponse.data

        // Update preview URL with new avatar
        if (avatarApiResponse.data.avatar) {
          setPreviewUrl(avatarApiResponse.data.avatar)
        }
      }

      // Update profile
      const response = await httpClient.put<ApiResponse<ProfileData>>("/api/users/profile", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        bio: formData.bio
      })
      const apiResponse = response.data

      // Update user context with new data
      updateUser({
        name: formData.name,
        email: formData.email,
        avatar: apiResponse.data.avatar
      })

      setHasUnsavedChanges(false)
      router.push("/profile")
    } catch (error) {
      console.error("Profile update error:", error)
      setErrors({ submit: "Failed to update profile. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (deleteConfirmation !== "DELETE") {
      setErrors({ delete: "Please type 'DELETE' to confirm" })
      return
    }

    setIsLoading(true)

    try {
      await httpClient.delete<ApiResponse<void>>("/api/users/profile")

      // Logout user after successful deletion
      await logout()

      // Redirect to home
      router.push("/")
    } catch (error) {
      console.error("Profile deletion error:", error)
      setErrors({ delete: "Failed to delete profile. Please try again." })
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const completionPercentage = () => {
    const fields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.dateOfBirth,
      formData.gender,
      formData.address,
      formData.bio,
      previewUrl,
    ]
    const filledFields = fields.filter((field) => field && field !== "").length
    return Math.round((filledFields / fields.length) * 100)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">Update your profile information</p>
          </div>
        </div>
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete Profile
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your profile and remove all associated data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deleteConfirmation">
                  Type <strong>DELETE</strong> to confirm:
                </Label>
                <Input
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              {errors.delete && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.delete}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProfile} disabled={isLoading}>
                {isLoading ? "Deleting..." : "Delete Profile"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {hasUnsavedChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You have unsaved changes. Don't forget to save your profile.</AlertDescription>
        </Alert>
      )}

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile Completion</span>
              <span>{completionPercentage()}%</span>
            </div>
            <Progress value={completionPercentage()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Picture
            </CardTitle>
            <CardDescription>Update your profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {formData.name ? (
                    `${formData.name[0]}`
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="profilePicture" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Change Photo</span>
                  </div>
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
                {uploadProgress > 0 && uploadProgress < 100 && <Progress value={uploadProgress} className="h-1" />}
              </div>
            </div>
            {errors.profilePicture && (
              <Alert variant="destructive">
                <AlertDescription>{errors.profilePicture}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Your basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter your address"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                />
                {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="City, Country"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Optional information to complete your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className={errors.bio ? "border-red-500" : ""}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{errors.bio && <span className="text-red-500">{errors.bio}</span>}</span>
                <span>{formData.bio.length}/500</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        {errors.submit && (
          <Alert variant="destructive">
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
