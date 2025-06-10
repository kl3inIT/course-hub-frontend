'use client'

import { useEffect, useState, useRef, memo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  Info,
  Gift,
  Search,
  SlidersHorizontal,
  X,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Category {
  id: string
  name: string
}

interface Course {
  id: string
  title: string
}

interface Coupon {
  id: string
  code: string
  discount: number
  description: string
  validUntil: string
  isActive: boolean
  isClaimed?: boolean
  scope: {
    type: 'all' | 'categories' | 'specific_course'
    categories?: Category[]
    course?: Course
  }
}

interface FilterSidebarProps {
  selectedCategories: string[]
  onCategoryToggle: (categoryId: string) => void
  onDiscountChange: (value: string) => void
  onClearFilters: () => void
  minDiscount: string
  allCategories: Array<{ id: string; name: string }>
}

interface ClaimedCoupon {
  userId: string
  couponId: string
  claimedAt: string
}

const FilterSidebar = memo(function FilterSidebar({
  selectedCategories,
  onCategoryToggle,
  onDiscountChange,
  onClearFilters,
  minDiscount,
  allCategories,
}: FilterSidebarProps) {
  const [localDiscount, setLocalDiscount] = useState(minDiscount)

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalDiscount(value)
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
      onDiscountChange(value)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Filters</h2>
        {(selectedCategories.length > 0 || minDiscount) && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onClearFilters}
            className='h-8 px-2 text-muted-foreground'
          >
            Clear all
          </Button>
        )}
      </div>

      <div className='space-y-4'>
        <div className='space-y-3'>
          <Label className='text-base'>Categories</Label>
          <div className='space-y-2'>
            {allCategories.map(category => (
              <div key={category.id} className='flex items-center space-x-2'>
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => onCategoryToggle(category.id)}
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className='space-y-3'>
          <Label className='text-base'>Minimum Discount (%)</Label>
          <Input
            type='number'
            placeholder='Enter minimum discount'
            value={localDiscount}
            onChange={handleDiscountChange}
            min='0'
            max='100'
            className='[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          />
        </div>
      </div>
    </div>
  )
})

export default function CouponsPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [minDiscount, setMinDiscount] = useState('')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isFilterVisible, setIsFilterVisible] = useState(true)
  const [activeTab, setActiveTab] = useState('available')
  const [copiedCodes, setCopiedCodes] = useState<Record<string, boolean>>({})
  const discountInputRef = useRef<HTMLInputElement>(null)
  const [claimedCoupons, setClaimedCoupons] = useState<ClaimedCoupon[]>([])

  const allCategories = [
    { id: '1', name: 'Programming' },
    { id: '2', name: 'Web Development' },
    { id: '3', name: 'IT & Software' },
    { id: '4', name: 'Business' },
    { id: '5', name: 'Design' },
  ]

  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: '1',
      code: 'WELCOME2024',
      discount: 20,
      description: 'Get 20% off on your first course purchase',
      validUntil: '2024-12-31',
      isActive: true,
      isClaimed: false,
      scope: {
        type: 'all',
      },
    },
    {
      id: '2',
      code: 'SPRING2024',
      discount: 15,
      description: 'Spring season special discount',
      validUntil: '2024-05-31',
      isActive: true,
      isClaimed: false,
      scope: {
        type: 'categories',
        categories: [
          { id: '1', name: 'Programming' },
          { id: '2', name: 'Web Development' },
        ],
      },
    },
    {
      id: '3',
      code: 'REACT101',
      discount: 25,
      description: 'Special discount for React Fundamentals course',
      validUntil: '2024-06-30',
      isActive: true,
      isClaimed: false,
      scope: {
        type: 'specific_course',
        course: { id: '1', title: 'React Fundamentals' },
      },
    },
    {
      id: '4',
      code: 'SUMMER2024',
      discount: 30,
      description: 'Summer special offer for all IT courses',
      validUntil: '2024-08-31',
      isActive: true,
      isClaimed: false,
      scope: {
        type: 'categories',
        categories: [{ id: '3', name: 'IT & Software' }],
      },
    },
  ])

  // Simulate fetching user's claimed coupons
  useEffect(() => {
    if (user) {
      // In real app, fetch from API
      const fetchClaimedCoupons = async () => {
        try {
          // Simulated API call
          // const response = await fetch('/api/user/claimed-coupons')
          // const data = await response.json()
          // setClaimedCoupons(data)
        } catch (error) {
          console.error('Failed to fetch claimed coupons:', error)
        }
      }

      fetchClaimedCoupons()
    }
  }, [user])

  // Filter coupons based on claimed status
  const myCoupons = coupons.filter(coupon =>
    claimedCoupons.some(claimed => claimed.couponId === coupon.id)
  )

  const handleClaimCoupon = async (coupon: Coupon) => {
    if (!user) {
      toast.error('Please login', {
        description: 'You need to be logged in to claim coupons',
      })
      return
    }

    try {
      // Here you would make an API call to claim the coupon
      // const response = await fetch('/api/coupons/claim', {
      //   method: 'POST',
      //   body: JSON.stringify({ couponId: coupon.id }),
      // })
      // const data = await response.json()

      // Simulate successful API response
      const newClaim: ClaimedCoupon = {
        userId: user.id,
        couponId: coupon.id,
        claimedAt: new Date().toISOString(),
      }

      // Update local state with new claimed coupon
      setClaimedCoupons(prev => [...prev, newClaim])

      toast.success('🎉 Coupon claimed successfully!', {
        description: (
          <div className='space-y-2'>
            <p>
              You've successfully claimed the coupon{' '}
              <span className='font-semibold'>{coupon.code}</span>
            </p>
            <p className='text-sm text-muted-foreground'>
              {coupon.scope.type === 'all'
                ? 'This coupon can be used for any course'
                : coupon.scope.type === 'categories'
                  ? `Valid for: ${coupon.scope.categories?.map(cat => cat.name).join(', ')}`
                  : `Valid for: ${coupon.scope.course?.title}`}
            </p>
            <p className='text-sm text-emerald-600 dark:text-emerald-500'>
              Save {coupon.discount}% on your purchase!
            </p>
          </div>
        ),
      })
    } catch (error) {
      toast.error('Failed to claim coupon', {
        description: 'Please try again.',
      })
    }
  }

  // Filter available coupons based on search and filters
  const filteredAvailableCoupons = coupons.filter(coupon => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategories.length === 0 ||
      (coupon.scope.type === 'categories' &&
        coupon.scope.categories?.some(cat =>
          selectedCategories.includes(cat.id)
        )) ||
      coupon.scope.type === 'all' ||
      (coupon.scope.type === 'specific_course' &&
        selectedCategories.length === 0)

    const matchesDiscount =
      !minDiscount || coupon.discount >= parseInt(minDiscount)

    return matchesSearch && matchesCategory && matchesDiscount
  })

  // Filter my coupons based on search and filters
  const filteredMyCoupons = myCoupons.filter(coupon => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategories.length === 0 ||
      (coupon.scope.type === 'categories' &&
        coupon.scope.categories?.some(cat =>
          selectedCategories.includes(cat.id)
        )) ||
      coupon.scope.type === 'all' ||
      (coupon.scope.type === 'specific_course' &&
        selectedCategories.length === 0)

    const matchesDiscount =
      !minDiscount || coupon.discount >= parseInt(minDiscount)

    return matchesSearch && matchesCategory && matchesDiscount
  })

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleDiscountChange = (value: string) => {
    setMinDiscount(value)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setMinDiscount('')
    if (discountInputRef.current) {
      discountInputRef.current.value = ''
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

  const renderScopeInfo = (coupon: Coupon) => {
    switch (coupon.scope.type) {
      case 'all':
        return 'Applicable to all courses'
      case 'categories':
        return `Valid for categories: ${coupon.scope.categories?.map(cat => cat.name).join(', ')}`
      case 'specific_course':
        return `Only for course: ${coupon.scope.course?.title}`
      default:
        return 'Unknown scope'
    }
  }

  const getScopeBadgeColor = (
    scopeType: 'all' | 'categories' | 'specific_course'
  ) => {
    switch (scopeType) {
      case 'all':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'categories':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'specific_course':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
    }
  }

  const CouponGrid = ({
    coupons,
    showCopyButton = false,
  }: {
    coupons: typeof filteredAvailableCoupons
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
                <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                  {coupon.isActive ? 'Active' : 'Expired'}
                </Badge>
              </div>
              <CardDescription className='text-sm'>
                Valid until {new Date(coupon.validUntil).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <p className='text-xl font-bold text-primary'>
                    {coupon.discount}% OFF
                  </p>
                  <p className='text-sm text-muted-foreground line-clamp-2'>
                    {coupon.description}
                  </p>
                </div>

                <div className='flex items-center justify-between'>
                  <Badge
                    variant='outline'
                    className={`${getScopeBadgeColor(coupon.scope.type)} capitalize text-xs`}
                  >
                    {coupon.scope.type.replace('_', ' ')}
                  </Badge>

                  {!showCopyButton ? (
                    <Button
                      size='sm'
                      onClick={() => handleClaimCoupon(coupon)}
                      disabled={!coupon.isActive || isClaimed}
                      variant={isClaimed ? 'outline' : 'default'}
                      className='ml-2'
                    >
                      <Gift className='h-4 w-4 mr-1' />
                      {isClaimed ? 'Claimed' : 'Get'}
                    </Button>
                  ) : (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => handleCopyCode(coupon.code)}
                      className='ml-2'
                    >
                      {copiedCodes[coupon.code] ? (
                        <>
                          <Check className='h-4 w-4 mr-1' />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className='h-4 w-4 mr-1' />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
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
            <TabsTrigger
              value='available'
              className="relative data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:before:content-[''] data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:left-0 data-[state=active]:before:w-full data-[state=active]:before:h-[2px] data-[state=active]:before:bg-primary"
            >
              <span className='flex items-center gap-2'>
                Available
                {filteredAvailableCoupons.length > 0 && (
                  <Badge variant='secondary' className='bg-muted-foreground/10'>
                    {filteredAvailableCoupons.length}
                  </Badge>
                )}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value='my-coupons'
              className="relative data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:before:content-[''] data-[state=active]:before:absolute data-[state=active]:before:bottom-0 data-[state=active]:before:left-0 data-[state=active]:before:w-full data-[state=active]:before:h-[2px] data-[state=active]:before:bg-primary"
            >
              <span className='flex items-center gap-2'>
                My Coupons
                {filteredMyCoupons.length > 0 && (
                  <Badge variant='secondary' className='bg-muted-foreground/10'>
                    {filteredMyCoupons.length}
                  </Badge>
                )}
              </span>
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
              <FilterSidebar
                selectedCategories={selectedCategories}
                onCategoryToggle={handleCategoryToggle}
                onDiscountChange={handleDiscountChange}
                onClearFilters={clearFilters}
                minDiscount={minDiscount}
                allCategories={allCategories}
              />
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
                  <FilterSidebar
                    selectedCategories={selectedCategories}
                    onCategoryToggle={handleCategoryToggle}
                    onDiscountChange={handleDiscountChange}
                    onClearFilters={clearFilters}
                    minDiscount={minDiscount}
                    allCategories={allCategories}
                  />
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
              <CouponGrid coupons={filteredAvailableCoupons} />
              {filteredAvailableCoupons.length === 0 && (
                <div className='text-center py-10'>
                  <p className='text-muted-foreground'>
                    No available coupons found matching your filters.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value='my-coupons'
              className='mt-0 focus-visible:outline-none'
            >
              <CouponGrid coupons={filteredMyCoupons} showCopyButton={true} />
              {filteredMyCoupons.length === 0 && (
                <div className='text-center py-10'>
                  <p className='text-muted-foreground'>
                    {searchTerm || selectedCategories.length > 0 || minDiscount
                      ? 'No claimed coupons found matching your filters.'
                      : "You haven't claimed any coupons yet."}
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
