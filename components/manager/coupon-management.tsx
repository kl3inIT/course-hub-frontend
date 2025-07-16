'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { categoryApi } from '@/services/category-api'
import { courseApi } from '@/services/course-api'
import { discountApi } from '@/services/discount-api'
import {
  Category,
  Coupon,
  CouponSearchParams,
  CouponStatsResponse,
  CouponStatusResponse,
  Course,
} from '@/types/discount'
import {
  BookOpen,
  Calendar,
  Edit,
  Filter,
  MoreHorizontal,
  Percent,
  Plus,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

export function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [_visibleCodes, setVisibleCodes] = useState<{ [key: string]: boolean }>(
    {}
  )

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 0,
    size: 5, // Match backend default
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  })

  // Thêm state pageSize
  const [pageSize, setPageSize] = useState(5)

  const [searchTerm, setSearchTerm] = useState('')
  const [couponStatuses, setCouponStatuses] = useState<CouponStatusResponse | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('AVAILABLE')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState<Partial<Coupon>>({
    description: '',
    percentage: undefined,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isActive: 1,
    quantity: undefined,
    usage: 0,
    categoryIds: [],
    courseIds: [],
    code: '',
  })
  const { toast } = useToast()

  // Add state for showing all selected courses
  const [showAllSelectedCourses, setShowAllSelectedCourses] = useState(false)

  // Add a new state for application scope
  const [applicationScope, setApplicationScope] = useState<
    'none' | 'all' | 'specific'
  >('none')

  // Add new state for search percentage
  const [searchPercentage, setSearchPercentage] = useState<string>('')
  const [percentageError, setPercentageError] = useState<string>('')

  // Add new state for stats
  const [stats, setStats] = useState<CouponStatsResponse | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories()
    fetchCourses()
    fetchCoupons()
  }, [])

  // Update formData.applicationType based on applicationScope
  useEffect(() => {
    if (applicationScope === 'all') {
      // Select all categories and courses
      setFormData(prev => ({
        ...prev,
        categoryIds: categories.map(cat => Number(cat.id)),
        courseIds: courses.map(course => Number(course.id)),
      }))
    } else if (applicationScope === 'specific') {
      setFormData(prev => ({
        ...prev,
        categoryIds: [],
        courseIds: [],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        categoryIds: [],
        courseIds: [],
      }))
    }
  }, [applicationScope, categories, courses])

  // Add useEffect to fetch coupon statuses
  useEffect(() => {
    const fetchCouponStatuses = async () => {
      try {
        const response = await discountApi.getCouponStatuses()
        setCouponStatuses(response.data)
      } catch (error) {
        console.error('Error fetching coupon statuses:', error)
        toast({
          title: 'Error',
          description: 'Failed to load coupon statuses',
          className: 'border-red-500 bg-red-50 text-red-900',
        })
      }
    }

    fetchCouponStatuses()
  }, [])

  // Add useEffect to fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await discountApi.getCouponStats()
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching coupon stats:', error)
        toast({
          title: 'Error',
          description: 'Failed to load coupon statistics',
          className: 'border-red-500 bg-red-50 text-red-900',
        })
      }
    }

    fetchStats()
  }, [])

  // Add validation function for percentage
  const validatePercentage = (value: string) => {
    // Remove any non-digit characters
    const numericValue = value.replace(/[^0-9]/g, '')

    if (numericValue === '') {
      setSearchPercentage('')
      setPercentageError('')
      return
    }

    const num = parseInt(numericValue)
    if (num > 100) {
      setPercentageError('Percentage cannot exceed 100%')
      setSearchPercentage('100')
    } else {
      setPercentageError('')
      setSearchPercentage(numericValue)
    }
  }

  const fetchCoupons = async (page = 0, size = pageSize) => {
    try {
      setLoadingCoupons(true)

      // Build search params
      const searchParams: CouponSearchParams = {
        page,
        size,
      }

      // Add filters
      if (filterStatus !== 'all') {
        searchParams.status = filterStatus
      }

      if (filterCategory !== 'all') {
        searchParams.categoryId = Number(filterCategory)
      }

      if (filterCourse !== 'all') {
        searchParams.courseId = Number(filterCourse)
      }

      if (searchPercentage && !percentageError) {
        searchParams.percentage = Number(searchPercentage)
      }

      const response = await discountApi.getCoupons(searchParams)
      const backendData = response.data

      // Transform backend coupons to frontend format
      const transformedCoupons: Coupon[] = backendData.content.map(
        backendCoupon => {
          return {
            id: backendCoupon.id.toString(),
            description: backendCoupon.description,
            percentage: backendCoupon.percentage,
            startDate: backendCoupon.startDate,
            endDate: backendCoupon.endDate,
            isActive: backendCoupon.isActive,
            usage: backendCoupon.usage,
            quantity: backendCoupon.quantity,
            availableQuantity: backendCoupon.availableQuantity,
            categoryIds: backendCoupon.categoryIds,
            courseIds: backendCoupon.courseIds,
            totalCategory: backendCoupon.categoryIds?.length || 0,
            totalCourse: backendCoupon.courseIds?.length || 0,
            code: backendCoupon.code,
            status: backendCoupon.status,
          }
        }
      )

      setCoupons(transformedCoupons)
      console.log('Transformed coupons:', transformedCoupons)

      // Update pagination state
      setPagination({
        page: backendData.page.number,
        size: backendData.page.size,
        totalElements: backendData.page.totalElements,
        totalPages: backendData.page.totalPages,
        first: backendData.page.number === 0,
        last: backendData.page.number === backendData.page.totalPages - 1,
      })
      setPageSize(backendData.page.size)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast({
        title: 'Error',
        description: 'Failed to load coupons',
        className: 'border-red-500 bg-red-50 text-red-900',
      })
    } finally {
      setLoadingCoupons(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await categoryApi.getAllCategories({ size: 100 })

      // Transform API response to match our Category interface
      const transformedCategories: Category[] = response.data.content.map(
        cat => ({
          id: cat.id.toString(),
          name: cat.name,
          courseCount: cat.courseCount || 0,
        })
      )

      setCategories(transformedCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        className: 'border-red-500 bg-red-50 text-red-900',
      })
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await courseApi.getAllCoursesByStatus({
        size: 100,
        status: 'PUBLISHED',
      })

      // Transform API response to match our Course interface
      const transformedCourses: Course[] = response.map(course => ({
        id: course.id.toString(),
        title: course.title,
        category: course.category || '',
        price: 0, // ManagerCourseResponseDTO doesn't have price field
      }))

      setCourses(transformedCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        className: 'border-red-500 bg-red-50 text-red-900',
      })
    } finally {
      setLoadingCourses(false)
    }
  }

  // Apply client-side search filtering (since backend may not support text search)
  const filteredCoupons = searchTerm
    ? coupons.filter(coupon =>
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : coupons

  // Helper function to convert local datetime-local string to UTC ISO string
  const convertLocalToUTCISO = (localDateTimeString: string) => {
    if (!localDateTimeString) return ''
    const [datePart, timePart] = localDateTimeString.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes] = timePart.split(':').map(Number)
    // Create a Date object in local time
    const localDate = new Date(year, month - 1, day, hours, minutes)
    // Convert to ISO 8601 UTC string
    return localDate.toISOString()
  }

  // Handle form submission
  const handleSubmit = async () => {
    console.log('handleSubmit called')
    console.log('Form data:', formData)
    try {
      if (selectedCoupon) {
        // Update existing coupon
        const updateData = {
          description: formData.description || '',
          startDate: convertLocalToUTCISO(formData.startDate || ''),
          endDate: convertLocalToUTCISO(formData.endDate || ''),
          percentage: Number(formData.percentage) || 0,
          isActive: formData.isActive ?? 1,
          quantity: Number(formData.quantity) || 0,
          categoryIds: formData.categoryIds?.map(id => Number(id)) || [],
          courseIds: formData.courseIds?.map(id => Number(id)) || [],
          code: formData.code || '',
        }
        await discountApi.updateCoupon(selectedCoupon.id, updateData)
        await fetchCoupons()
        toast({
          title: 'Success',
          description: 'Coupon updated successfully',
          className: 'border-green-500 bg-green-50 text-green-900',
        })
        setIsEditDialogOpen(false)
      } else {
        // Create new coupon via API
        const couponData = {
          description: formData.description || '',
          startDate: convertLocalToUTCISO(formData.startDate || ''),
          endDate: convertLocalToUTCISO(formData.endDate || ''),
          percentage: Number(formData.percentage) || 0,
          isActive: formData.isActive ?? 1,
          quantity: Number(formData.quantity) || 0,
          categoryIds: formData.categoryIds?.map(id => Number(id)) || [],
          courseIds: formData.courseIds?.map(id => Number(id)) || [],
          code: formData.code || '',
        }
        await discountApi.createCoupon(couponData)
        await fetchCoupons()
        toast({
          title: 'Success',
          description: 'Coupon created successfully',
          className: 'border-green-500 bg-green-50 text-green-900',
        })
        setIsCreateDialogOpen(false)
      }
      resetForm()
    } catch (error: any) {
      console.log(error.response?.data)

      let errorMessage = 'An error occurred while processing the coupon'

      if (selectedCoupon) {
        // Handle update errors
        if (
          error.response?.data?.data &&
          typeof error.response.data.data === 'string'
        ) {
          errorMessage = error.response.data.data
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
      } else {
        // Handle create errors (existing logic)
        if (error.response?.data) {
          const errorData = error.response.data

          // Handle validation errors in 'data' array
          if (errorData.data && Array.isArray(errorData.data)) {
            errorMessage = errorData.data.join('\n• ')
            errorMessage = `Validation errors:\n• ${errorMessage}`
          }
          // Handle other error formats
          else if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          }
        }
        // Handle network errors
        else if (error.message) {
          errorMessage = error.message
        }
      }

      // Show toast
      toast({
        title: 'Error',
        description: (
          <div style={{ whiteSpace: 'pre-line', fontSize: '14px' }}>
            {errorMessage}
          </div>
        ),
        variant: 'default',
        className: 'border-blue-500 bg-blue-50 text-blue-900',
      })
    }
  }

  // Format date to local datetime string
  const formatToLocalDateTime = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Get current local datetime
  const getCurrentLocalDateTime = () => {
    return formatToLocalDateTime(new Date())
  }

  // Reset form
  const resetForm = () => {
    const now = new Date()
    const endDate = new Date(now)
    endDate.setHours(now.getHours() + 1)
    setFormData({
      description: '',
      percentage: undefined,
      startDate: formatToLocalDateTime(now),
      endDate: formatToLocalDateTime(endDate),
      isActive: 1,
      quantity: undefined,
      usage: 0,
      categoryIds: [],
      courseIds: [],
      code: '',
    })
    setSelectedCoupon(null)
  }

  // Handle edit
  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    const now = new Date()
    const endDate = new Date(coupon.endDate)
    const isActive = coupon.isActive === 1 && now <= endDate ? 1 : 0

    setFormData({
      description: coupon.description,
      percentage: coupon.percentage,
      startDate: formatToLocalDateTime(new Date(coupon.startDate)),
      endDate: formatToLocalDateTime(new Date(coupon.endDate)),
      isActive: isActive,
      quantity: coupon.quantity,
      usage: coupon.usage,
      categoryIds: coupon.categoryIds,
      courseIds: coupon.courseIds,
      code: coupon.code,
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (couponId: string) => {
    try {
      console.log(`Deleting coupon with ID: ${couponId}`)

      await discountApi.deleteCoupon(couponId)

      // Refresh coupon list after successful deletion
      await fetchCoupons(pagination.page)

      toast({
        title: 'Success',
        description: 'Coupon deleted successfully',
        className: 'border-green-500 bg-green-50 text-green-900',
      })
    } catch (error: any) {
      console.log(error.response?.data)

      // Lấy message chi tiết nếu có
      const errorMessage =
        error.response?.data?.data ||
        error.response?.data?.message ||
        'An unexpected error occurred'

      toast({
        title: 'Error',
        description: (
          <div style={{ whiteSpace: 'pre-line', fontSize: '14px' }}>
            {errorMessage}
          </div>
        ),
        variant: 'default',
        className: 'border-red-500 bg-red-50 text-red-900',
      })
    }
  }

  // Toggle coupon status
  const _toggleStatus = (couponId: string) => {
    setCoupons(prev =>
      prev.map(coupon =>
        coupon.id === couponId
          ? {
              ...coupon,
              isActive: coupon.isActive === 1 ? 0 : 1,
              updatedAt: new Date().toISOString(),
            }
          : coupon
      )
    )
  }

  // Handle category selection
  const handleCategoryChange = async (categoryId: string, checked: boolean) => {
    const currentCategories = formData.categoryIds || []
    let updatedCategories = [...currentCategories]
    let updatedCourses = [...(formData.courseIds || [])]

    if (checked) {
      // Add category
      updatedCategories.push(Number(categoryId))

      // Fetch courses for this category
      try {
        const response = await courseApi.getCoursesByCategory(categoryId)
        const categoryCourses = response.data.map(
          (course: { id: number }) => course.id
        )

        // Add all courses from this category
        updatedCourses = [...new Set([...updatedCourses, ...categoryCourses])]
      } catch (error) {
        console.error('Error fetching courses for category:', error)
        toast({
          title: 'Error',
          description: 'Failed to load courses for selected category',
          className: 'border-red-500 bg-red-50 text-red-900',
        })
      }
    } else {
      // Remove category
      updatedCategories = updatedCategories.filter(
        id => id !== Number(categoryId)
      )

      // Remove all courses from this category
      try {
        const response = await courseApi.getCoursesByCategory(categoryId)
        const categoryCourses = response.data.map(
          (course: { id: number }) => course.id
        )
        updatedCourses = updatedCourses.filter(
          id => !categoryCourses.includes(id)
        )
      } catch (error) {
        console.error('Error fetching courses for category:', error)
      }
    }

    setFormData({
      ...formData,
      categoryIds: updatedCategories,
      courseIds: updatedCourses,
    })
  }

  // Handle course selection
  const handleCourseChange = (courseId: string, checked: boolean) => {
    const currentCourses = formData.courseIds || []
    if (checked) {
      setFormData({
        ...formData,
        courseIds: [...currentCourses, Number(courseId)],
      })
    } else {
      setFormData({
        ...formData,
        courseIds: currentCourses.filter(id => id !== Number(courseId)),
      })
    }
  }

  // Get selected courses display
  const _getSelectedCoursesDisplay = () => {
    const selectedCourses = courses.filter(course =>
      formData.courseIds?.includes(Number(course.id))
    )

    if (selectedCourses.length === 0) {
      return (
        <div className='text-sm text-muted-foreground'>No courses selected</div>
      )
    }

    const displayCourses = showAllSelectedCourses
      ? selectedCourses
      : selectedCourses.slice(0, 3)

    return (
      <div className='space-y-2'>
        {displayCourses.map(course => (
          <div
            key={course.id}
            className='flex items-center justify-between text-sm'
          >
            <span>{course.title}</span>
            <Button
              variant='ghost'
              size='sm'
              className='h-6 w-6 p-0'
              onClick={() => handleCourseChange(course.id, false)}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        ))}
        {selectedCourses.length > 3 && (
          <Button
            variant='link'
            className='h-8 px-0'
            onClick={() => setShowAllSelectedCourses(!showAllSelectedCourses)}
          >
            {showAllSelectedCourses
              ? 'Show Less'
              : `Show All (${selectedCourses.length})`}
          </Button>
        )}
      </div>
    )
  }

  // Get applicable items display
  const _getApplicableItemsDisplay = (coupon: Coupon) => {
    const totalCategories = coupon.categoryIds?.length || 0
    const totalCourses = coupon.courseIds?.length || 0
    if (totalCategories === 0 && totalCourses === 0) {
      return <Badge className='bg-blue-100 text-blue-800'>All Items</Badge>
    }
    return (
      <div className='space-y-1'>
        <Badge className='bg-purple-100 text-purple-800'>Specific Items</Badge>
        <div className='text-xs text-gray-600'>
          {totalCategories > 0 && <div>• {totalCategories} categories</div>}
          {totalCourses > 0 && <div>• {totalCourses} courses</div>}
          {totalCategories === 0 && totalCourses === 0 && (
            <div>• No items selected</div>
          )}
        </div>
      </div>
    )
  }

  // Get detailed tooltip content for applicable items
  const _getApplicableItemsTooltip = (coupon: Coupon) => {
    const totalCategories = coupon.categoryIds?.length || 0
    const totalCourses = coupon.courseIds?.length || 0
    if (totalCategories === 0 && totalCourses === 0) {
      return (
        <div className='p-3 bg-white border border-gray-200 rounded shadow-lg'>
          <div className='font-medium text-sm text-gray-900'>All Items</div>
          <div className='text-xs text-gray-600 mt-1'>
            This coupon applies to all courses on the platform
          </div>
        </div>
      )
    } else {
      return (
        <div className='p-3 bg-white border border-gray-200 rounded shadow-lg max-w-xs'>
          <div className='font-medium text-sm text-gray-900 mb-2'>
            Specific Items
          </div>
          {totalCategories > 0 && (
            <div className='mb-2'>
              <div className='text-xs font-medium flex items-center mb-1 text-gray-700'>
                Categories: {totalCategories} selected
              </div>
            </div>
          )}
          {totalCourses > 0 && (
            <div>
              <div className='text-xs font-medium flex items-center mb-1 text-gray-700'>
                Courses: {totalCourses} selected
              </div>
            </div>
          )}
          {totalCategories === 0 && totalCourses === 0 && (
            <div className='text-xs text-gray-500'>
              No specific items selected
            </div>
          )}
        </div>
      )
    }
  }

  // Format currency
  const _formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string, isActive: number) => {
    const statusBadge = (() => {
      switch (status) {
        case 'Available':
          return (
            <Badge className='bg-green-100 text-green-800'>Available</Badge>
          )
        case 'Not Started':
          return (
            <Badge className='bg-blue-100 text-blue-800'>Not Started</Badge>
          )
        case 'Out of Stock':
          return (
            <Badge className='bg-yellow-100 text-yellow-800'>
              Out of Stock
            </Badge>
          )
        case 'Used Up':
          return (
            <Badge className='bg-purple-100 text-purple-800'>Used Up</Badge>
          )
        case 'Expired':
          return <Badge className='bg-red-100 text-red-800'>Expired</Badge>
        default:
          return <Badge variant='secondary'>Unknown</Badge>
      }
    })()

    return (
      <div className='flex items-center gap-2'>
        {statusBadge}
        {isActive === 1 ? (
          <div className='flex items-center' title='Active'>
            <div className='w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-200'></div>
          </div>
        ) : (
          <div className='flex items-center' title='Inactive'>
            <div className='w-3 h-3 rounded-full bg-rose-400 shadow-sm shadow-rose-200'></div>
          </div>
        )}
      </div>
    )
  }

  // Add toggle code visibility function
  const _toggleCodeVisibility = (couponId: string) => {
    setVisibleCodes(prev => ({
      ...prev,
      [couponId]: !prev[couponId],
    }))
  }

  // Render form fields
  const renderFormFields = (isEdit = false) => (
    <div className='grid gap-4 py-4'>
      <div className='space-y-2'>
        <Label htmlFor={isEdit ? 'edit-percentage' : 'percentage'}>
          Percentage (%) *
        </Label>
        <Input
          id={isEdit ? 'edit-percentage' : 'percentage'}
          type='number'
          min='1'
          max='100'
          placeholder='e.g., 10'
          value={formData.percentage || ''}
          onChange={e =>
            setFormData({
              ...formData,
              percentage: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor={isEdit ? 'edit-description' : 'description'}>
          Description
        </Label>
        <Textarea
          id={isEdit ? 'edit-description' : 'description'}
          placeholder='Describe your coupon...'
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      {/* Application Type Section */}
      <div className='space-y-4 border-t pt-4'>
        <Label className='text-base font-semibold'>Application Scope</Label>
        <div className='space-y-2'>
          <Label htmlFor={isEdit ? 'edit-applicationType' : 'applicationType'}>
            Apply To
          </Label>
          <Select
            value={applicationScope}
            onValueChange={(value: 'none' | 'all' | 'specific') =>
              setApplicationScope(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='Select scope' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none'>Select scope</SelectItem>
              <SelectItem value='all'>All Items</SelectItem>
              <SelectItem value='specific'>Specific Items</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Show category/course selection if scope is not 'none' */}
        {(applicationScope === 'all' || applicationScope === 'specific') && (
          <div className='space-y-4'>
            {/* Category Selection */}
            <div className='space-y-2'>
              <Label>Select Categories</Label>
              <div className='grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2'>
                {loadingCategories ? (
                  <div className='col-span-2 text-center text-sm text-muted-foreground py-4'>
                    Loading categories...
                  </div>
                ) : categories.length === 0 ? (
                  <div className='col-span-2 text-center text-sm text-muted-foreground py-4'>
                    No categories available
                  </div>
                ) : (
                  categories.map(category => (
                    <div
                      key={category.id}
                      className='flex items-center space-x-2'
                    >
                      <Checkbox
                        id={`category-${category.id}-${isEdit ? 'edit' : 'create'}`}
                        checked={
                          formData.categoryIds?.includes(Number(category.id)) ||
                          false
                        }
                        onCheckedChange={checked =>
                          handleCategoryChange(category.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`category-${category.id}-${isEdit ? 'edit' : 'create'}`}
                        className='text-sm'
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Course Selection */}
            <div className='space-y-2'>
              <Label>Select Individual Courses</Label>
              <div className='grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-2'>
                {loadingCourses ? (
                  <div className='text-center text-sm text-muted-foreground py-4'>
                    Loading courses...
                  </div>
                ) : courses.length === 0 ? (
                  <div className='text-center text-sm text-muted-foreground py-4'>
                    No courses available
                  </div>
                ) : (
                  courses.map(course => (
                    <div
                      key={course.id}
                      className='flex items-center space-x-2'
                    >
                      <Checkbox
                        id={`course-${course.id}-${isEdit ? 'edit' : 'create'}`}
                        checked={
                          formData.courseIds?.includes(Number(course.id)) ||
                          false
                        }
                        onCheckedChange={checked =>
                          handleCourseChange(course.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`course-${course.id}-${isEdit ? 'edit' : 'create'}`}
                        className='text-sm'
                      >
                        {course.title}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className='text-sm text-muted-foreground bg-blue-50 p-3 rounded'>
              <strong>Note:</strong> You can select or unselect any category or
              course. Choosing "All Items" will select all by default.
            </div>
          </div>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor={isEdit ? 'edit-startDate' : 'startDate'}>
          Start Date *
        </Label>
        <Input
          id={isEdit ? 'edit-startDate' : 'startDate'}
          type='datetime-local'
          min={getCurrentLocalDateTime()}
          value={formData.startDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newStartDate = e.target.value
            const startDateTime = new Date(newStartDate)
            const endDateTime = new Date(formData.endDate || '')

            // If end time is before or equal to start time, set it to 1 hour after start time
            if (!formData.endDate || endDateTime <= startDateTime) {
              const newEndDateTime = new Date(startDateTime)
              newEndDateTime.setHours(startDateTime.getHours() + 1)
              setFormData(prev => ({
                ...prev,
                startDate: newStartDate,
                endDate: formatToLocalDateTime(newEndDateTime),
              }))
            } else {
              setFormData(prev => ({
                ...prev,
                startDate: newStartDate,
              }))
            }
          }}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor={isEdit ? 'edit-endDate' : 'endDate'}>End Date *</Label>
        <Input
          id={isEdit ? 'edit-endDate' : 'endDate'}
          type='datetime-local'
          min={formData.startDate || getCurrentLocalDateTime()}
          value={formData.endDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newEndDate = e.target.value
            const startDateTime = new Date(formData.startDate || '')
            const endDateTime = new Date(newEndDate)

            // Ensure end time is after start time
            if (endDateTime > startDateTime) {
              setFormData(prev => ({
                ...prev,
                endDate: newEndDate,
              }))
            } else {
              // If end time is before or equal to start time, show error
              toast({
                title: 'Invalid End Time',
                description: 'End time must be after start time',
                variant: 'destructive',
              })
            }
          }}
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor={isEdit ? 'edit-quantity' : 'quantity'}>
            Quantity *
          </Label>
          <Input
            id={isEdit ? 'edit-quantity' : 'quantity'}
            type='number'
            min='1'
            step='1'
            placeholder='e.g., 100'
            value={formData.quantity || ''}
            onChange={e =>
              setFormData({
                ...formData,
                quantity: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div className='flex items-center space-x-2 pt-8'>
          <Switch
            id={isEdit ? 'edit-isActive' : 'isActive'}
            checked={!!formData.isActive}
            onCheckedChange={checked =>
              setFormData({ ...formData, isActive: checked ? 1 : 0 })
            }
          />
          <Label htmlFor={isEdit ? 'edit-isActive' : 'isActive'}>Active</Label>
        </div>
      </div>
    </div>
  )

  // Update the filters section
  const renderFilters = () => (
    <div className='w-full flex gap-4'>
      {/* Percentage filter */}
      <div className='flex-1 relative max-w-sm'>
        <Percent className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
        <div className='space-y-1'>
          <Input
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            placeholder='Filter by percentage...'
            value={searchPercentage}
            onChange={e => validatePercentage(e.target.value)}
            className={`pl-8 w-full ${percentageError ? 'border-red-500' : ''}`}
          />
          {percentageError && (
            <p className='text-sm text-red-500'>{percentageError}</p>
          )}
        </div>
      </div>
      {/* Status filter */}
      <div className='flex-1'>
        <Select
          value={filterStatus}
          onValueChange={(value: string) => setFilterStatus(value)}
        >
          <SelectTrigger className='w-full'>
            <Filter className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            {couponStatuses &&
              Object.entries(couponStatuses).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {/* Category filter */}
      <div className='flex-1'>
        <Select
          value={filterCategory}
          onValueChange={(value: string) => setFilterCategory(value)}
        >
          <SelectTrigger className='w-full'>
            <Tag className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Course filter */}
      <div className='flex-1'>
        <Select
          value={filterCourse}
          onValueChange={(value: string) => setFilterCourse(value)}
        >
          <SelectTrigger className='w-full'>
            <BookOpen className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Course' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Courses</SelectItem>
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Page size filter */}
      <div className='flex-1'>
        <Select
          value={pageSize.toString()}
          onValueChange={value => setPageSize(Number(value))}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Rows per page' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='5'>5 per page</SelectItem>
            <SelectItem value='10'>10 per page</SelectItem>
            <SelectItem value='20'>20 per page</SelectItem>
            <SelectItem value='50'>50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Apply Filters button */}
      <div className='flex-1 flex items-end'>
        <Button
          onClick={() => fetchCoupons(0, pageSize)}
          className='w-full bg-blue-600 hover:bg-blue-700'
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Coupon Management
          </h1>
          <p className='text-muted-foreground'>
            Manage discount coupons and promotional codes
          </p>
        </div>
        <div className='flex gap-2'>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className='mr-2 h-4 w-4' />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
                <DialogDescription>
                  Create a new discount coupon for your courses
                </DialogDescription>
              </DialogHeader>
              {renderFormFields()}
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Create Coupon</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Coupons</CardTitle>
            <Percent className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.totalDiscounts || '0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Coupons
            </CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.activeDiscounts || '0'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Usage</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.totalUsage || '0'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Coupons Table */}
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Applicable To</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingCoupons ? (
                <TableRow>
                  <TableCell colSpan={9} className='text-center py-8'>
                    <div className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2'></div>
                      Loading coupons...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className='text-center py-8 text-muted-foreground'
                  >
                    No coupons found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoupons.map(coupon => (
                  <TableRow key={coupon.id}>
                    <TableCell className='font-mono'>#{coupon.id}</TableCell>
                    <TableCell>
                      <div className='font-bold text-lg text-blue-700'>
                        {coupon.percentage}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='max-w-xs'>
                        <div className='text-sm'>{coupon.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className='relative'>
                      <div className='group relative'>
                        <div>
                          {coupon.totalCategory > 0 && (
                            <div>{coupon.totalCategory} categories</div>
                          )}
                          {coupon.totalCourse > 0 && (
                            <div>{coupon.totalCourse} courses</div>
                          )}
                          {coupon.totalCategory === 0 &&
                            coupon.totalCourse === 0 && <div>All Items</div>}
                        </div>
                        <div className='absolute left-0 top-full mt-2 w-64 p-3 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[999]'>
                          <div className='text-sm font-medium mb-2'>
                            Applicable Items:
                          </div>
                          {coupon.totalCategory > 0 && (
                            <div className='mb-2'>
                              <div className='text-xs font-medium text-gray-700 mb-1'>
                                Categories:
                              </div>
                              <div className='text-xs text-gray-600'>
                                {categories
                                  .filter(cat =>
                                    coupon.categoryIds.includes(Number(cat.id))
                                  )
                                  .map(cat => cat.name)
                                  .join(', ')}
                              </div>
                            </div>
                          )}
                          {coupon.totalCourse > 0 && (
                            <div>
                              <div className='text-xs font-medium text-gray-700 mb-1'>
                                Courses:
                              </div>
                              <div className='text-xs text-gray-600'>
                                {courses
                                  .filter(course =>
                                    coupon.courseIds.includes(Number(course.id))
                                  )
                                  .map(course => course.title)
                                  .join(', ')}
                              </div>
                            </div>
                          )}
                          {coupon.totalCategory === 0 &&
                            coupon.totalCourse === 0 && (
                              <div className='text-xs text-gray-600'>
                                Applies to all items
                              </div>
                            )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm font-medium'>
                        {coupon.usage} / {coupon.quantity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        {formatDate(coupon.startDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        {formatDate(coupon.endDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(coupon.status, coupon.isActive)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                            <Edit className='mr-2 h-4 w-4' />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={e => e.preventDefault()}
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the coupon "{coupon.code}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(coupon.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination - Chỉ hiển thị khi có dữ liệu */}
      {pagination.totalElements > 0 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            Showing {pagination.page * pagination.size + 1} to{' '}
            {Math.min(
              (pagination.page + 1) * pagination.size,
              pagination.totalElements
            )}{' '}
            of {pagination.totalElements} results
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => fetchCoupons(pagination.page - 1, pageSize)}
              disabled={
                pagination.first ||
                loadingCoupons ||
                pagination.totalElements === 0
              }
            >
              Previous
            </Button>
            <span className='text-sm'>
              Page {pagination.page + 1} of {pagination.totalPages || 1}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => fetchCoupons(pagination.page + 1, pageSize)}
              disabled={
                pagination.last ||
                loadingCoupons ||
                pagination.totalElements === 0
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update the coupon information</DialogDescription>
          </DialogHeader>
          {renderFormFields(true)}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Update Coupon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  )
}
