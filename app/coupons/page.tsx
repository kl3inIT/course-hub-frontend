'use client'

import { categoryApi } from '@/api/category-api'
import { courseApi } from '@/api/course-api'
import { userApi } from '@/api/user-api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/context/auth-context'
import { useCoupon } from '@/hooks/use-coupon'
import { cn } from '@/lib/utils'
import { Category, ClaimedCoupon, Coupon, CouponSearchParams, Course, PaginationState } from '@/types/discount'
import { transformCoupon } from '@/utils/transform'
import {
  BookOpen,
  Calendar,
  Check,
  ChevronsUpDown,
  Gift,
  Globe,
  Search,
  SlidersHorizontal,
  Tag
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const Select = ({
  options,
  selected,
  onChange,
  placeholder,
  emptyText,
}: {
  options: { id: string; name: string }[] | { id: string; title: string }[]
  selected: string | null
  onChange: (value: string | null) => void
  placeholder: string
  emptyText: string
}) => {
  const [open, setOpen] = useState(false)

  const getLabel = (id: string | null) => {
    if (!id) return null
    const option = options.find(opt => opt.id === id)
    return option ? 'title' in option ? option.title : option.name : null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected ? (
            <span className="truncate">{getLabel(selected)}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            <CommandItem onSelect={() => {
              onChange(null)
              setOpen(false)
            }}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                  !selected ? "bg-primary text-primary-foreground" : "opacity-50"
                )}>
                  {!selected && <Check className="h-3 w-3" />}
                </div>
                <span>All</span>
              </div>
            </CommandItem>
            {options.map((option) => {
              const value = option.id
              const label = 'title' in option ? option.title : option.name
              const isSelected = selected === value
              
              return (
                <CommandItem
                  key={value}
                  onSelect={() => {
                    onChange(isSelected ? null : value)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span>{label}</span>
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const FilterSidebar = memo(function FilterSidebar({
  selectedCategories,
  selectedCourses,
  percentage,
  allCategories,
  allCourses,
  onClearFilters,
  onApplyFilter,
}: {
  selectedCategories: string | null,
  selectedCourses: string | null,
  percentage: string,
  allCategories: { id: string; name: string }[],
  allCourses: { id: string; title: string }[],
  onClearFilters: () => void,
  onApplyFilter: (filter: { category: string | null, course: string | null, percentage: string }) => void,
}) {
  const [localPercentage, setLocalPercentage] = useState(percentage)
  const [localCategory, setLocalCategory] = useState<string | null>(selectedCategories)
  const [localCourse, setLocalCourse] = useState<string | null>(selectedCourses)

  // Sync local state with props when they change
  useEffect(() => {
    setLocalCategory(selectedCategories)
    setLocalCourse(selectedCourses)
    setLocalPercentage(percentage)
  }, [selectedCategories, selectedCourses, percentage])

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalPercentage(value)
  }

  const handleApplyFilter = () => onApplyFilter({ category: localCategory, course: localCourse, percentage: localPercentage })

  const handleClearFilters = () => {
    setLocalCategory(null)
    setLocalCourse(null)
    setLocalPercentage('')
    onClearFilters()
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Filters</h2>
        {(localCategory || localCourse || localPercentage) && (
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClearFilters}
            className='h-8 px-2 text-muted-foreground'
          >
            Clear all
          </Button>
        )}
      </div>

      <div className='space-y-4'>
        <div className='space-y-3'>
          <Label className='text-base'>Category</Label>
          <Select
            options={allCategories}
            selected={localCategory}
            onChange={setLocalCategory}
            placeholder="Select category"
            emptyText="No categories found."
          />
              </div>

        <div className='space-y-3'>
          <Label className='text-base'>Course</Label>
          <Select
            options={allCourses}
            selected={localCourse}
            onChange={setLocalCourse}
            placeholder="Select course"
            emptyText="No courses found."
          />
        </div>

        <div className='space-y-3'>
          <Label className='text-base'>Percentage</Label>
          <Input
            type='number'
            placeholder='Enter percentage'
            value={localPercentage}
            onChange={handlePercentageChange}
            min='0'
            max='100'
            className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          />
        </div>

        <Button 
          className="w-full" 
          onClick={handleApplyFilter}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )
})

export default function CouponsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState({
    category: null as string | null,
    course: null as string | null,
    percentage: '',
  })
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isFilterVisible, setIsFilterVisible] = useState(true)
  const [activeTab, setActiveTab] = useState('available')
  const [copiedCodes, setCopiedCodes] = useState<Record<string, boolean>>({})
  const discountInputRef = useRef<HTMLInputElement>(null)
  const [claimedCoupons, setClaimedCoupons] = useState<ClaimedCoupon[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [allCourses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [myCoupons, setMyCoupons] = useState<Coupon[]>([])
  const [loadingMyCoupons, setLoadingMyCoupons] = useState(false)
  const [myCouponsPagination, setMyCouponsPagination] = useState<PaginationState>({
    page: 0,
    size: 8,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  })
  const router = useRouter()

  // Use the custom hook
  const { coupons, loadingCoupons, pagination, fetchCoupons } = useCoupon()

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [categoriesResponse, coursesResponse] = await Promise.all([
          categoryApi.getAllCategories({ size: 100 }),
          courseApi.getAllCourses({ size: 100 })
        ])

        const transformedCategories: Category[] = categoriesResponse.data.content.map((cat: { id: number; name: string }) => ({
          id: cat.id.toString(),
          name: cat.name
        }))
        
        const transformedCourses: Course[] = coursesResponse.data.content.map((course: { id: number; title: string }) => ({
          id: course.id.toString(),
          title: course.title
        }))

        setAllCategories(transformedCategories)
        setCourses(transformedCourses)
        setIsLoading(false)
        // Initial coupon fetch
        await fetchCoupons(0)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load data', {
          description: 'Please try refreshing the page.'
        })
        setIsLoading(false)
      }
    }
    fetchData()
  }, [fetchCoupons])

  // Call API when filter state changes
  useEffect(() => {
    const params: CouponSearchParams = {
      page: 0,
      size: pagination.size,
      isActive: 1,
    }
    if (filter.category) params.categoryId = Number(filter.category)
    if (filter.course) params.courseId = Number(filter.course)
    if (filter.percentage) params.percentage = parseInt(filter.percentage)
    fetchCoupons(0, params)
  }, [filter, pagination.size, fetchCoupons])

  // FilterSidebar callbacks
  const handleApplyFilter = useCallback((newFilter: { category: string | null, course: string | null, percentage: string }) => {
    setFilter(newFilter)
    setIsMobileFilterOpen(false)
  }, [])

  const clearFilters = useCallback(() => {
    setFilter({ category: null, course: null, percentage: '' })
    if (discountInputRef.current) {
      discountInputRef.current.value = ''
    }
    fetchCoupons(0)
  }, [fetchCoupons])

  // Get category and course names
  const getCategoryNames = useCallback((categoryIds: number[]) => {
    if (!categoryIds) return ''
    return allCategories
      .filter(cat => categoryIds.includes(Number(cat.id)))
      .map(cat => cat.name)
      .join(', ')
  }, [allCategories])

  const getCourseNames = useCallback((courseIds: number[]) => {
    if (!courseIds) return ''
    return allCourses
      .filter(course => courseIds.includes(Number(course.id)))
      .map(course => course.title)
      .join(', ')
  }, [allCourses])

  // Filter coupons based on search term
  const filteredCoupons = useMemo(() => 
    searchTerm
      ? coupons.filter(coupon =>
          coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : coupons
  , [coupons, searchTerm])

  // Filter for available coupons based on new criteria
  const availableCoupons = useMemo(() => {
    const now = new Date();
    return filteredCoupons.filter(coupon => {
      const endDate = new Date(coupon.endDate);
      return coupon.isActive === 1 && endDate > now && coupon.availableQuantity > 0;
    });
  }, [filteredCoupons]);

  // Fetch my coupons when tab changes to 'my-coupons' or page/filter changes
  const fetchMyCoupons = useCallback(async (page = 0) => {
    if (!user) return
    setLoadingMyCoupons(true)
    const params: CouponSearchParams = {
      page,
      size: myCouponsPagination.size,
      isActive: 1,
      ...(filter.category ? { categoryId: Number(filter.category) } : {}),
      ...(filter.course ? { courseId: Number(filter.course) } : {}),
      ...(filter.percentage ? { percentage: parseInt(filter.percentage) } : {}),
    }
    try {
      const res = await userApi.getMyCoupons(params)
      setMyCoupons(res.data.content.map(transformCoupon))
      setMyCouponsPagination({
        page: res.data.number,
        size: res.data.size,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        first: res.data.first,
        last: res.data.last,
      })
    } catch {
      setMyCoupons([])
    } finally {
      setLoadingMyCoupons(false)
    }
  }, [user, filter, myCouponsPagination.size])

  useEffect(() => {
    if (activeTab === 'my-coupons' && user) {
      fetchMyCoupons(0)
    }
  }, [activeTab, user, filter, fetchMyCoupons])

  // Get applicable items display
  const getApplicableItemsDisplay = (coupon: Coupon) => {
    const totalCategories = coupon.totalCategory || 0
    const totalCourses = coupon.totalCourse || 0

    if (totalCategories === 0 && totalCourses === 0) {
      return <Badge className="bg-blue-100 text-blue-800"><Globe className="w-3 h-3 mr-1" />All Items</Badge>
    } else {
      return (
        <div className="space-y-1">
          <Badge className="bg-purple-100 text-purple-800">
            <Tag className="w-3 h-3 mr-1" />
            Specific Items
          </Badge>
          
        </div>
      )
    }
  }

  // Get detailed tooltip content for applicable items
  const getApplicableItemsTooltip = (coupon: Coupon) => {
    const totalCategories = coupon.totalCategory || 0
    const totalCourses = coupon.totalCourse || 0

    if (totalCategories === 0 && totalCourses === 0) {
      return (
        <div className="p-3 bg-white border border-gray-200 rounded shadow-lg">
          <div className="font-medium text-sm text-gray-900">All Items</div>
          <div className="text-xs text-gray-600 mt-1">This coupon applies to all courses on the platform</div>
        </div>
      )
    } else {
      const categoryNames = coupon.categoryIds?.length
        ? allCategories
            .filter(cat => coupon.categoryIds?.includes(Number(cat.id)))
            .map(cat => cat.name)
        : []

      const courseNames = coupon.courseIds?.length
        ? allCourses
            .filter(course => coupon.courseIds?.includes(Number(course.id)))
            .map(course => course.title)
        : []

      return (
        <div className="p-3 bg-white border border-gray-200 rounded shadow-lg max-w-xs">
          <div className="font-medium text-sm text-gray-900 mb-2">Specific Items</div>

          {categoryNames.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium flex items-center mb-1 text-gray-700">
                <Tag className="w-3 h-3 mr-1" />
                Categories ({categoryNames.length})
              </div>
              <div className="text-xs text-gray-600 pl-4">
                {categoryNames.map((name, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {courseNames.length > 0 && (
            <div>
              <div className="text-xs font-medium flex items-center mb-1 text-gray-700">
                <BookOpen className="w-3 h-3 mr-1" />
                Courses ({courseNames.length})
              </div>
              <div className="text-xs text-gray-600 pl-4">
                {courseNames.map((name, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5" />
                    {name}
                  </div>
                ))}
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
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Handle claim coupon
  const handleClaimCoupon = async (coupon: Coupon) => {
    if (!user) {
      toast.error('Please login', {
        description: 'You need to be logged in to claim coupons',
      })
      return
    }

    try {
      // Gọi API claim coupon
      const res = await userApi.claimCoupon(coupon.id)
      toast.success(res.message || 'Claim coupon successfully!')
      // Có thể reload lại coupon nếu muốn
      fetchCoupons(0)
      if (activeTab === 'my-coupons') fetchMyCoupons(myCouponsPagination.page)
    } catch (err: any) {
      // Ưu tiên lấy err.response.data.data, nếu không có thì lấy message, cuối cùng fallback chuỗi mặc định
      const msg =
        err?.response?.data?.data ||
        err?.response?.data?.message ||
        'Failed to claim coupon'
      toast.error(msg)
    }
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCodes(prev => ({ ...prev, [code]: true }))

      toast.success('Code copied!', {
        description: 'The coupon code has been copied to your clipboard.',
      })

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedCodes(prev => ({ ...prev, [code]: false }))
      }, 2000)
    } catch (error) {
      toast.error('Failed to copy', {
        description: 'Please try copying the code manually.',
      })
    }
  }

  const CouponGrid = ({
    coupons,
    showCopyButton = false,
  }: {
    coupons: Coupon[]
    showCopyButton?: boolean
  }) => (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
      {coupons.map(coupon => {
        const isClaimed = claimedCoupons.some(
          claimed => claimed.couponId === coupon.id
        )

        return (
          <Card key={coupon.id} className='relative'>
            <CardHeader className='space-y-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg font-bold'>
                  {coupon.code}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className='space-y-3'>
                <div>
                  <p className='text-xl font-bold text-primary'>
                    {coupon.percentage}% OFF
                  </p>
                  <p className='text-sm text-muted-foreground line-clamp-2'>
                    {coupon.description}
                  </p>
                </div>
                <CardDescription className='text-sm flex items-center gap-1'>
                  <Calendar className="h-3 w-3 text-muted-foreground" /> Valid from {formatDate(coupon.startDate)} to {formatDate(coupon.endDate)}
                </CardDescription>
              </div>

              <div className='flex items-center justify-between mt-4'>
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

                {!showCopyButton ? (
                  <Button
                    size='sm'
                    onClick={() => handleClaimCoupon(coupon)}
                    disabled={!(coupon.isActive === 1 && new Date(coupon.endDate) > new Date() && coupon.availableQuantity > 0) || isClaimed}
                    variant={isClaimed ? 'outline' : 'default'}
                    className='ml-2'
                  >
                    <Gift className='h-4 w-4 mr-1' />
                    {isClaimed ? 'Claimed' : 'Get'}
                  </Button>
                ) : (
                  <Button
                    size='sm'
                    variant='default'
                    onClick={() => router.push('/courses')}
                    className='ml-2'
                  >
                    <BookOpen className='h-4 w-4 mr-1' />
                    Use Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div className='container mx-auto py-8'>
      <Tabs
        defaultValue='available'
        className='space-y-8'
        onValueChange={setActiveTab}
      >
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <TabsList className='bg-muted/50 p-1 rounded-lg'>
            <TabsTrigger value='available'>
              Available
            </TabsTrigger>
            <TabsTrigger value='my-coupons'>
              My Coupons
            </TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className='relative w-full sm:w-[300px]'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search coupons...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-9 w-full'
            />
          </div>
        </div>

        <div className='flex gap-8'>
          {/* Desktop Sidebar */}
          <div
            className={cn(
              'w-[240px] hidden lg:block shrink-0 transition-all duration-300',
              !isFilterVisible && 'w-0'
            )}
          >
            <div className='sticky top-24 bg-card rounded-lg border p-4'>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-8 bg-muted animate-pulse rounded" />
                  <div className="h-32 bg-muted animate-pulse rounded" />
                  <div className="h-32 bg-muted animate-pulse rounded" />
                  <div className="h-20 bg-muted animate-pulse rounded" />
                </div>
              ) : (
              <FilterSidebar
                  selectedCategories={filter.category}
                  selectedCourses={filter.course}
                  percentage={filter.percentage}
                  allCategories={allCategories}
                  allCourses={allCourses}
                onClearFilters={clearFilters}
                  onApplyFilter={handleApplyFilter}
              />
              )}
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className='lg:hidden'>
            <Sheet
              open={isMobileFilterOpen}
              onOpenChange={setIsMobileFilterOpen}
            >
              <SheetTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg'
                >
                  <SlidersHorizontal className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='left'>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className='py-4'>
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="h-8 bg-muted animate-pulse rounded" />
                      <div className="h-32 bg-muted animate-pulse rounded" />
                      <div className="h-32 bg-muted animate-pulse rounded" />
                      <div className="h-20 bg-muted animate-pulse rounded" />
                    </div>
                  ) : (
                  <FilterSidebar
                      selectedCategories={filter.category}
                      selectedCourses={filter.course}
                      percentage={filter.percentage}
                      allCategories={allCategories}
                      allCourses={allCourses}
                    onClearFilters={clearFilters}
                      onApplyFilter={handleApplyFilter}
                  />
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            <TabsContent
              value='available'
              className='mt-0 focus-visible:outline-none'
            >
              {loadingCoupons ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4 p-6 border rounded-lg">
                      <div className="h-6 bg-muted animate-pulse rounded" />
                      <div className="h-20 bg-muted animate-pulse rounded" />
                      <div className="h-8 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <CouponGrid coupons={availableCoupons} />
                  {availableCoupons.length === 0 && (
                <div className='text-center py-10'>
                  <p className='text-muted-foreground'>
                    No available coupons found matching your filters.
                  </p>
                </div>
                  )}
                  {/* Pagination for Available */}
                  {activeTab === 'available' && (
                    <div className="flex items-center justify-between mt-4">
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
                          disabled={pagination.first || loadingCoupons}
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
                          disabled={pagination.last || loadingCoupons}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent
              value='my-coupons'
              className='mt-0 focus-visible:outline-none'
            >
              {loadingMyCoupons ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4 p-6 border rounded-lg">
                      <div className="h-6 bg-muted animate-pulse rounded" />
                      <div className="h-20 bg-muted animate-pulse rounded" />
                      <div className="h-8 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <CouponGrid coupons={myCoupons} showCopyButton={true} />
                  {myCoupons.length === 0 && (
                <div className='text-center py-10'>
                  <p className='text-muted-foreground'>
                        {searchTerm || filter.category || filter.percentage
                      ? 'No claimed coupons found matching your filters.'
                      : "You haven't claimed any coupons yet."}
                  </p>
                </div>
                  )}
                  {/* Pagination for My Coupons */}
                  {activeTab === 'my-coupons' && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {myCouponsPagination.page * myCouponsPagination.size + 1} to{' '}
                        {Math.min((myCouponsPagination.page + 1) * myCouponsPagination.size, myCouponsPagination.totalElements)} of{' '}
                        {myCouponsPagination.totalElements} results
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchMyCoupons(myCouponsPagination.page - 1)}
                          disabled={myCouponsPagination.first || loadingMyCoupons}
                        >
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {myCouponsPagination.page + 1} of {myCouponsPagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchMyCoupons(myCouponsPagination.page + 1)}
                          disabled={myCouponsPagination.last || loadingMyCoupons}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
