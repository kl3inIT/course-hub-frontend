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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
import {
    BookOpen,
    Calendar,
    DollarSign,
    Edit,
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
import { useState } from 'react'

// Types
interface Category {
  id: string
  name: string
  courseCount: number
}

interface Course {
  id: string
  title: string
  category: string
  price: number
}

interface Coupon {
  id: string
  code: string
  name: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minimumAmount: number
  maximumDiscount?: number
  applicationType: 'all' | 'specific'
  applicableCategories: string[]
  applicableCourses: string[]
  startDate: string
  endDate: string
  usageLimit: number
  usedCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Mock data for categories
const mockCategories: Category[] = [
  { id: '1', name: 'Programming', courseCount: 45 },
  { id: '2', name: 'Design', courseCount: 32 },
  { id: '3', name: 'Business', courseCount: 28 },
  { id: '4', name: 'Marketing', courseCount: 22 },
  { id: '5', name: 'Photography', courseCount: 18 },
  { id: '6', name: 'Music', courseCount: 15 },
]

// Mock data for courses
const mockCourses: Course[] = [
  { id: '1', title: 'React Complete Course', category: 'Programming', price: 99 },
  { id: '2', title: 'UI/UX Design Fundamentals', category: 'Design', price: 79 },
  { id: '3', title: 'Digital Marketing Strategy', category: 'Marketing', price: 89 },
  { id: '4', title: 'JavaScript Mastery', category: 'Programming', price: 109 },
  { id: '5', title: 'Photoshop for Beginners', category: 'Design', price: 69 },
  { id: '6', title: 'Business Analytics', category: 'Business', price: 119 },
  { id: '7', title: 'Portrait Photography', category: 'Photography', price: 95 },
  { id: '8', title: 'Music Production', category: 'Music', price: 85 },
]

// Mock data for coupons
const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME10',
    name: 'Welcome Discount',
    description: 'Welcome discount for new students',
    discountType: 'percentage',
    discountValue: 10,
    minimumAmount: 50,
    maximumDiscount: 20,
    applicationType: 'all',
    applicableCategories: [],
    applicableCourses: [],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    usageLimit: 1000,
    usedCount: 150,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    code: 'PROGRAMMING20',
    name: 'Programming Course Sale',
    description: 'Special discount for programming courses',
    discountType: 'percentage',
    discountValue: 20,
    minimumAmount: 100,
    maximumDiscount: 50,
    applicationType: 'specific',
    applicableCategories: ['1'], // Programming
    applicableCourses: [],
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    usageLimit: 500,
    usedCount: 75,
    isActive: true,
    createdAt: '2024-02-28T00:00:00Z',
    updatedAt: '2024-03-10T14:20:00Z',
  },
  {
    id: '3',
    code: 'REACT15',
    name: 'React Course Discount',
    description: 'Special discount for React course',
    discountType: 'fixed',
    discountValue: 15,
    minimumAmount: 75,
    applicationType: 'specific',
    applicableCategories: [],
    applicableCourses: ['1'], // React Complete Course
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    usageLimit: 200,
    usedCount: 45,
    isActive: false,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-15T09:15:00Z',
  },
  {
    id: '4',
    code: 'DESIGN25',
    name: 'Design Bundle Sale',
    description: 'Discount for design courses and specific programming courses',
    discountType: 'percentage',
    discountValue: 25,
    minimumAmount: 150,
    maximumDiscount: 75,
    applicationType: 'specific',
    applicableCategories: ['2', '5'], // Design, Photography
    applicableCourses: ['1', '4'], // React + JavaScript courses
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    usageLimit: 300,
    usedCount: 12,
    isActive: true,
    createdAt: '2024-05-25T00:00:00Z',
    updatedAt: '2024-06-01T08:00:00Z',
  },
]

export function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons)
  const [categories] = useState<Category[]>(mockCategories)
  const [courses] = useState<Course[]>(mockCourses)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minimumAmount: 0,
    maximumDiscount: 0,
    applicationType: 'all',
    applicableCategories: [],
    applicableCourses: [],
    startDate: '',
    endDate: '',
    usageLimit: 1,
    isActive: true,
  })
  const { toast } = useToast()

  // Filter coupons based on search and status
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = 
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && coupon.isActive) ||
      (filterStatus === 'inactive' && !coupon.isActive)

    return matchesSearch && matchesStatus
  })

  // Handle form submission
  const handleSubmit = () => {
    if (!formData.code || !formData.name || !formData.startDate || !formData.endDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast({
        title: 'Error',
        description: 'End date must be after start date',
        variant: 'destructive',
      })
      return
    }

    // Validate application type selections
    if (formData.applicationType === 'specific' && 
        (!formData.applicableCategories || formData.applicableCategories.length === 0) &&
        (!formData.applicableCourses || formData.applicableCourses.length === 0)) {
      toast({
        title: 'Error',
        description: 'Please select at least one category or course for specific application',
        variant: 'destructive',
      })
      return
    }

    if (selectedCoupon) {
      // Update existing coupon
      setCoupons(prev => prev.map(coupon => 
        coupon.id === selectedCoupon.id 
          ? { ...coupon, ...formData, updatedAt: new Date().toISOString() }
          : coupon
      ))
      toast({
        title: 'Success',
        description: 'Coupon updated successfully',
      })
      setIsEditDialogOpen(false)
    } else {
      // Create new coupon
      const newCoupon: Coupon = {
        ...formData as Coupon,
        id: Date.now().toString(),
        usedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setCoupons(prev => [newCoupon, ...prev])
      toast({
        title: 'Success',
        description: 'Coupon created successfully',
      })
      setIsCreateDialogOpen(false)
    }

    resetForm()
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minimumAmount: 0,
      maximumDiscount: 0,
      applicationType: 'all',
      applicableCategories: [],
      applicableCourses: [],
      startDate: '',
      endDate: '',
      usageLimit: 1,
      isActive: true,
    })
    setSelectedCoupon(null)
  }

  // Handle edit
  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumAmount: coupon.minimumAmount,
      maximumDiscount: coupon.maximumDiscount,
      applicationType: coupon.applicationType,
      applicableCategories: coupon.applicableCategories,
      applicableCourses: coupon.applicableCourses,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete
  const handleDelete = (couponId: string) => {
    setCoupons(prev => prev.filter(coupon => coupon.id !== couponId))
    toast({
      title: 'Success',
      description: 'Coupon deleted successfully',
    })
  }

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
  const getApplicableItemsDisplay = (coupon: Coupon) => {
    if (coupon.applicationType === 'all') {
      return <Badge className="bg-blue-100 text-blue-800"><Globe className="w-3 h-3 mr-1" />All Items</Badge>
    } else {
      const categoryNames = coupon.applicableCategories.map(id => 
        categories.find(c => c.id === id)?.name
      ).filter(Boolean)
      
      const courseNames = coupon.applicableCourses.map(id => 
        courses.find(c => c.id === id)?.title
      ).filter(Boolean)

      const displayItems = []
      if (categoryNames.length > 0) {
        displayItems.push(`${categoryNames.length} categories`)
      }
      if (courseNames.length > 0) {
        displayItems.push(`${courseNames.length} courses`)
      }

      return (
        <Badge className="bg-purple-100 text-purple-800">
          <Tag className="w-3 h-3 mr-1" />
          {displayItems.join(' + ')}
        </Badge>
      )
    }
  }

  // Get detailed tooltip content for applicable items
  const getApplicableItemsTooltip = (coupon: Coupon) => {
    if (coupon.applicationType === 'all') {
      return (
        <div className="space-y-1">
          <div className="font-medium">All Items</div>
          <div className="text-sm">This coupon applies to all courses on the platform</div>
        </div>
      )
    } else {
      const categoryNames = coupon.applicableCategories.map(id => 
        categories.find(c => c.id === id)?.name
      ).filter(Boolean)
      
      const courseNames = coupon.applicableCourses.map(id => 
        courses.find(c => c.id === id)?.title
      ).filter(Boolean)

      return (
        <div className="space-y-2 max-w-sm">
          <div className="font-medium">Specific Items</div>
          
          {categoryNames.length > 0 && (
            <div>
              <div className="text-sm font-medium flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                Categories ({categoryNames.length}):
              </div>
              <ul className="text-xs mt-1 space-y-1">
                {categoryNames.map((name, index) => (
                  <li key={index} className="ml-4">• {name}</li>
                ))}
              </ul>
            </div>
          )}
          
          {courseNames.length > 0 && (
            <div>
              <div className="text-sm font-medium flex items-center">
                <BookOpen className="w-3 h-3 mr-1" />
                Courses ({courseNames.length}):
              </div>
              <ul className="text-xs mt-1 space-y-1">
                {courseNames.map((name, index) => (
                  <li key={index} className="ml-4">• {name}</li>
                ))}
              </ul>
            </div>
          )}
          
          {categoryNames.length === 0 && courseNames.length === 0 && (
            <div className="text-sm text-muted-foreground">No specific items selected</div>
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

  // Render form fields
  const renderFormFields = (isEdit = false) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor={isEdit ? "edit-name" : "name"}>Coupon Name *</Label>
          <Input
            id={isEdit ? "edit-name" : "name"}
            placeholder="e.g., Welcome Discount"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
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
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}-${isEdit ? 'edit' : 'create'}`}
                      checked={formData.applicableCategories?.includes(category.id) || false}
                      onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                    />
                    <Label htmlFor={`category-${category.id}-${isEdit ? 'edit' : 'create'}`} className="text-sm">
                      {category.name} ({category.courseCount} courses)
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Selection */}
            <div className="space-y-2">
              <Label>Select Courses (Optional)</Label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`course-${course.id}-${isEdit ? 'edit' : 'create'}`}
                      checked={formData.applicableCourses?.includes(course.id) || false}
                      onCheckedChange={(checked) => handleCourseChange(course.id, checked as boolean)}
                    />
                    <Label htmlFor={`course-${course.id}-${isEdit ? 'edit' : 'create'}`} className="text-sm">
                      {course.title} ({course.category}) - {formatCurrency(course.price)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
              <strong>Note:</strong> You can select categories, courses, or both. The coupon will apply to all selected items.
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-discountType" : "discountType"}>Discount Type</Label>
          <Select
            value={formData.discountType}
            onValueChange={(value: 'percentage' | 'fixed') => 
              setFormData({ ...formData, discountType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount (VND)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-discountValue" : "discountValue"}>
            Discount Value {formData.discountType === 'percentage' ? '(%)' : '(VND)'}
          </Label>
          <Input
            id={isEdit ? "edit-discountValue" : "discountValue"}
            type="number"
            min="0"
            max={formData.discountType === 'percentage' ? "100" : undefined}
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-minimumAmount" : "minimumAmount"}>Minimum Amount (VND)</Label>
          <Input
            id={isEdit ? "edit-minimumAmount" : "minimumAmount"}
            type="number"
            min="0"
            value={formData.minimumAmount}
            onChange={(e) => setFormData({ ...formData, minimumAmount: Number(e.target.value) })}
          />
        </div>
        {formData.discountType === 'percentage' && (
          <div className="space-y-2">
            <Label htmlFor={isEdit ? "edit-maximumDiscount" : "maximumDiscount"}>Maximum Discount (VND)</Label>
            <Input
              id={isEdit ? "edit-maximumDiscount" : "maximumDiscount"}
              type="number"
              min="0"
              value={formData.maximumDiscount || ''}
              onChange={(e) => setFormData({ ...formData, maximumDiscount: Number(e.target.value) })}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-startDate" : "startDate"}>Start Date *</Label>
          <Input
            id={isEdit ? "edit-startDate" : "startDate"}
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-endDate" : "endDate"}>End Date *</Label>
          <Input
            id={isEdit ? "edit-endDate" : "endDate"}
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-usageLimit" : "usageLimit"}>Usage Limit</Label>
          <Input
            id={isEdit ? "edit-usageLimit" : "usageLimit"}
            type="number"
            min="1"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.filter(c => getCouponStatus(c) === 'active').length}
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
            <CardTitle className="text-sm font-medium">Avg. Usage Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.length > 0 
                ? Math.round((coupons.reduce((sum, c) => sum + (c.usedCount / c.usageLimit), 0) / coupons.length) * 100)
                : 0}%
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
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Applicable To</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono">{coupon.code}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{coupon.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {coupon.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discountValue}%`
                          : formatCurrency(coupon.discountValue)
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Min: {formatCurrency(coupon.minimumAmount)}
                        {coupon.maximumDiscount && ` • Max: ${formatCurrency(coupon.maximumDiscount)}`}
                      </div>
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
                    <div className="space-y-1">
                      <div>{coupon.usedCount} / {coupon.usageLimit}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((coupon.usedCount / coupon.usageLimit) * 100)}% used
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{formatDate(coupon.startDate)}</div>
                      <div className="text-sm text-muted-foreground">
                        to {formatDate(coupon.endDate)}
                      </div>
                    </div>
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
                        <DropdownMenuItem onClick={() => toggleStatus(coupon.id)}>
                          <Switch className="mr-2 h-4 w-4" />
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
    </div>
  )
} 