'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { categoryApi } from '@/services/category-api'
import { reviewApi } from '@/services/review-api'
import { CategoryResponseDTO } from '@/types/category'
import { Page } from '@/types/common'
import { ReviewResponseDTO } from '@/types/review'
import {
  Eye,
  EyeOff,
  Flag,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Star
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export function ReviewManagement() {
  const [reviews, setReviews] = useState<ReviewResponseDTO[]>([])
  const [pagination, setPagination] = useState<Page<ReviewResponseDTO>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 100,
    number: 0,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [responseFilter, setResponseFilter] = useState<string>('all')
  const [selectedReview, setSelectedReview] =
    useState<ReviewResponseDTO | null>(null)
  const [responseText, setResponseText] = useState('')
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])

  // Analytics state
  const [totalReviews, setTotalReviews] = useState(0)
  const [globalAverageRating, setGlobalAverageRating] = useState(0)

  // Tab management
  const [activeTab, setActiveTab] = useState<'visible' | 'hidden'>('visible')

  // Report modal states
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null)
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

  const reportReasons = [
    { id: 'Spam', label: 'Spam or advertising' },
    { id: 'Inappropriate', label: 'Inappropriate content' },
    { id: 'Harassment', label: 'Harassment or bullying' },
    { id: 'Other', label: 'Other reason' },
  ]

  // Fetch analytics data from backend APIs
  const fetchAnalytics = async () => {
    try {
      const [totalResponse, avgResponse] = await Promise.all([
        reviewApi.getTotalReviews(),
        reviewApi.getOverallAverageRating()
      ])
      
      setTotalReviews(totalResponse.data)
      setGlobalAverageRating(avgResponse.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  // Fetch reviews
  const fetchReviews = async (page: number = 0, size: number = 3) => {
    try {
      setLoading(true)
      const visibilityStatus = activeTab === 'visible' ? 0 : 1
      
      console.log('Fetching reviews with:', { visibilityStatus, page, size, activeTab })
      
      // Test with all reviews first
      const response = await reviewApi.getAllReviews({
        page,
        size,
        sortBy: 'modifiedDate',
        direction: 'DESC'
      })
      
      // Original API call (comment out temporarily)
      // const response = await reviewApi.getReviewsByVisibility(visibilityStatus, {
      //   page,
      //   size,
      //   sortBy: 'modifiedDate',
      //   direction: 'DESC'
      // })
      
      console.log('API Response:', response)
      console.log('Response data:', response.data)
      
      const reviews = response.data.content || []
      const totalElements = response.data.totalElements || reviews.length
      const totalPages = response.data.totalPages || Math.ceil(totalElements / size)
      
      setReviews(reviews)
      setPagination({
        content: reviews,
        totalElements: totalElements,
        totalPages: totalPages,
        size: response.data.size || size,
        number: response.data.number || page,
      })
    } catch (error) {
      console.error('Fetch reviews error:', error)
      toast('Failed to load reviews. Please try again!')
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchReviews()
    fetchAnalytics()
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
  }, [ratingFilter, categoryFilter, activeTab])

  const handleRefresh = () => {
    fetchReviews(pagination.number, pagination.size)
    fetchAnalytics()
  }

  const handleToggleVisibility = async (reviewId: number, isCurrentlyHidden: boolean) => {
    try {
      await reviewApi.setReviewVisibility(reviewId, !isCurrentlyHidden)
      toast.success(isCurrentlyHidden ? 'Review unhidden successfully!' : 'Review hidden successfully!')
      fetchReviews(pagination.number, pagination.size)
      fetchAnalytics()
    } catch (error) {
      toast.error('Failed to change review visibility. Please try again!')
    }
  }

  const handleSubmitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return

    try {
      await reviewApi.updateReview(selectedReview.id, {
        courseId: selectedReview.courseId,
        star: selectedReview.star,
        comment: responseText.trim(),
      })

      toast('Response submitted successfully!')

      setResponseText('')
      setSelectedReview(null)
      fetchReviews(pagination.number, pagination.size)
    } catch (error) {
      toast('Failed to submit response. Please try again!')
    }
  }

  // Handle report functions
  const handleReport = useCallback(
    async (reviewId: number, reason: string, description?: string) => {
      setIsSubmittingReport(true)
      
      // Simulate API call for now (replace with actual API call later)
      setTimeout(() => {
        // Show success message
        toast.success('Report submitted successfully!', {
          description: 'We will review your report as soon as possible.',
          duration: 4000,
        })
        
        // Close modal and reset state
        setShowReport(false)
        setReportReason('')
        setReportDescription('')
        setSelectedReviewId(null)
        setIsSubmittingReport(false)
      }, 1500) // Simulate 1.5 second loading
    },
    []
  )

  const handleOpenReport = (reviewId: number) => {
    setSelectedReviewId(reviewId)
    setShowReport(true)
  }

  const handleCloseReport = () => {
    setShowReport(false)
    setReportReason('')
    setReportDescription('')
    setSelectedReviewId(null)
    setIsSubmittingReport(false)
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const displayDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
  }

  return (
    <div className='space-y-6 min-h-screen'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Review Management</h1>
          <p className='text-muted-foreground'>
            Manage student feedback and responses
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Reviews</CardTitle>
            <MessageSquare className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalReviews}</div>
            <p className='text-xs text-muted-foreground'>Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Rating
            </CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{globalAverageRating}</div>
            <div className='flex mt-1'>
              {renderStars(Math.round(globalAverageRating))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Visible/Hidden Reviews */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'visible' | 'hidden')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visible" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visible Reviews
          </TabsTrigger>
          <TabsTrigger value="hidden" className="flex items-center gap-2">
            <EyeOff className="h-4 w-4" />
            Hidden Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visible" className="space-y-4">
          {/* Filters for visible reviews */}
          <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search reviews...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className='w-full md:w-[140px]'>
                <SelectValue placeholder='Rating' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Ratings</SelectItem>
                <SelectItem value='5'>5 Stars</SelectItem>
                <SelectItem value='4'>4 Stars</SelectItem>
                <SelectItem value='3'>3 Stars</SelectItem>
                <SelectItem value='2'>2 Stars</SelectItem>
                <SelectItem value='1'>1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visible Reviews List */}
          <div className='space-y-4'>
            {reviews.map(review => (
              <Card key={review.id}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-3'>
                      <Avatar>
                        <AvatarFallback>
                          {review.userName
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className='font-medium'>{review.userName}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {review.courseName}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <div className='flex'>{renderStars(review.star)}</div>
                      <span className='text-sm text-muted-foreground'>
                        {displayDate(review.modifiedDate)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex justify-between items-center'>
                    <p className='text-sm mb-4 mr-4'>{review.comment}</p>
                    <div className='flex gap-2'>
                      <Button 
                        variant='outline' 
                        size='sm' 
                        onClick={() => handleToggleVisibility(review.id, false)}
                      >
                        Hide
                      </Button>
                      <Button variant='ghost' size='sm' onClick={() => handleOpenReport(review.id)}>
                        <Flag className='mr-1 h-3 w-3' />
                        Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hidden" className="space-y-4">
          {/* Hidden Reviews List */}
          <div className='space-y-4'>
            {reviews.map(review => (
              <Card key={review.id} className="opacity-70 border-red-200">
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-3'>
                      <Avatar>
                        <AvatarFallback>
                          {review.userName
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className='font-medium'>{review.userName}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {review.courseName}
                        </p>
                        <span className='text-xs text-red-500 font-medium'>Hidden Review</span>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <div className='flex'>{renderStars(review.star)}</div>
                      <span className='text-sm text-muted-foreground'>
                        {displayDate(review.modifiedDate)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex justify-between items-center'>
                    <p className='text-sm mb-4 mr-4'>{review.comment}</p>
                    <Button 
                      variant='outline' 
                      size='sm' 
                      onClick={() => handleToggleVisibility(review.id, true)}
                    >
                      Unhide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Simple Pagination */}
      {pagination.totalElements > 0 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.number === 0}
            onClick={() => fetchReviews(pagination.number - 1, pagination.size)}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600 px-4">
            Page {pagination.number + 1} of {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.number >= pagination.totalPages - 1}
            onClick={() => fetchReviews(pagination.number + 1, pagination.size)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Items info */}
      <div className="text-center text-sm text-gray-500 mt-2">
        Showing {pagination.totalElements === 0 ? 0 : pagination.number * pagination.size + 1} to{' '}
        {Math.min((pagination.number + 1) * pagination.size, pagination.totalElements)} of{' '}
        {pagination.totalElements} items
      </div>

      {/* Debug info */}
      <div className="text-xs text-gray-400 text-center mt-2">
        Debug: totalPages={pagination.totalPages}, currentPage={pagination.number}, totalElements={pagination.totalElements}, size={pagination.size}
      </div>

      {reviews.length === 0 && (
        <Card>
          <CardContent className='text-center py-8'>
            <MessageSquare className='mx-auto h-12 w-12 text-muted-foreground' />
            <h3 className='mt-2 text-sm font-semibold'>No reviews found</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              {activeTab === 'visible' 
                ? 'No visible reviews available.' 
                : 'No hidden reviews found.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Report Modal */}
      <Dialog open={showReport} onOpenChange={handleCloseReport}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
            <DialogDescription>
              Please let us know why you want to report this review
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <RadioGroup
              value={reportReason}
              onValueChange={setReportReason}
            >
              {reportReasons.map(reason => (
                <div key={reason.id} className='flex items-center space-x-2'>
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id}>{reason.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className='space-y-2'>
              <Label htmlFor='description'>
                Description (optional)
              </Label>
              <Textarea
                id='description'
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder='Add more details about the issue...'
                rows={3}
              />
            </div>
          </div>
          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={handleCloseReport} disabled={isSubmittingReport}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedReviewId &&
                handleReport(selectedReviewId, reportReason, reportDescription)
              }
              disabled={!reportReason || isSubmittingReport}
            >
              {isSubmittingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
