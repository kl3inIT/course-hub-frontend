'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Search,
  X,
  SlidersHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { courseApi } from '@/api/course-api'
import { categoryApi } from '@/api/category-api'
import { CourseCard } from './course-card'
import { useSearchParams } from 'next/navigation'
import { CourseResponseDTO } from '@/types/course'
import { CategoryResponseDTO } from '@/types/category'
import { useDebounce } from '@/hooks/use-debounce'

const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
]

export function CourseCatalog() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [priceFilter, setPriceFilter] = useState<string>('all')
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState('relevance')
  const [showFilters, setShowFilters] = useState(false)

  const [courses, setCourses] = useState<CourseResponseDTO[]>([])
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(6)
  const [loadingPage, setLoadingPage] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 1000)

  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    }
    // chỉ chạy 1 lần khi mount
    // eslint-disable-next-line
  }, []);

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

  // Handle initial category from URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl])
    }
  }, [searchParams])

  // Load courses based on filters and pagination
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoadingPage(currentPage > 0)
        setLoading(currentPage === 0)
        setError(null)

        // Build search parameters for server-side filtering
        const searchParams: any = {
          page: currentPage,
          size: pageSize,
        }

        if (debouncedSearchTerm) searchParams.search = debouncedSearchTerm

        // Convert category name to ID for backend
        if (selectedCategories.length > 0) {
          const selectedCategory = categories.find(
            cat => cat.name === selectedCategories[0]
          )
          if (selectedCategory) {
            searchParams.category = selectedCategory.id
          }
        }

        if (selectedLevels.length > 0) searchParams.level = selectedLevels[0]

        // Handle price filters
        if (priceFilter === 'free') {
          searchParams.maxPrice = 0
        } else if (priceFilter === 'paid') {
          searchParams.minPrice = 0.01
        }

        if (priceFilter !== 'free') {
          if (priceRange[0] > 0) searchParams.minPrice = priceRange[0]
          if (priceRange[1] < 1000) searchParams.maxPrice = priceRange[1]
        }

        // Add sorting
        if (sortBy === 'price-low') searchParams.sort = 'price,asc'
        else if (sortBy === 'price-high') searchParams.sort = 'price,desc'
        else if (sortBy === 'newest') searchParams.sort = 'id,desc'
        else if (sortBy === 'popularity')
          searchParams.sort = 'totalStudents,desc'

        console.log('Search params being sent:', searchParams)

        // Use searchCourses instead of getAllCourses for server-side filtering
        const coursesResponse = await courseApi.searchCourses(searchParams)

        if (coursesResponse.data?.content) {
          setCourses(coursesResponse.data.content)
          setTotalPages(coursesResponse.data.totalPages)
          setTotalElements(coursesResponse.data.totalElements)
        }
      } catch (err) {
        console.error('Error loading courses:', err)
        setError('Failed to load courses. Please try again later.')
      } finally {
        setLoading(false)
        setLoadingPage(false)
      }
    }

    loadCourses()
  }, [
    currentPage,
    pageSize,
    debouncedSearchTerm,
    selectedCategories,
    selectedLevels,
    priceFilter,
    priceRange,
    sortBy,
    categories,
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

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    }
  }

  const handleLevelChange = (level: string, checked: boolean) => {
    if (checked) {
      setSelectedLevels([...selectedLevels, level])
    } else {
      setSelectedLevels(selectedLevels.filter(l => l !== level))
    }
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedLevels([])
    setPriceFilter('all')
    setPriceRange([0, 200])
    setSortBy('relevance')
    setCurrentPage(0)
  }

  const activeFiltersCount =
    selectedCategories.length +
    selectedLevels.length +
    (priceFilter !== 'all' ? 1 : 0) +
    (searchTerm ? 1 : 0)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const showPages = 5
    const startPage = Math.max(0, currentPage - Math.floor(showPages / 2))
    const endPage = Math.min(totalPages - 1, startPage + showPages - 1)

    return (
      <div className='flex items-center justify-center space-x-2 mt-8'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || loadingPage}
        >
          <ChevronLeft className='h-4 w-4' />
          Previous
        </Button>

        {startPage > 0 && (
          <>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(0)}
              disabled={loadingPage}
            >
              1
            </Button>
            {startPage > 1 && <span className='px-2'>...</span>}
          </>
        )}

        {Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        ).map(page => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size='sm'
            onClick={() => handlePageChange(page)}
            disabled={loadingPage}
          >
            {page + 1}
          </Button>
        ))}

        {endPage < totalPages - 1 && (
          <>
            {endPage < totalPages - 2 && <span className='px-2'>...</span>}
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={loadingPage}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || loadingPage}
        >
          Next
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='text-muted-foreground'>Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <div className='text-6xl'>⚠️</div>
          <h3 className='text-xl font-semibold'>Error Loading Courses</h3>
          <p className='text-muted-foreground max-w-md mx-auto'>{error}</p>
          <Button onClick={() => window.location.reload()} variant='outline'>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
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
        </div>
      </div>

      {/* Results Summary */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
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
        </div>
        {activeFiltersCount > 0 && (
          <Button variant='ghost' size='sm' onClick={clearAllFilters}>
            <X className='h-4 w-4 mr-1' />
            Clear all filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className='flex flex-wrap gap-2'>
          {searchTerm && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Search: {searchTerm}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => setSearchTerm('')}
              />
            </Badge>
          )}
          {selectedCategories.map(category => (
            <Badge
              key={category}
              variant='secondary'
              className='flex items-center gap-1'
            >
              {category}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => handleCategoryChange(category, false)}
              />
            </Badge>
          ))}
          {selectedLevels.map(level => (
            <Badge
              key={level}
              variant='secondary'
              className='flex items-center gap-1'
            >
              {level}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => handleLevelChange(level, false)}
              />
            </Badge>
          ))}
          {priceFilter !== 'all' && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              {priceFilter === 'free' ? 'Free' : 'Paid'}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => setPriceFilter('all')}
              />
            </Badge>
          )}
        </div>
      )}

      <div className='flex gap-6'>
        {/* Fixed Filters Sidebar */}
        <div className='hidden lg:block w-64 space-y-6 p-4 border rounded-lg bg-card'>
          <h3 className='font-semibold'>Filters</h3>

          {/* Category Filter */}
          <div className='space-y-3'>
            <h4 className='font-medium'>Category</h4>
            {categories.length > 0 ? (
              categories.map(category => (
                <div key={category.id} className='flex items-center space-x-2'>
                  <Checkbox
                    id={category.name}
                    checked={selectedCategories.includes(category.name)}
                    onCheckedChange={checked =>
                      handleCategoryChange(category.name, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={category.name}
                    className='text-sm cursor-pointer'
                  >
                    {category.name}{' '}
                    {category.courseCount && `(${category.courseCount})`}
                  </label>
                </div>
              ))
            ) : (
              <p className='text-sm text-muted-foreground'>
                No categories available
              </p>
            )}
          </div>

          {/* Level Filter */}
          <div className='space-y-3'>
            <h4 className='font-medium'>Skill Level</h4>
            {levels.map(level => (
              <div key={level} className='flex items-center space-x-2'>
                <Checkbox
                  id={level}
                  checked={selectedLevels.includes(level)}
                  onCheckedChange={checked =>
                    handleLevelChange(level, checked as boolean)
                  }
                />
                <label htmlFor={level} className='text-sm cursor-pointer'>
                  {level}
                </label>
              </div>
            ))}
          </div>

          {/* Price Filter */}
          <div className='space-y-3'>
            <h4 className='font-medium'>Price</h4>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Courses</SelectItem>
                <SelectItem value='free'>Free</SelectItem>
                <SelectItem value='paid'>Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          {priceFilter !== 'free' && (
            <div className='space-y-3'>
              <h4 className='font-medium'>Price Range</h4>
              <div className='px-2'>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
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

        {/* Course Grid */}
        <div className='flex-1'>
          {loadingPage && (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin mr-2' />
              <span className='text-muted-foreground'>
                Loading page {currentPage + 1}...
              </span>
            </div>
          )}

          {!loadingPage && courses.length > 0 ? (
            <>
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

              {renderPagination()}
            </>
          ) : (
            !loadingPage && (
              <div className='text-center py-12'>
                <div className='space-y-4'>
                  <div className='text-6xl'>🔍</div>
                  <h3 className='text-xl font-semibold'>No courses found</h3>
                  <p className='text-muted-foreground max-w-md mx-auto'>
                    We couldn't find any courses matching your search criteria.
                    Try adjusting your filters or search terms.
                  </p>
                  <Button onClick={clearAllFilters} variant='outline'>
                    Clear all filters
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
