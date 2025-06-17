'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
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
import { toast } from 'sonner'
import { CoursesList } from './courses-list'
import { CoursesFilter } from './courses-filter'
import { CourseResponseDTO } from '@/types/course'
import { CategoryResponseDTO } from '@/types/category'

const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const PAGE_SIZE = 6

export function CoursesCatalogSection({
  managementView = false,
}: {
  managementView?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Chỉ dùng duy nhất state filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedCategory: null as string | null,
    selectedLevel: null as string | null,
    priceFilter: 'all',
    priceRange: [0, 500] as [number, number],
  })
  const [courses, setCourses] = useState<CourseResponseDTO[]>([])
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(PAGE_SIZE)

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories({ page: 0, size: 100 })
        if (response.data?.content) setCategories(response.data.content)
      } catch (err) {
        toast.error('Error', { description: 'Failed to load categories' })
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Load courses based on filters
  useEffect(() => {
    const loadCourses = async () => {
      if (categories.length === 0) return
      try {
        setLoadingCourses(true)
        setError(null)
        const params: any = {
          page: currentPage,
          size: pageSize,
          sort: 'id,desc',
        }
        if (filters.searchTerm.trim()) params.search = filters.searchTerm.trim()
        if (filters.selectedCategory) params.category = filters.selectedCategory
        if (filters.selectedLevel) params.level = filters.selectedLevel
        if (filters.priceFilter === 'free') params.maxPrice = 0
        else if (filters.priceFilter === 'paid') params.minPrice = 0.01
        if (filters.priceFilter !== 'free') {
          if (filters.priceRange[0] > 0) params.minPrice = filters.priceRange[0]
          if (filters.priceRange[1] < 500) params.maxPrice = filters.priceRange[1]
        }
        const response = await courseApi.searchCourses(params)
        if (response.data?.content) {
          setCourses(response.data.content)
          setTotalPages(response.data.totalPages)
          setTotalElements(response.data.totalElements)
        }
      } catch (err) {
        setError('Failed to load courses. Please try again.')
        toast.error('Error', { description: 'Failed to load courses' })
      } finally {
        setLoadingCourses(false)
      }
    }
    loadCourses()
  }, [currentPage, filters, categories])

  // Reset to first page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(0)
  }, [filters])

  // Scroll functions for category menu
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  // Only allow 1 category
  const handleCategoryChange = (categoryName: string) => {
    setFilters(prev => ({ ...prev, selectedCategory: categoryName === prev.selectedCategory ? null : categoryName }))
  }

  // Only allow 1 level
  const handleLevelChange = (level: string) => {
    setFilters(prev => ({ ...prev, selectedLevel: level === prev.selectedLevel ? null : level }))
  }

  // Only allow 1 price filter
  const handlePriceFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, priceFilter: value }))
    if (value === 'free') setFilters(prev => ({ ...prev, priceRange: [0, 0] }))
    else setFilters(prev => ({ ...prev, priceRange: [0, 500] }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters(prev => ({
      searchTerm: '',
      selectedCategory: null,
      selectedLevel: null,
      priceFilter: 'all',
      priceRange: [0, 500],
    }))
    setCurrentPage(0)
  }

  // Pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Search only on Enter
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setFilters(prev => ({ ...prev, searchTerm: (e.target as HTMLInputElement).value }))
    }
  }

  const renderPagination = () => {
    if (totalElements === 0) return null // Hide only if no courses

    const showPages = 5
    const startPage = Math.max(0, currentPage - Math.floor(showPages / 2))
    const endPage = Math.min(totalPages - 1, startPage + showPages - 1)

    return (
      <div className='flex items-center justify-center space-x-2 mt-8'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || loadingCourses}
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
              disabled={loadingCourses}
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
            disabled={loadingCourses}
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
              disabled={loadingCourses}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || loadingCourses}
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
          <p className='text-muted-foreground'>Đang tải...</p>
        </div>
      </div>
    )
  }

  const activeFiltersCount =
    (filters.selectedCategory ? 1 : 0) +
    (filters.selectedLevel ? 1 : 0) +
    (filters.priceFilter !== 'all' ? 1 : 0) +
    (filters.searchTerm ? 1 : 0)

  return (
    <div className={managementView ? 'relative' : ''}>
      {managementView && (
        <div className='absolute top-0 right-0 z-10'>
          <span className='inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-bl-lg text-xs shadow border border-blue-300'>
            <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                d='M12 2a1 1 0 0 1 1 1v1.07A7.002 7.002 0 0 1 19.93 11H21a1 1 0 1 1 0 2h-1.07A7.002 7.002 0 0 1 13 19.93V21a1 1 0 1 1-2 0v-1.07A7.002 7.002 0 0 1 4.07 13H3a1 1 0 1 1 0-2h1.07A7.002 7.002 0 0 1 11 4.07V3a1 1 0 0 1 1-1Zm0 4a5 5 0 1 0 0 10A5 5 0 0 0 12 6Z'
              />
            </svg>
            MANAGEMENT MODE
          </span>
        </div>
      )}
      <div
        className={
          managementView
            ? 'border-2 border-blue-200 rounded-xl p-4 bg-blue-50'
            : ''
        }
      >
        <div className='space-y-6'>
          {/* Search Bar */}
          <div className='max-w-2xl mx-auto'>
            <div className='relative'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5' />
              <Input
                placeholder='Tìm kiếm khóa học, giảng viên hoặc từ khóa...'
                value={filters.searchTerm}
                onChange={e => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                onKeyDown={handleInputKeyDown}
                className='pl-12 h-12 text-base'
              />
            </div>
          </div>

          <div className='flex gap-6'>
            {/* Sidebar Filters */}
            <div className='hidden lg:block w-64 space-y-6 p-4 border rounded-lg bg-card'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold flex items-center gap-2'>
                  <SlidersHorizontal className='h-4 w-4' />
                  Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <Button variant='ghost' size='sm' onClick={clearFilters}>
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>

              {/* Category Filter */}
              <div className='space-y-3'>
                <h4 className='font-medium'>Category</h4>
                <div className='flex flex-wrap gap-2 mb-4'>
                  <button
                    type='button'
                    className={filters.selectedCategory === null ? 'active border font-bold px-3 py-1 rounded' : 'border px-3 py-1 rounded'}
                    onClick={() => setFilters(prev => ({ ...prev, selectedCategory: null }))}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type='button'
                      className={filters.selectedCategory === String(cat.id) ? 'active border font-bold px-3 py-1 rounded' : 'border px-3 py-1 rounded'}
                      onClick={() => setFilters(prev => ({ ...prev, selectedCategory: String(cat.id) }))}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className='space-y-3'>
                <h4 className='font-medium'>Level</h4>
                {levels.map(level => (
                  <div key={level} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`level-${level}`}
                      checked={filters.selectedLevel === level}
                      onCheckedChange={() => handleLevelChange(level)}
                    />
                    <label
                      htmlFor={`level-${level}`}
                      className='text-sm cursor-pointer'
                    >
                      {level}
                    </label>
                  </div>
                ))}
              </div>

              {/* Price Filter */}
              <div className='space-y-3'>
                <h4 className='font-medium'>Price</h4>
                <Select
                  value={filters.priceFilter}
                  onValueChange={handlePriceFilterChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='free'>Free</SelectItem>
                    <SelectItem value='paid'>Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className='space-y-3'>
                <h4 className='font-medium'>Price Range</h4>
                <div className='px-2'>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={val => setFilters(prev => ({ ...prev, priceRange: val as [number, number] }))}
                    max={500}
                    min={0}
                    step={10}
                    className='w-full'
                    minStepsBetweenThumbs={1}
                  />
                  <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
