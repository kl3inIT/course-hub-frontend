'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { courseApi } from '@/services/course-api'
import { reviewApi } from '@/services/review-api'
import { CategoryResponseDTO } from '@/types/category'
import { CourseResponseDTO } from '@/types/course'
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
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

export function ReviewManagement() {
  const [allReviews, setAllReviews] = useState<ReviewResponseDTO[]>([])
  const [displayedReviews, setDisplayedReviews] = useState<ReviewResponseDTO[]>([])
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [courses, setCourses] = useState<CourseResponseDTO[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [globalAverageRating, setGlobalAverageRating] = useState(0)
  const [activeTab, setActiveTab] = useState<'visible' | 'hidden'>('visible')
  const [rowsPerPage, setRowsPerPage] = useState<string>('10')
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

  const fetchAllReviews = async () => {
    try {
      setLoading(true)
      const visibilityStatus = activeTab === 'visible' ? 0 : 1
      const params: any = { 
        visibilityStatus,
        page: 0, 
        size: 1000, 
        sortBy: 'modifiedDate', 
        direction: 'DESC' as 'DESC'
      }
      
      // Add filters if they are set
      if (ratingFilter !== 'all') {
        params.star = parseInt(ratingFilter)
      }
      if (categoryFilter !== 'all') {
        params.categoryId = parseInt(categoryFilter)
      }
      if (courseFilter !== 'all') {
        params.courseId = parseInt(courseFilter)
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      
      const response = await reviewApi.getReviewsByVisibilityWithFilters(params)
      const allData = response.data.content || []
      setAllReviews(allData)
      updateDisplayedReviews(allData, 0, rowsPerPage)
    } catch (error) {
      console.error('Fetch reviews error:', error)
      toast('Failed to load reviews. Please try again!')
    } finally {
      setLoading(false)
    }
  }

  const updateDisplayedReviews = (data: ReviewResponseDTO[], page: number, sizeStr: string) => {
    let paginatedData: ReviewResponseDTO[]
    let totalPages: number
    
    if (sizeStr === 'all') {
      paginatedData = data
      totalPages = 1
      page = 0
    } else {
      const size = parseInt(sizeStr)
      const startIndex = page * size
      const endIndex = startIndex + size
      paginatedData = data.slice(startIndex, endIndex)
      totalPages = Math.ceil(data.length / size)
    }
    
    setDisplayedReviews(paginatedData)
    setPagination({
      totalElements: data.length,
      totalPages: totalPages,
      size: sizeStr === 'all' ? data.length : parseInt(sizeStr),
      number: page,
    })
  }

  const goToNextPage = () => {
    if (rowsPerPage === 'all') return
    const nextPage = pagination.number + 1
    if (nextPage < pagination.totalPages) {
      updateDisplayedReviews(allReviews, nextPage, rowsPerPage)
    }
  }

  const goToPreviousPage = () => {
    if (rowsPerPage === 'all') return
    const prevPage = pagination.number - 1
    if (prevPage >= 0) {
      updateDisplayedReviews(allReviews, prevPage, rowsPerPage)
    }
  }

  useEffect(() => {
    fetchAllReviews()
    fetchAnalytics()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await categoryApi.getAllCategories({ size: 100 })
        setCategories(categoriesResponse.data.content)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchData()
  }, [])

  // Separate useEffect to load courses when category changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (categoryFilter === 'all') {
        // If no category selected, clear courses and reset course filter
        setCourses([])
        setCourseFilter('all')
        return
      }
      
      try {
        setLoadingCourses(true)
        // Load courses for the selected category
        const coursesResponse = await courseApi.getCoursesByCategory(categoryFilter)
        setCourses(coursesResponse.data || [])
        // Reset course filter when category changes to a specific category
        setCourseFilter('all')
      } catch (error) {
        console.error('Failed to fetch courses for category:', error)
        setCourses([])
        setCourseFilter('all')
      } finally {
        setLoadingCourses(false)
      }
    }
    
    fetchCourses()
  }, [categoryFilter])

  useEffect(() => {
    fetchAllReviews()
  }, [ratingFilter, categoryFilter, courseFilter, activeTab, searchQuery])

  useEffect(() => {
    if (allReviews.length > 0) {
      updateDisplayedReviews(allReviews, 0, rowsPerPage)
    }
  }, [rowsPerPage])

  const handleRefresh = () => {
    fetchAllReviews()
    fetchAnalytics()
  }

  const handleToggleVisibility = async (reviewId: number, isCurrentlyHidden: boolean) => {
    try {
      await reviewApi.setReviewVisibility(reviewId, !isCurrentlyHidden)
      toast.success(isCurrentlyHidden ? 'Review unhidden successfully!' : 'Review hidden successfully!')
      fetchAllReviews()
      fetchAnalytics()
    } catch (error) {
      toast.error('Failed to change review visibility. Please try again!')
    }
  }

  const handleReport = useCallback(async (reviewId: number, reason: string, description?: string) => {
    setIsSubmittingReport(true)
    setTimeout(() => {
      toast.success('Report submitted successfully!', {
        description: 'We will review your report as soon as possible.',
        duration: 4000,
      })
      setShowReport(false)
      setReportReason('')
      setReportDescription('')
      setSelectedReviewId(null)
      setIsSubmittingReport(false)
    }, 1500)
  }, [])

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
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))
  }

  const displayDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
  }

  const handleSearch = () => {
    setSearchQuery(searchTerm)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const renderFilters = () => (
    <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 min-h-[56px]' style={{ overflowAnchor: 'none' }}>
      <div className='relative flex-1 flex gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
          <Input 
            placeholder='Search reviews...' 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            onKeyPress={handleSearchKeyPress}
            className='pl-10' 
          />
        </div>
        <Button variant='outline' onClick={handleSearch} disabled={loading} className='px-4'>
          <Search className='h-4 w-4' />
        </Button>
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
            <SelectItem key={cat.id} value={cat.id.toString()} title={cat.name}>
              <span className='truncate block max-w-[140px]'>{cat.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={courseFilter} onValueChange={setCourseFilter}>
        <SelectTrigger className='w-full md:w-[200px]'>
          <SelectValue placeholder='Course' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Courses</SelectItem>
          {categoryFilter !== 'all' && !loadingCourses && courses.map(course => (
            <SelectItem key={course.id} value={course.id.toString()} title={course.title}>
              <span className='truncate block max-w-[160px]'>{course.title}</span>
            </SelectItem>
          ))}
          {categoryFilter !== 'all' && loadingCourses && (
            <SelectItem value='loading' disabled className='text-muted-foreground'>
              Loading courses...
            </SelectItem>
          )}
          {categoryFilter === 'all' && (
            <SelectItem value='disabled' disabled className='text-muted-foreground'>
              Please select a category first
            </SelectItem>
          )}
          {categoryFilter !== 'all' && !loadingCourses && courses.length === 0 && (
            <SelectItem value='empty' disabled className='text-muted-foreground'>
              No courses found in this category
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
        <SelectTrigger className='w-full md:w-[120px]'>
          <SelectValue placeholder='Rows' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='5'>5 per page</SelectItem>
          <SelectItem value='10'>10 per page</SelectItem>
          <SelectItem value='20'>20 per page</SelectItem>
          <SelectItem value='50'>50 per page</SelectItem>
          <SelectItem value='all'>All</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  const renderReviewCard = (review: ReviewResponseDTO, isHidden: boolean) => (
    <Card key={review.id} className={isHidden ? "opacity-70 border-red-200" : ""}>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-3'>
            <a href="#" className='flex-shrink-0 hover:opacity-80 transition-opacity'>
              <Avatar>
                {review.userAvatar && <AvatarImage src={review.userAvatar} alt={review.userName} />}
                <AvatarFallback>{review.userName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </a>
            <div className='flex-1'>
              <a href="#" className='hover:text-blue-600 transition-colors'>
                <h3 className='font-medium text-lg'>{review.userName}</h3>
              </a>
              <div className='flex items-center gap-2 mt-1'>
                <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full truncate max-w-[120px]' title={review.categoryName}>
                  {review.categoryName}
                </span>
                <span className='text-gray-400'>•</span>
                <span className='text-xs text-gray-600 font-medium truncate max-w-[200px]' title={review.courseName}>{review.courseName}</span>
              </div>
              {isHidden && (
                <span className='inline-flex items-center px-2 py-1 mt-2 bg-red-100 text-red-800 text-xs font-medium rounded-full'>
                  <EyeOff className='w-3 h-3 mr-1' />
                  Hidden Review
                </span>
              )}
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='flex'>{renderStars(review.star)}</div>
            <span className='text-sm text-muted-foreground'>{displayDate(review.modifiedDate)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex justify-between items-start'>
          <div className='flex-1 mr-4'>
            <p className='text-sm leading-relaxed'>{review.comment}</p>
          </div>
          <div className='flex gap-2 flex-shrink-0'>
            <Button variant='outline' size='sm' onClick={() => handleToggleVisibility(review.id, isHidden)}>
              {isHidden ? (<><Eye className='mr-1 h-3 w-3' />Unhide</>) : (<><EyeOff className='mr-1 h-3 w-3' />Hide</>) }
            </Button>
            {!isHidden && (
              <Button variant='outline' size='sm' onClick={() => handleOpenReport(review.id)}>
                <Flag className='mr-1 h-3 w-3' />
                Report
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className='space-y-6 min-h-screen'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Review Management</h1>
          <p className='text-muted-foreground'>Manage student feedback and responses</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

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
            <CardTitle className='text-sm font-medium'>Average Rating</CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{globalAverageRating}</div>
            <div className='flex mt-1'>{renderStars(Math.round(globalAverageRating))}</div>
          </CardContent>
        </Card>
      </div>

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
          {renderFilters()}
          <div className='space-y-4'>
            {displayedReviews.map(review => renderReviewCard(review, false))}
          </div>
        </TabsContent>

        <TabsContent value="hidden" className="space-y-4">
          {renderFilters()}
          <div className='space-y-4'>
            {displayedReviews.map(review => renderReviewCard(review, true))}
          </div>
        </TabsContent>
      </Tabs>

      {pagination.totalElements > 0 && rowsPerPage !== 'all' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            Showing {pagination.number * pagination.size + 1} to {Math.min((pagination.number + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements} reviews
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagination.number === 0 || loading} onClick={goToPreviousPage}>
              Previous
            </Button>
            <div className="text-sm text-gray-600 px-3">Page {pagination.number + 1} of {pagination.totalPages}</div>
            <Button variant="outline" size="sm" disabled={pagination.number >= pagination.totalPages - 1 || loading} onClick={goToNextPage}>
              Next
            </Button>
          </div>
        </div>
      )}

      {pagination.totalElements > 0 && rowsPerPage === 'all' && (
        <div className="flex justify-center mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Showing all {pagination.totalElements} reviews</div>
        </div>
      )}

      {displayedReviews.length === 0 && !loading && (
        <Card>
          <CardContent className='text-center py-8'>
            <MessageSquare className='mx-auto h-12 w-12 text-muted-foreground' />
            <h3 className='mt-2 text-sm font-semibold'>No reviews found</h3>
            <p className='mt-1 text-sm text-muted-foreground'>
              {activeTab === 'visible' ? 'No visible reviews available.' : 'No hidden reviews found.'}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showReport} onOpenChange={handleCloseReport}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
            <DialogDescription>Please let us know why you want to report this review</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <RadioGroup value={reportReason} onValueChange={setReportReason}>
              {reportReasons.map(reason => (
                <div key={reason.id} className='flex items-center space-x-2'>
                  <RadioGroupItem value={reason.id} id={reason.id} />
                  <Label htmlFor={reason.id}>{reason.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className='space-y-2'>
              <Label htmlFor='description'>Description (optional)</Label>
              <Textarea id='description' value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder='Add more details about the issue...' rows={3} />
            </div>
          </div>
          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={handleCloseReport} disabled={isSubmittingReport}>Cancel</Button>
            <Button onClick={() => selectedReviewId && handleReport(selectedReviewId, reportReason, reportDescription)} disabled={!reportReason || isSubmittingReport}>
              {isSubmittingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
