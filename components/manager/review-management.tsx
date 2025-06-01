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
import { reviewService, Review } from "@/app/services/reviewService"
import { categoryAPI, CategoryResponseDTO } from "@/api/category"

export function ReviewManagement() {
  const PAGE_SIZE = 5;
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [responseFilter, setResponseFilter] = useState<string>("all")
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [responseText, setResponseText] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    const fetchReviews = async () => {
      setIsRefreshing(true);
      // Lấy toàn bộ review, không phân trang ở API
      const data = await reviewService.getReviews(0, 10000, 'modifiedDate', 'DESC');
      setAllReviews(data.content);
      setIsRefreshing(false);
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    // Lấy danh sách category
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getAllCategories({ size: 100 });
        setCategories(res.data.content);
      } catch (e) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Filter và phân trang lại trên FE
  useEffect(() => {
    let filtered = allReviews.filter((review) => {
      const matchesSearch =
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = ratingFilter === "all" || review.star.toString() === ratingFilter;
      const matchesCategory = categoryFilter === "all" || categories.find(c => c.id === review.courseId?.toString())?.id === categoryFilter;
      let matchesResponse = true;
      if (responseFilter === "responded") {
        matchesResponse = Boolean(review.modifiedDate && review.modifiedDate !== review.createdDate);
      }
      return matchesSearch && matchesRating && matchesCategory && matchesResponse;
    });
    setTotalReviews(filtered.length);
    const pages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    setTotalPages(pages);
    // Nếu page vượt quá số trang mới, reset về 0
    if (page >= pages) setPage(0);
    // Lấy review cho trang hiện tại
    setReviews(filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
  }, [allReviews, searchTerm, ratingFilter, categoryFilter, responseFilter, page]);

  // Khi filter thay đổi, reset về page 0
  useEffect(() => {
    setPage(0);
  }, [searchTerm, ratingFilter, categoryFilter, responseFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleSubmitResponse = () => {
    if (selectedReview && responseText.trim()) {
      setReviews((prev) =>
        prev.map((review) =>
          review.id === selectedReview.id ? { ...review, modifiedDate: new Date().toISOString() } : review,
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

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.star, 0) / reviews.length : 0
  const pendingResponses = reviews.filter((r) => !r.modifiedDate).length
  const respondedCount = reviews.filter(r => r.modifiedDate && r.modifiedDate !== r.createdDate).length

  const uniqueCourses = [...new Set(reviews.map((r) => r.courseName))]

  const displayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  };

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
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={responseFilter} onValueChange={setResponseFilter}>
          <SelectTrigger className="w-full md:w-[140px]">
            <SelectValue placeholder="Response" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
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
                    <AvatarImage src={review.userAvatar || "/placeholder.svg"} />
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
                          Response
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
        <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0}>
          Previous
        </Button>
        <span>Page {page + 1} of {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages - 1}>
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
