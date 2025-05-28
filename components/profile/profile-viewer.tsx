"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Linkedin,
  Twitter,
  Edit,
  Shield,
  BookOpen,
  Award,
  Clock,
} from "lucide-react"
import { RoleBadge } from "@/components/ui/role-badge"

interface ProfileData {
  id: string
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
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface ProfileViewerProps {
  userId?: string
}

export function ProfileViewer({ userId }: ProfileViewerProps) {
  const router = useRouter()
  const { user, hasPermission } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)

      try {
        // Determine which profile to load
        const targetUserId = userId || user?.id
        const isOwn = !userId || userId === user?.id
        setIsOwnProfile(isOwn)

        if (!targetUserId) {
          setIsLoading(false)
          return
        }

        // Load profile data
        const savedProfile = localStorage.getItem(`profile-${targetUserId}`)
        if (savedProfile) {
          const profile = JSON.parse(savedProfile)
          setProfileData(profile)
        } else if (isOwn && user) {
          // Create basic profile from user data if none exists
          const nameParts = user.name?.split(" ") || ["", ""]
          const basicProfile: ProfileData = {
            id: user.id,
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: user.email,
            phone: "",
            dateOfBirth: "",
            gender: "",
            location: "",
            bio: "",
            website: "",
            linkedin: "",
            twitter: "",
            avatar: user.avatar,
            createdAt: user.joinDate || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          setProfileData(basicProfile)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [userId, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!profileData && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <User className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Please log in</h3>
            <p className="text-muted-foreground">You need to be logged in to view profiles.</p>
          </div>
          <Button onClick={() => router.push("/login")}>Log In</Button>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <User className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Profile not found</h3>
            <p className="text-muted-foreground">
              {isOwnProfile ? "You haven't created a profile yet." : "This user's profile is not available."}
            </p>
          </div>
          {isOwnProfile && <Button onClick={() => router.push("/profile/create")}>Create Profile</Button>}
        </div>
      </div>
    )
  }

  const canEdit = isOwnProfile || hasPermission("edit_user_accounts")
  const fullName = `${profileData.firstName} ${profileData.lastName}`.trim()
  const joinDate = new Date(profileData.createdAt).toLocaleDateString()
  const lastUpdated = new Date(profileData.updatedAt).toLocaleDateString()

  // Mock data for demonstration
  const mockStats = {
    coursesEnrolled: 12,
    coursesCompleted: 8,
    certificatesEarned: 5,
    totalLearningHours: 156,
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isOwnProfile ? "My Profile" : `${fullName}'s Profile`}</h1>
          <p className="text-muted-foreground">
            {isOwnProfile ? "Manage your profile information" : "View profile information"}
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => router.push("/profile/edit")}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32 mx-auto md:mx-0">
              <AvatarImage src={profileData.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">
                {profileData.firstName && profileData.lastName ? (
                  `${profileData.firstName[0]}${profileData.lastName[0]}`
                ) : (
                  <User className="h-12 w-12" />
                )}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">{fullName || "Anonymous User"}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <Shield className="h-4 w-4" />
                  <RoleBadge role={user?.role || "learner"} />
                </div>
              </div>

              {profileData.bio && <p className="text-muted-foreground text-center md:text-left">{profileData.bio}</p>}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{mockStats.coursesEnrolled}</div>
                  <div className="text-sm text-muted-foreground">Courses Enrolled</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{mockStats.coursesCompleted}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{mockStats.certificatesEarned}</div>
                  <div className="text-sm text-muted-foreground">Certificates</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{mockStats.totalLearningHours}h</div>
                  <div className="text-sm text-muted-foreground">Learning Time</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.email}</span>
                </div>
                {profileData.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
                {profileData.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.location}</span>
                  </div>
                )}
                {profileData.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {profileData.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Born {new Date(profileData.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
                {profileData.gender && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{profileData.gender}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {joinDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Last updated {lastUpdated}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Links */}
          {(profileData.linkedin || profileData.twitter) && (
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {profileData.linkedin && (
                    <a
                      href={profileData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {profileData.twitter && (
                    <a
                      href={profileData.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Activity
              </CardTitle>
              <CardDescription>Recent learning progress and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">React Fundamentals</h4>
                    <p className="text-sm text-muted-foreground">Completed lesson 5 of 12</p>
                  </div>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">JavaScript Basics</h4>
                    <p className="text-sm text-muted-foreground">Course completed</p>
                  </div>
                  <Badge variant="default">Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">CSS Grid Layout</h4>
                    <p className="text-sm text-muted-foreground">Started 2 days ago</p>
                  </div>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements & Certificates
              </CardTitle>
              <CardDescription>Earned certificates and learning milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">JavaScript Expert</h4>
                    <p className="text-sm text-muted-foreground">Completed advanced JavaScript course</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">React Developer</h4>
                    <p className="text-sm text-muted-foreground">Mastered React fundamentals</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">CSS Master</h4>
                    <p className="text-sm text-muted-foreground">Advanced CSS and layout techniques</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Quick Learner</h4>
                    <p className="text-sm text-muted-foreground">Completed 5 courses in one month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
