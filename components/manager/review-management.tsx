"use client"

import { useState, useEffect } from "react"
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
import { reviewApi } from "@/api/review-api"
import { categoryApi } from "@/api/category-api"
import { ReviewResponseDTO, ReviewSearchParams } from "@/types/review"
import { CategoryResponseDTO } from "@/types/category"
import { Page } from "@/types/common"
import { toast } from "@/hooks/use-toast"

export function ReviewManagement() {
  const [reviews, setReviews] = useState<ReviewResponseDTO[]>([])
  const [pagination, setPagination] = useState<Page<ReviewResponseDTO>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 5,
    number: 0
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [responseFilter, setResponseFilter] = useState<string>("all")
  const [selectedReview, setSelectedReview] = useState<ReviewResponseDTO | null>(null)
  const [responseText, setResponseText] = useState("")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])

  // Fetch reviews
  const fetchReviews = async (page: number = 0, size: number = 5) => {
    try {
      setLoading(true)
      const params: ReviewSearchParams = {
        page,
        size,
        sortBy: 'modifiedDate',
        direction: 'DESC',
        star: ratingFilter !== 'all' ? parseInt(ratingFilter) : undefined,
        courseId: categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined
      }
      const response = await reviewApi.getAllReviews(params)
      setReviews(response.data.content)
      setPagination(response.data)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast({
        title: "Error",
        description: "Failed to fetch reviews. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchReviews()
  }, [])

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories({ size: 100 })
        setCategories(response.data.content)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Handle filters
  useEffect(() => {
    fetchReviews(0, pagination.size)
  }, [ratingFilter, categoryFilter])

  const handleRefresh = () => {
    fetchReviews(pagination.number, pagination.size)
  }

  const handleSubmitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return

    try {
      await reviewApi.updateReview(selectedReview.id, {
        courseId: selectedReview.courseId,
        star: selectedReview.star,
        comment: responseText.trim()
      })
      
      toast({
        title: "Success",
        description: "Response submitted successfully",
      })
      
      setResponseText("")
      setSelectedReview(null)
      fetchReviews(pagination.number, pagination.size)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.star, 0) / reviews.length : 0
  const respondedCount = reviews.filter(r => r.modifiedDate && r.modifiedDate !== r.createdDate).length

  const displayDate = (dateStr: string) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Management</h1>
          <p className="text-muted-foreground">Manage student feedback and responses</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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
            <div className="text-2xl font-bold">{pagination.totalElements}</div>
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
            <CardTitle className="text-sm font-medium">Responses Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{respondedCount}</div>
            <p className="text-xs text-muted-foreground">Responses sent</p>
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

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {review.userName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{review.userName}</h3>
                    <p className="text-sm text-muted-foreground">{review.courseName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex">{renderStars(review.star)}</div>
                  <span className="text-sm text-muted-foreground">{displayDate(review.modifiedDate)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{review.comment}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="mr-1 h-3 w-3" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="mr-1 h-3 w-3" />
                    Report
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedReview(review)}>
                        <MessageSquare className="mr-1 h-3 w-3" />
                        Response
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Respond to Review</DialogTitle>
                        <DialogDescription>
                          Respond to {review.userName}'s review for {review.courseName}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">{renderStars(review.star)}</div>
                            <span className="text-sm font-medium">{review.userName}</span>
                          </div>
                          <p className="text-sm">{review.comment}</p>
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
                          Submit Response
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

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchReviews(pagination.number - 1, pagination.size)} 
          disabled={pagination.number === 0}
        >
          Previous
        </Button>
        <span>Page {pagination.number + 1} of {pagination.totalPages}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchReviews(pagination.number + 1, pagination.size)} 
          disabled={pagination.number === pagination.totalPages - 1}
        >
          Next
        </Button>
      </div>

      {reviews.length === 0 && (
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
