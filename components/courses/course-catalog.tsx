'use client'

import { useEffect, useState, useRef, memo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
  SlidersHorizontal,
} from 'lucide-react'
import { courseApi } from '@/api/course-api'
import { categoryApi } from '@/api/category-api'
import { CourseCard } from './course-card'
import { useSearchParams } from 'next/navigation'
import { CourseResponseDTO } from '@/types/course'
import { CategoryResponseDTO } from '@/types/category'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
]

interface FilterSidebarProps {
  selectedCategories: string[]
  selectedLevels: string[]
  priceFilter: string
  priceRange: [number, number]
  categories: CategoryResponseDTO[]
  onCategoryToggle: (categoryId: string) => void
  onLevelToggle: (level: string) => void
  onPriceFilterChange: (value: string) => void
  onPriceRangeChange: (value: [number, number]) => void
  onClearFilters: () => void
}

const FilterSidebar = memo(function FilterSidebar({
  selectedCategories,
  selectedLevels,
  priceFilter,
  priceRange,
  categories,
  onCategoryToggle,
  onLevelToggle,
  onPriceFilterChange,
  onPriceRangeChange,
  onClearFilters,
}: FilterSidebarProps) {
  const hasActiveFilters = selectedCategories.length > 0 || selectedLevels.length > 0 || priceFilter !== 'all' || priceRange[0] > 0 || priceRange[1] < 200

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Filters</h2>
      </div>

      {/* Categories */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label className='text-base'>Categories</Label>
        </div>
        <div className='no-scrollbar space-y-2 max-h-48 overflow-y-auto pr-2'>
          {categories.map(category => (
            <div key={category.id} className='flex items-center space-x-2'>
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(String(category.id))}
                onCheckedChange={() => onCategoryToggle(String(category.id))}
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

      {/* Levels */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label className='text-base'>Skill Level</Label>
        </div>
        <div className='space-y-2'>
          {levels.map(level => (
            <div key={level} className='flex items-center space-x-2'>
              <Checkbox
                id={`level-${level}`}
                checked={selectedLevels.includes(level)}
                onCheckedChange={() => onLevelToggle(level)}
              />
              <label
                htmlFor={`level-${level}`}
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                {level}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className='space-y-3'>
        <Label className='text-base'>Price</Label>
        <Select value={priceFilter} onValueChange={onPriceFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Courses</SelectItem>
            <SelectItem value='free'>Free</SelectItem>
            <SelectItem value='paid'>Paid</SelectItem>
          </SelectContent>
        </Select>

        {/* Price Range Slider */}
        {priceFilter !== 'free' && (
          <div className='space-y-3'>
            <div className='flex items-center justify-between text-sm'>
              <span>Price Range</span>
              {(priceRange[0] > 0 || priceRange[1] < 200) && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onPriceRangeChange([0, 200])}
                  className='h-auto p-0 text-xs text-muted-foreground hover:text-foreground'
                >
                  Reset
                </Button>
              )}
            </div>
            <div className='px-2'>
              <Slider
                value={priceRange}
                onValueChange={value => onPriceRangeChange(value as [number, number])}
                max={200}
                min={0}
                step={10}
                className='w-full'
              />
              <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export function CourseCatalog() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [sortBy, setSortBy] = useState('relevance')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isFilterVisible, setIsFilterVisible] = useState(true)

  const [courses, setCourses] = useState<CourseResponseDTO[]>([])
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(6)
  const [loadingPage, setLoadingPage] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Load categories once
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResponse = await categoryApi.getAllCategories({
          page: 0,
          size: 100,
        })

        if (categoriesResponse.data?.content) {
          setCategories(categoriesResponse.data.content)
        }
      } catch (err) {
        console.error('Error loading categories:', err)
      }
    }

    loadCategories()
  }, [])

  // Handle URL parameters
  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    const categoryFromUrl = searchParams.get('category')

    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    }

    if (categoryFromUrl && categories.length > 0) {
      const categoryToSelect = categories.find(
        c => c.name.toLowerCase() === categoryFromUrl.toLowerCase()
      )
      if (categoryToSelect) {
        setSelectedCategories([String(categoryToSelect.id)])
      }
    }
  }, [searchParams, categories])

  // Load courses based on filters and pagination with optimized state updates
  useEffect(() => {
    let isMounted = true

    const loadCourses = async () => {
      try {
        if (currentPage > 0) {
          setLoadingPage(true)
        } else {
          setLoading(true)
        }
        setError(null)

        let coursesResponse

        if (sortBy === 'price-low') {
          coursesResponse = await courseApi.getCoursesSortedByPriceDesc()
        } else if (sortBy === 'price-high') {
          coursesResponse = await courseApi.getCoursesSortedByPriceAsc()
        } else {
          const params: any = {
            page: currentPage,
            size: pageSize,
          }

          if (debouncedSearchTerm) params.search = debouncedSearchTerm
          if (selectedCategories.length > 0) {
            params.category = selectedCategories.join(',')
          }
          if (selectedLevels.length > 0) {
            params.level = selectedLevels.join(',')
          }

          if (priceFilter === 'free') {
            params.maxPrice = 0
          } else if (priceFilter === 'paid') {
            params.minPrice = 0.01
          }

          if (priceFilter !== 'free' && priceRange) {
            if (priceRange[0] > 0) params.minPrice = priceRange[0]
            if (priceRange[1] < 200) params.maxPrice = priceRange[1]
          }

          switch (sortBy) {
            case 'newest':
              params.sort = 'id,desc'
              break
            case 'popularity':
              params.sort = 'totalStudents,desc'
              break
            case 'rating':
              params.sort = 'averageRating,desc'
              break
            case 'relevance':
            default:
              params.sort = 'id,desc'
          }
          coursesResponse = await courseApi.searchCourses(params)
        }

        if (isMounted) {
          if (Array.isArray(coursesResponse.data)) {
            // Handle array response for price sort
            setCourses(coursesResponse.data)
            setTotalPages(1)
            setTotalElements(coursesResponse.data.length)
          } else if (coursesResponse.data?.content) {
            // Handle paginated response for other sorts
            setCourses(coursesResponse.data.content)
            setTotalPages(coursesResponse.data.totalPages)
            setTotalElements(coursesResponse.data.totalElements)
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading courses:', err)
          setError('Failed to load courses. Please try again later.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setLoadingPage(false)
        }
      }
    }

    const timeoutId = setTimeout(() => {
      loadCourses()
    }, 100)

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearchTerm,
    selectedCategories,
    selectedLevels,
    priceFilter,
    priceRange,
    sortBy,
  ])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [
    debouncedSearchTerm,
    selectedCategories,
    selectedLevels,
    priceFilter,
    priceRange,
    sortBy,
  ])

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleLevelToggle = (level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedLevels([])
    setPriceFilter('all')
    setPriceRange([0, 200])
    setSortBy('relevance')
    setSearchTerm('')
    setCurrentPage(0)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const activeFiltersCount =
    selectedCategories.length +
    selectedLevels.length +
    (priceFilter !== 'all' ? 1 : 0) +
    (searchTerm ? 1 : 0)

  return (
    <div className='container mx-auto py-8'>
      <div className='space-y-6'>
        {/* Search and Sort Bar */}
        <div className='flex flex-col lg:flex-row gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              placeholder='Search courses, instructors, or keywords...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
          <div className='flex gap-2'>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant='outline'
              size='icon'
              className='lg:hidden'
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <Filter className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Results Summary and Clear Filters */}
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            {loading ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Loading courses...
              </span>
            ) : (
              <>
                Showing {courses.length} of {totalElements} courses
                {searchTerm && (
                  <span className='ml-1'>
                    for "
                    <span className='font-medium text-foreground'>{searchTerm}</span>"
                  </span>
                )}
                {totalPages > 1 && (
                  <span className='ml-1'>
                    (Page {currentPage + 1} of {totalPages})
                  </span>
                )}
              </>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              className='flex items-center gap-1'
            >
              <X className='h-4 w-4' />
              Clear all filters
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className='flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1'>
            {searchTerm && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                Search: {searchTerm}
                <button onClick={() => setSearchTerm('')}>
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            )}
            {selectedCategories.map(categoryId => {
              const category = categories.find(c => String(c.id) === categoryId)
              return (
                <Badge
                  key={categoryId}
                  variant='secondary'
                  className='flex items-center gap-1'
                >
                  {category?.name || categoryId}
                  <button onClick={() => handleCategoryToggle(categoryId)}>
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              )
            })}
            {selectedLevels.map(level => (
              <Badge
                key={level}
                variant='secondary'
                className='flex items-center gap-1'
              >
                {level}
                <button onClick={() => handleLevelToggle(level)}>
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            ))}
            {priceFilter !== 'all' && (
              <Badge variant='secondary' className='flex items-center gap-1'>
                {priceFilter === 'free' ? 'Free' : 'Paid'}
                <button onClick={() => setPriceFilter('all')}>
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            )}
          </div>
        )}

        <div className='flex gap-6'>
          {/* Filters Sidebar - Desktop */}
          <div
            className={cn(
              'w-[240px] hidden lg:block shrink-0 transition-all duration-300',
              !isFilterVisible && 'w-0'
            )}
          >
            <div className='sticky top-24 bg-card rounded-lg border p-4'>
              <FilterSidebar
                selectedCategories={selectedCategories}
                selectedLevels={selectedLevels}
                priceFilter={priceFilter}
                priceRange={priceRange}
                categories={categories}
                onCategoryToggle={handleCategoryToggle}
                onLevelToggle={handleLevelToggle}
                onPriceFilterChange={setPriceFilter}
                onPriceRangeChange={setPriceRange}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Mobile Filter Sheet */}
          <Sheet
            open={isMobileFilterOpen}
            onOpenChange={setIsMobileFilterOpen}
          >
            <SheetContent side='left'>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className='py-4'>
                <FilterSidebar
                  selectedCategories={selectedCategories}
                  selectedLevels={selectedLevels}
                  priceFilter={priceFilter}
                  priceRange={priceRange}
                  categories={categories}
                  onCategoryToggle={handleCategoryToggle}
                  onLevelToggle={handleLevelToggle}
                  onPriceFilterChange={setPriceFilter}
                  onPriceRangeChange={setPriceRange}
                  onClearFilters={clearFilters}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Course Grid */}
          <div className='flex-1 min-w-0'>
            {error ? (
              <div className='text-center py-12'>
                <div className='space-y-4'>
                  <div className='text-6xl'>⚠️</div>
                  <h3 className='text-xl font-semibold'>{error}</h3>
                  <Button onClick={() => window.location.reload()} variant='outline'>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : loadingPage ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='h-6 w-6 animate-spin mr-2' />
                <span className='text-muted-foreground'>
                  Loading page {currentPage + 1}...
                </span>
              </div>
            ) : courses.length > 0 ? (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                  {courses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      variant='default'
                      showInstructor={true}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='flex items-center justify-center gap-2 mt-8'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0 || loadingPage}
                    >
                      <ChevronLeft className='h-4 w-4 mr-1' />
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => handlePageChange(i)}
                        disabled={loadingPage}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1 || loadingPage}
                    >
                      Next
                      <ChevronRight className='h-4 w-4 ml-1' />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className='text-center py-12'>
                <div className='space-y-4'>
                  <div className='text-6xl'>🔍</div>
                  <h3 className='text-xl font-semibold'>No courses found</h3>
                  <p className='text-muted-foreground max-w-md mx-auto'>
                    We couldn't find any courses matching your search criteria.
                    Try adjusting your filters or search terms.
                  </p>
                  <Button onClick={clearFilters} variant='outline'>
                    Clear all filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
