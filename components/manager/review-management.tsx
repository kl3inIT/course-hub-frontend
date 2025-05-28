"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, MessageSquare, ThumbsUp, Flag, Search, RefreshCw } from "lucide-react"

interface Review {
  id: string
  studentName: string
  studentAvatar: string
  courseName: string
  rating: number
  content: string
  date: string
  hasResponse: boolean
  response?: string
  helpful: number
  reported: boolean
}

const mockReviews: Review[] = [
  {
    id: "1",
    studentName: "Alice Johnson",
    studentAvatar: "/placeholder.svg?height=40&width=40",
    courseName: "React Fundamentals",
    rating: 5,
    content:
      "Excellent course! The instructor explains concepts clearly and the hands-on projects were really helpful for understanding React.",
    date: "2024-01-25",
    hasResponse: false,
    helpful: 12,
    reported: false,
  },
  {
    id: "2",
    studentName: "Bob Smith",
    studentAvatar: "/placeholder.svg?height=40&width=40",
    courseName: "Advanced JavaScript",
    rating: 4,
    content: "Great course content, but I wish there were more practical exercises. The theory is solid though.",
    date: "2024-01-24",
    hasResponse: true,
    response: "Thank you for the feedback! I'll be adding more practical exercises in the next update.",
    helpful: 8,
    reported: false,
  },
  {
    id: "3",
    studentName: "Carol Davis",
    studentAvatar: "/placeholder.svg?height=40&width=40",
    courseName: "CSS Mastery",
    rating: 3,
    content: "The course is okay, but some topics feel rushed. More time on flexbox and grid would be helpful.",
    date: "2024-01-23",
    hasResponse: false,
    helpful: 3,
    reported: false,
  },
  {
    id: "4",
    studentName: "David Wilson",
    studentAvatar: "/placeholder.svg?height=40&width=40",
    courseName: "Node.js Backend",
    rating: 5,
    content: "Outstanding course! Comprehensive coverage of Node.js and practical examples. Highly recommended!",
    date: "2024-01-22",
    hasResponse: true,
    response: "Thank you so much for the kind words! I'm glad you found the course helpful.",
    helpful: 15,
    reported: false,
  },
]

export function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [responseFilter, setResponseFilter] = useState<string>("all")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [responseText, setResponseText] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter
    const matchesCourse = courseFilter === "all" || review.courseName === courseFilter
    const matchesResponse =
      responseFilter === "all" ||
      (responseFilter === "responded" && review.hasResponse) ||
      (responseFilter === "pending" && !review.hasResponse)

    return matchesSearch && matchesRating && matchesCourse && matchesResponse
  })

  const handleSubmitResponse = () => {
    if (selectedReview && responseText.trim()) {
      setReviews((prev) =>
        prev.map((review) =>
          review.id === selectedReview.id ? { ...review, hasResponse: true, response: responseText } : review,
        ),
      )
      setResponseText("")
      setSelectedReview(null)
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const totalReviews = reviews.length
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const pendingResponses = reviews.filter((r) => !r.hasResponse).length

  const uniqueCourses = [...new Set(reviews.map((r) => r.courseName))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Management</h1>
          <p className="text-muted-foreground">Manage student feedback and responses</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex mt-1">{renderStars(Math.round(averageRating))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingResponses}</div>
            <p className="text-xs text-muted-foreground">Need your response</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {uniqueCourses.map((course) => (
              <SelectItem key={course} value={course}>
                {course}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={responseFilter} onValueChange={setResponseFilter}>
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue placeholder="Response" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={review.studentAvatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {review.studentName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{review.studentName}</h3>
                    <p className="text-sm text-muted-foreground">{review.courseName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{review.content}</p>

              {review.hasResponse && review.response && (
                <div className="bg-muted p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium mb-1">Your Response:</p>
                  <p className="text-sm">{review.response}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="mr-1 h-3 w-3" />
                    {review.helpful} Helpful
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="mr-1 h-3 w-3" />
                    Report
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  {review.hasResponse ? (
                    <Badge variant="secondary">Responded</Badge>
                  ) : (
                    <Badge variant="outline">Pending Response</Badge>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
                        <MessageSquare className="mr-1 h-3 w-3" />
                        {review.hasResponse ? "Update Response" : "Respond"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Respond to Review</DialogTitle>
                        <DialogDescription>
                          Respond to {review.studentName}'s review for {review.courseName}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm font-medium">{review.studentName}</span>
                          </div>
                          <p className="text-sm">{review.content}</p>
                        </div>

                        <Textarea
                          placeholder="Write your response..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedReview(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmitResponse}>
                          {review.hasResponse ? "Update Response" : "Send Response"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">No reviews found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search criteria or wait for student feedback.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
