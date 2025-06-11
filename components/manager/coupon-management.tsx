'use client'

import { categoryApi } from '@/api/category-api'
import { courseApi } from '@/api/course-api'
import { discountApi } from '@/api/discount-api'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { Category, Coupon, CouponSearchParams, Course } from '@/types/discount'
import {
  BookOpen,
  Calendar,
  DollarSign,
  Edit,
  EyeIcon,
  EyeOffIcon,
  Filter,
  Globe,
  MoreHorizontal,
  Percent,
  Plus,
  Search,
  Tag,
  Trash2,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'

export function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [visibleCodes, setVisibleCodes] = useState<{[key: string]: boolean}>({})
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 0,
    size: 5, // Match backend default
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: undefined,
    applicationType: 'all',
    applicableCategories: [],
    applicableCourses: [],
    endDate: '',
    usageLimit: undefined,
    isActive: true,
  })
  const { toast } = useToast()

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories()
    fetchCourses()
    fetchCoupons()
  }, [])

  // Watch filter changes
  useEffect(() => {
    fetchCoupons(0) // Reset to first page when filters change
  }, [filterStatus, filterCategory, filterCourse])

  const fetchCoupons = async (page = 0) => {
    try {
      setLoadingCoupons(true)
      
      // Build search params
      const searchParams: CouponSearchParams = {
        page,
        size: pagination.size,
      }
      
      // Add filters
      if (filterStatus !== 'all') {
        searchParams.isActive = filterStatus === 'active' ? 1 : 0
      }
      
      if (filterCategory !== 'all') {
        searchParams.categoryId = Number(filterCategory)
      }
      
      if (filterCourse !== 'all') {
        searchParams.courseId = Number(filterCourse)
      }
      
      const response = await discountApi.getCoupons(searchParams)
      const backendData = response.data
      
      // Transform backend coupons to frontend format
      const transformedCoupons: any[] = backendData.content.map(backendCoupon => {
        const [usedCount, usageLimit] = backendCoupon.usage.split('/').map(Number)
        
        return {
          id: backendCoupon.id.toString(),
          code: backendCoupon.code,
          name: '', // Backend doesn't have name field
          description: backendCoupon.description,
          discountType: 'percentage' as const,
          discountValue: backendCoupon.percentage,
          minimumAmount: 0, // Backend doesn't have this field
          maximumDiscount: undefined,
          applicationType: backendCoupon.isGlobal === 1 ? 'all' : 'specific',
          applicableCategories: backendCoupon.categoryIds?.map(id => id.toString()) || [],
          applicableCourses: backendCoupon.courseIds?.map(id => id.toString()) || [],
          startDate: new Date().toISOString(), // Backend doesn't have start date
          endDate: backendCoupon.expiryTime ? new Date(backendCoupon.expiryTime).toISOString().split('T')[0] : '',
          usageLimit,
          usedCount,
          isActive: backendCoupon.isActive === 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Preserve backend fields for display
          totalCategory: backendCoupon.totalCategory,
          totalCourse: backendCoupon.totalCourse,
          categoryIds: backendCoupon.categoryIds,
          courseIds: backendCoupon.courseIds,
        }
      })
      
      setCoupons(transformedCoupons)
      console.log('Transformed coupons:', transformedCoupons)
      
      // Update pagination state
      setPagination({
        page: backendData.number,
        size: backendData.size,
        totalElements: backendData.totalElements,
        totalPages: backendData.totalPages,
        first: backendData.first,
        last: backendData.last,
      })
      
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
      const transformedCategories: Category[] = response.data.content.map(cat => ({
        id: cat.id.toString(),
        name: cat.name,
        courseCount: cat.courseCount || 0
      }))
      
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
      const response = await courseApi.getAllCourses({ size: 100 })
      
      // Transform API response to match our Course interface
      const transformedCourses: Course[] = response.data.content.map(course => ({
        id: course.id.toString(),
        title: course.title,
        category: course.category,
        price: course.price
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
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : coupons

  // Handle form submission
  const handleSubmit = async () => {
    console.log('handleSubmit called')
    console.log('Form data:', formData)
    
    try {
      if (selectedCoupon) {
        // Update existing coupon
        const updateData = {
          code: formData.code || '',
          description: formData.description || '',
          expiryDate: formData.endDate || '',
          percentage: Number(formData.discountValue) || 0,
          isActive: formData.isActive ? 1 : 0,
          isGlobal: formData.applicationType === 'all' ? 1 : 0,
          quantity: Number(formData.usageLimit) || 0,
          categoryIds: formData.applicableCategories?.map(id => Number(id)) || [],
          courseIds: formData.applicableCourses?.map(id => Number(id)) || [],
        }
        
        console.log('Updating coupon data:', updateData)
        
        await discountApi.updateCoupon(selectedCoupon.id, updateData)
        
        // Refresh coupon list
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
          code: formData.code || '',
          description: formData.description || '',
          expiryDate: formData.endDate || '',
          percentage: Number(formData.discountValue) || 0,
          isActive: formData.isActive ? 1 : 0,
          isGlobal: formData.applicationType === 'all' ? 1 : 0,
          quantity: Number(formData.usageLimit) || 0,
          categoryIds: formData.applicableCategories?.map(id => Number(id)) || [],
          courseIds: formData.applicableCourses?.map(id => Number(id)) || [],
        }
        
        console.log('Sending coupon data to backend:', couponData)
        
        await discountApi.createCoupon(couponData)
        
        // Refresh coupon list
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
        
        // Extract error messages for toast
        let errorMessage = 'An error occurred while processing the coupon'
        
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
          }
          else if (errorData.error) {
            errorMessage = errorData.error
          }
        }
        // Handle network errors
        else if (error.message) {
          errorMessage = error.message
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

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: undefined,
      applicationType: 'all',
      applicableCategories: [],
      applicableCourses: [],
      endDate: '',
      usageLimit: undefined,
      isActive: true,
    })
    setSelectedCoupon(null)
  }

  // Handle edit
  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      applicationType: coupon.applicationType,
      applicableCategories: coupon.applicableCategories,
      applicableCourses: coupon.applicableCourses,
      endDate: coupon.endDate,
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
    })
    setIsEditDialogOpen(true)
  }

 // Handle delete
 const handleDelete = async (couponId: string) => {
  try {
    console.log(`Deleting coupon with ID: ${couponId}`);

    await discountApi.deleteCoupon(couponId);

    // Refresh coupon list after successful deletion
    await fetchCoupons(pagination.page);

    toast({
      title: 'Success',
      description: 'Coupon deleted successfully',
      className: 'border-green-500 bg-green-50 text-green-900',
    });
  }catch (error: any) {
    console.log(error.response?.data);
  
    // Lấy message chi tiết nếu có
    const errorMessage = error.response?.data?.data 
      || error.response?.data?.message 
      || 'An unexpected error occurred';
  
      toast({
        title: 'Error',
        description: (
          <div style={{ whiteSpace: 'pre-line', fontSize: '14px' }}>
            {errorMessage}
          </div>
        ),
        variant: 'default',
        className: 'border-red-500 bg-red-50 text-red-900', 
      });
  }
};


  // Toggle coupon status
  const toggleStatus = (couponId: string) => {
    setCoupons(prev => prev.map(coupon => 
      coupon.id === couponId 
        ? { ...coupon, isActive: !coupon.isActive, updatedAt: new Date().toISOString() }
        : coupon
    ))
  }

  // Handle category selection
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = formData.applicableCategories || []
    if (checked) {
      setFormData({
        ...formData,
        applicableCategories: [...currentCategories, categoryId]
      })
    } else {
      setFormData({
        ...formData,
        applicableCategories: currentCategories.filter(id => id !== categoryId)
      })
    }
  }

  // Handle course selection
  const handleCourseChange = (courseId: string, checked: boolean) => {
    const currentCourses = formData.applicableCourses || []
    if (checked) {
      setFormData({
        ...formData,
        applicableCourses: [...currentCourses, courseId]
      })
    } else {
      setFormData({
        ...formData,
        applicableCourses: currentCourses.filter(id => id !== courseId)
      })
    }
  }

  // Get applicable items display
  const getApplicableItemsDisplay = (coupon: Coupon & { totalCategory?: number, totalCourse?: number }) => {
    if (coupon.applicationType === 'all') {
      return <Badge className="bg-blue-100 text-blue-800"><Globe className="w-3 h-3 mr-1" />All Items</Badge>
    } else {
      const totalCategories = (coupon as any).totalCategory || 0
      const totalCourses = (coupon as any).totalCourse || 0

      return (
        <div className="space-y-1">
          <Badge className="bg-purple-100 text-purple-800">
            <Tag className="w-3 h-3 mr-1" />
            Specific Items
          </Badge>
          <div className="text-xs text-gray-600">
            {totalCategories > 0 && (
              <div>• {totalCategories} categories</div>
            )}
            {totalCourses > 0 && (
              <div>• {totalCourses} courses</div>
            )}
            {totalCategories === 0 && totalCourses === 0 && (
              <div>• No items selected</div>
            )}
          </div>
        </div>
      )
    }
  }

  // Get detailed tooltip content for applicable items
  const getApplicableItemsTooltip = (coupon: Coupon & { totalCategory?: number, totalCourse?: number }) => {
    if (coupon.applicationType === 'all') {
      return (
        <div className="p-3 bg-white border border-gray-200 rounded shadow-lg">
          <div className="font-medium text-sm text-gray-900">All Items</div>
          <div className="text-xs text-gray-600 mt-1">This coupon applies to all courses on the platform</div>
        </div>
      )
    } else {
      const totalCategories = (coupon as any).totalCategory || 0
      const totalCourses = (coupon as any).totalCourse || 0

      return (
        <div className="p-3 bg-white border border-gray-200 rounded shadow-lg max-w-xs">
          <div className="font-medium text-sm text-gray-900 mb-2">Specific Items</div>
          
          {totalCategories > 0 && (
            <div className="mb-2">
              <div className="text-xs font-medium flex items-center mb-1 text-gray-700">
                <Tag className="w-3 h-3 mr-1" />
                Categories: {totalCategories} selected
              </div>
            </div>
          )}
          
          {totalCourses > 0 && (
            <div>
              <div className="text-xs font-medium flex items-center mb-1 text-gray-700">
                <BookOpen className="w-3 h-3 mr-1" />
                Courses: {totalCourses} selected
              </div>
            </div>
          )}
          
          {totalCategories === 0 && totalCourses === 0 && (
            <div className="text-xs text-gray-500">No specific items selected</div>
          )}
        </div>
      )
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  // Get coupon status
  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return 'inactive'
    const now = new Date()
    const startDate = new Date(coupon.startDate)
    const endDate = new Date(coupon.endDate)
    
    if (now < startDate) return 'upcoming'
    if (now > endDate) return 'expired'
    if (coupon.usedCount >= coupon.usageLimit) return 'exhausted'
    return 'active'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case 'exhausted':
        return <Badge className="bg-orange-100 text-orange-800">Exhausted</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  // Add toggle code visibility function
  const toggleCodeVisibility = (couponId: string) => {
    setVisibleCodes(prev => ({
      ...prev,
      [couponId]: !prev[couponId]
    }))
  }

  // Render form fields
  const renderFormFields = (isEdit = false) => (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-code" : "code"}>Coupon Code *</Label>
        <Input
          id={isEdit ? "edit-code" : "code"}
          placeholder="e.g., WELCOME10"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-description" : "description"}>Description</Label>
        <Textarea
          id={isEdit ? "edit-description" : "description"}
          placeholder="Describe your coupon..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Application Type Section */}
      <div className="space-y-4 border-t pt-4">
        <Label className="text-base font-semibold">Application Scope</Label>
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-applicationType" : "applicationType"}>Apply To</Label>
          <Select
            value={formData.applicationType}
            onValueChange={(value: 'all' | 'specific') => 
              setFormData({ 
                ...formData, 
                applicationType: value,
                applicableCategories: value === 'all' ? [] : formData.applicableCategories,
                applicableCourses: value === 'all' ? [] : formData.applicableCourses
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="specific">Specific Items</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category and Course Selection */}
        {formData.applicationType === 'specific' && (
          <div className="space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Select Categories (Optional)</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                {loadingCategories ? (
                  <div className="col-span-2 text-center text-sm text-muted-foreground py-4">
                    Loading categories...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="col-span-2 text-center text-sm text-muted-foreground py-4">
                    No categories available
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}-${isEdit ? 'edit' : 'create'}`}
                        checked={formData.applicableCategories?.includes(category.id) || false}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                      />
                      <Label htmlFor={`category-${category.id}-${isEdit ? 'edit' : 'create'}`} className="text-sm">
                        {category.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Course Selection */}
            <div className="space-y-2">
              <Label>Select Courses (Optional)</Label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                {loadingCourses ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Loading courses...
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No courses available
                  </div>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`course-${course.id}-${isEdit ? 'edit' : 'create'}`}
                        checked={formData.applicableCourses?.includes(course.id) || false}
                        onCheckedChange={(checked) => handleCourseChange(course.id, checked as boolean)}
                      />
                      <Label htmlFor={`course-${course.id}-${isEdit ? 'edit' : 'create'}`} className="text-sm">
                        {course.title}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
              <strong>Note:</strong> You can select categories, courses, or both. The coupon will apply to all selected items.
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-discountValue" : "discountValue"}>Percentage (%) *</Label>
        <Input
          id={isEdit ? "edit-discountValue" : "discountValue"}
          type="number"
          min="1"
          max="100"
          placeholder="e.g., 10"
          value={formData.discountValue || ''}
          onChange={(e) => setFormData({ ...formData, discountValue: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={isEdit ? "edit-endDate" : "endDate"}>Expiry Date *</Label>
        <Input
          id={isEdit ? "edit-endDate" : "endDate"}
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-usageLimit" : "usageLimit"}>Quantity *</Label>
          <Input
            id={isEdit ? "edit-usageLimit" : "usageLimit"}
            type="number"
            min="1"
            step="1"
            placeholder="e.g., 100"
            value={formData.usageLimit || ''}
            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div className="flex items-center space-x-2 pt-8">
          <Switch
            id={isEdit ? "edit-isActive" : "isActive"}
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor={isEdit ? "edit-isActive" : "isActive"}>Active</Label>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
          <p className="text-muted-foreground">
            Manage discount coupons and promotional codes
          </p>
        </div>
        <div className="flex gap-2">
      
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
                <DialogDescription>
                  Create a new discount coupon for your courses
                </DialogDescription>
              </DialogHeader>
              {renderFormFields()}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Create Coupon</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.totalElements}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.filter(c => c.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagination.page + 1} / {pagination.totalPages}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={(value: string) => setFilterCategory(value)}>
          <SelectTrigger className="w-[150px]">
            <Tag className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCourse} onValueChange={(value: string) => setFilterCourse(value)}>
          <SelectTrigger className="w-[180px]">
            <BookOpen className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Applicable To</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expiry Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingCoupons ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      Loading coupons...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No coupons found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono">#{coupon.id}</TableCell>
                  <TableCell className="font-mono font-semibold">
                    <div className="flex items-center space-x-2">
                      <span style={{ fontFamily: 'monospace' }}>
                        {visibleCodes[coupon.id] ? coupon.code : '•'.repeat(coupon.code.length)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleCodeVisibility(coupon.id)}
                      >
                        {visibleCodes[coupon.id] ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="text-sm">{coupon.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {getApplicableItemsDisplay(coupon)}
                        </TooltipTrigger>
                        <TooltipContent>
                          {getApplicableItemsTooltip(coupon)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}%`
                        : formatCurrency(coupon.discountValue)
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{coupon.usedCount} / {coupon.usageLimit}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((coupon.usedCount / coupon.usageLimit) * 100)}% used
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(coupon.endDate)}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(getCouponStatus(coupon))}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the coupon "{coupon.code}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(coupon.id)}>
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.page * pagination.size + 1} to{' '}
          {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
          {pagination.totalElements} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCoupons(pagination.page - 1)}
            disabled={pagination.first}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {pagination.page + 1} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCoupons(pagination.page + 1)}
            disabled={pagination.last}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update the coupon information
            </DialogDescription>
          </DialogHeader>
          {renderFormFields(true)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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