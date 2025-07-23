'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
import { Search, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { courseApi } from '@/services/course-api'
import { categoryApi } from '@/services/category-api'
import { useSearchParams } from 'next/navigation'
import {
  CourseResponseDTO,
  CourseSearchStatsResponseDTO,
  CourseSearchParams,
} from '@/types/course'
import { CategoryResponseDTO } from '@/types/category'
import { useDebounce } from '@/hooks/use-debounce'
import { CoursesCatalogSection } from './courses-catalog-section'
import { CourseFilterSidebar } from './course-filter-sidebar'

const levels = ['Beginner', 'Intermediate', 'Advanced']
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
  const [isFree, setIsFree] = useState<boolean | undefined>()
  const [isDiscounted, setIsDiscounted] = useState<boolean | undefined>()
  const [sortBy, setSortBy] = useState('relevance')
  const [showFilters, setShowFilters] = useState(false)

  const [courses, setCourses] = useState<CourseResponseDTO[]>([])
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [searchStats, setSearchStats] =
    useState<CourseSearchStatsResponseDTO | null>(null)

  // Tách loading states
  const [initialLoading, setInitialLoading] = useState(true) // Chỉ dùng lần đầu
  const [sectionLoading, setSectionLoading] = useState(false) // Chỉ cho section
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(6)

  const debouncedSearchTerm = useDebounce(searchTerm, 1000)

  // Memoize handlers để tránh re-render filter sidebar
  const handleCategoryChange = useCallback(
    (category: string, checked: boolean) => {
      if (checked) {
        setSelectedCategories(prev => [...prev, category])
      } else {
        setSelectedCategories(prev => prev.filter(c => c !== category))
      }
    },
    []
  )

  const handleLevelChange = useCallback((level: string, checked: boolean) => {
    if (checked) {
      setSelectedLevels(prev => [...prev, level])
    } else {
      setSelectedLevels(prev => prev.filter(l => l !== level))
    }
  }, [])

  const handlePriceFilterChange = useCallback((value: string) => {
    setPriceFilter(value)
  }, [])

  const handlePriceRangeChange = useCallback((value: number[]) => {
    setPriceRange(value)
  }, [])

  const handleIsFreeChange = useCallback((value: boolean | undefined) => {
    setIsFree(value)
  }, [])

  const handleIsDiscountedChange = useCallback((value: boolean | undefined) => {
    setIsDiscounted(value)
  }, [])

  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    }
  }, [searchParams])

  // Load categories and stats once - không reload
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesResponse, statsResponse] = await Promise.all([
          categoryApi.getAllCategories({ page: 0, size: 100 }),
          courseApi.getSearchStats(),
        ])

        if (categoriesResponse.data?.content) {
          setCategories(categoriesResponse.data.content)
        }

        if (statsResponse.data) {
          setSearchStats(statsResponse.data)
          setPriceRange([
            statsResponse.data.minPrice,
            statsResponse.data.maxPrice,
          ])
        }
      } catch (err) {
        console.error('Error loading initial data:', err)
      }
    }

    loadInitialData()
  }, [])

  // Handle initial category from URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl])
    }
  }, [searchParams])

  // Load courses - chỉ reload section
  useEffect(() => {
    const loadCourses = async () => {
      try {
        // Chỉ set initialLoading cho lần đầu, sau đó dùng sectionLoading
        if (initialLoading) {
          setInitialLoading(true)
        } else {
          setSectionLoading(true)
        }
        setError(null)

        // Build search parameters for advanced search
        const searchParams: CourseSearchParams = {
          page: currentPage,
          size: pageSize,
          searchTerm: debouncedSearchTerm || undefined,
          categoryId:
            selectedCategories.length > 0
              ? categories.find(cat => cat.name === selectedCategories[0])?.id
              : undefined,
          level: selectedLevels.length > 0 ? selectedLevels[0] : undefined,
          // Fix price filter logic - Only apply price filters when explicitly set
          minPrice:
            priceFilter === 'free'
              ? 0
              : priceFilter === 'paid'
                ? Math.max(1, priceRange[0])
                : undefined, // Don't filter by minPrice when 'all'
          maxPrice: priceFilter === 'free' ? 0 : undefined, // Don't filter by maxPrice when 'all'
          isFree: priceFilter === 'free' ? true : isFree,
          isDiscounted: isDiscounted,
          sortBy:
            sortBy === 'price-low'
              ? 'price'
              : sortBy === 'price-high'
                ? 'price'
                : sortBy === 'newest'
                  ? 'createdDate'
                  : sortBy === 'relevance'
                    ? 'title' // Use title for relevance sort instead of averageRating
                    : sortBy === 'rating'
                      ? 'createdDate' // Fallback to createdDate since averageRating is calculated
                      : undefined,
          sortDirection:
            sortBy === 'price-low'
              ? 'asc'
              : sortBy === 'price-high'
                ? 'desc'
                : sortBy === 'newest'
                  ? 'desc'
                  : sortBy === 'rating'
                    ? 'desc'
                    : sortBy === 'relevance'
                      ? 'asc'
                      : undefined,
        }

        // Client-side validation before sending request
        if (
          searchParams.minPrice &&
          searchParams.maxPrice &&
          searchParams.minPrice > searchParams.maxPrice
        ) {
          setError('Minimum price cannot be greater than maximum price')
          return
        }

        console.log('Search params being sent:', searchParams)

        // Use advancedSearch for server-side filtering
        const coursesResponse = await courseApi.advancedSearch(searchParams)

        // Lấy dữ liệu từ response có cấu trúc PagedResponse
        const { content = [], page = { totalPages: 0, totalElements: 0 } } =
          coursesResponse.data || {}

        setCourses(content)
        setTotalPages(page.totalPages || 0)
        setTotalElements(page.totalElements || 0)
      } catch (err) {
        console.error('Error loading courses:', err)
        setError('Failed to load courses. Please try again later.')
      } finally {
        setInitialLoading(false)
        setSectionLoading(false)
      }
    }

    // Chỉ load courses khi có categories (tránh load sớm)
    if (categories.length > 0 || selectedCategories.length === 0) {
      loadCourses()
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearchTerm,
    selectedCategories,
    selectedLevels,
    priceFilter,
    priceRange,
    isFree,
    isDiscounted,
    sortBy,
    categories,
    initialLoading,
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
    isFree,
    isDiscounted,
    sortBy,
  ])

  const clearAllFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedLevels([])
    setPriceFilter('all')
    setPriceRange([0, 200])
    setIsFree(undefined)
    setIsDiscounted(undefined)
    setSortBy('relevance')
    setCurrentPage(0)
  }, [])

  const activeFiltersCount =
    selectedCategories.length +
    selectedLevels.length +
    (priceFilter !== 'all' ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (isFree ? 1 : 0) +
    (isDiscounted ? 1 : 0)

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 0 && newPage < totalPages) {
        setCurrentPage(newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    [totalPages]
  )

  const renderPagination = useCallback(() => {
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
          disabled={currentPage === 0 || sectionLoading}
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
              disabled={sectionLoading}
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
            disabled={sectionLoading}
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
              disabled={sectionLoading}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || sectionLoading}
        >
          Next
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    )
  }, [currentPage, totalPages, sectionLoading, handlePageChange])

  if (initialLoading) {
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
            maxLength={100}
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
          <span>
            <b>{totalElements}</b> courses found
          </span>
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

          {isFree && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Free Courses
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => setIsFree(undefined)}
              />
            </Badge>
          )}
          {isDiscounted && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Discounted
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => setIsDiscounted(undefined)}
              />
            </Badge>
          )}
        </div>
      )}

      <div className='flex gap-6'>
        {/* Fixed Filters Sidebar - Không reload */}
        <CourseFilterSidebar
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          levels={levels}
          selectedLevels={selectedLevels}
          onLevelChange={handleLevelChange}
          priceFilter={priceFilter}
          setPriceFilter={handlePriceFilterChange}
          priceRange={priceRange}
          setPriceRange={handlePriceRangeChange}
          searchStats={searchStats}
          isDiscounted={isDiscounted}
          setIsDiscounted={handleIsDiscountedChange}
          isFree={isFree}
          setIsFree={handleIsFreeChange}
        />

        {/* Course Grid Section - Chỉ reload phần này */}
        <div className='flex-1'>
          <CoursesCatalogSection
            courses={courses}
            loading={sectionLoading}
            error={error}
            onRetry={() => window.location.reload()}
            renderPagination={renderPagination}
          />
        </div>
      </div>
    </div>
  )
}
