"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, Loader2, Filter, X, SlidersHorizontal } from "lucide-react"
import { courseApi } from "@/api/course-api"
import { categoryApi } from "@/api/category-api"
import { CourseCard } from "./course-card"
import { useSearchParams } from "next/navigation"
import { CourseResponseDTO } from "@/types/course"
import { CategoryResponseDTO } from "@/types/category"
import { toast } from "sonner"

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
const PAGE_SIZE = 6;

export function CoursesCatalogSection({ managementView = false }: { managementView?: boolean }) {
  const searchParams = useSearchParams()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // States
  const [inputValue, setInputValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [priceFilter, setPriceFilter] = useState<string>("all")
  const [priceRange, setPriceRange] = useState([0, 500])
  const [courses, setCourses] = useState<CourseResponseDTO[]>([])
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(PAGE_SIZE)

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories({ 
          page: 0, 
          size: 100
        })
        
        if (response.data?.content) {
          setCategories(response.data.content)
        }
      } catch (err: any) {
        console.error('Error loading categories:', err)
        toast.error("Error", { description: "Failed to load categories" })
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  // Handle initial category from URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [searchParams])

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
          sort: "id,desc" // Mới nhất trước
        }

        if (searchTerm.trim()) {
          params.search = searchTerm.trim()
        }
        
        if (selectedCategory) {
          const categoryObj = categories.find(cat => 
            cat.name === selectedCategory || cat.id.toString() === selectedCategory
          )
          if (categoryObj) {
            params.category = categoryObj.id
          }
        }

        if (selectedLevel) {
          params.level = selectedLevel
        }

        // Handle price filters
        if (priceFilter === "free") {
          params.maxPrice = 0
        } else if (priceFilter === "paid") {
          params.minPrice = 0.01
        }

        if (priceFilter !== "free") {
          if (priceRange[0] > 0) params.minPrice = priceRange[0]
          if (priceRange[1] < 500) params.maxPrice = priceRange[1]
        }
        
        console.log('Loading courses with params:', params)
        const response = await courseApi.searchCourses(params)
        
        if (response.data?.content) {
          setCourses(response.data.content)
          setTotalPages(response.data.totalPages)
          setTotalElements(response.data.totalElements)
        }
      } catch (err: any) {
        console.error('Error loading courses:', err)
        setError('Failed to load courses. Please try again.')
        toast.error("Error", { description: "Failed to load courses" })
      } finally {
        setLoadingCourses(false)
      }
    }

    loadCourses()
  }, [currentPage, searchTerm, selectedCategory, selectedLevel, priceFilter, priceRange, categories])

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm, selectedCategory, selectedLevel, priceFilter, priceRange])

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
    setSelectedCategory(categoryName === selectedCategory ? null : categoryName)
  }

  // Only allow 1 level
  const handleLevelChange = (level: string) => {
    setSelectedLevel(level === selectedLevel ? null : level)
  }

  // Only allow 1 price filter
  const handlePriceFilterChange = (value: string) => {
    setPriceFilter(value)
    if (value === "free") setPriceRange([0, 0])
    else setPriceRange([0, 500])
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setInputValue("")
    setSelectedCategory(null)
    setSelectedLevel(null)
    setPriceFilter("all")
    setPriceRange([0, 500])
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
    if (e.key === "Enter") {
      setSearchTerm(inputValue)
    }
  }

  const renderPagination = () => {
    if (totalElements === 0) return null // Hide only if no courses

    const showPages = 5
    const startPage = Math.max(0, currentPage - Math.floor(showPages / 2))
    const endPage = Math.min(totalPages - 1, startPage + showPages - 1)

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || loadingCourses}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {startPage > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(0)} disabled={loadingCourses}>
              1
            </Button>
            {startPage > 1 && <span className="px-2">...</span>}
          </>
        )}

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            disabled={loadingCourses}
          >
            {page + 1}
          </Button>
        ))}

        {endPage < totalPages - 1 && (
          <>
            {endPage < totalPages - 2 && <span className="px-2">...</span>}
            <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages - 1)} disabled={loadingCourses}>
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || loadingCourses}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedLevel ? 1 : 0) + (priceFilter !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)

  return (
    <div className={managementView ? "relative" : ""}>
      {managementView && (
        <div className="absolute top-0 right-0 z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-bl-lg text-xs shadow border border-blue-300">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a1 1 0 0 1 1 1v1.07A7.002 7.002 0 0 1 19.93 11H21a1 1 0 1 1 0 2h-1.07A7.002 7.002 0 0 1 13 19.93V21a1 1 0 1 1-2 0v-1.07A7.002 7.002 0 0 1 4.07 13H3a1 1 0 1 1 0-2h1.07A7.002 7.002 0 0 1 11 4.07V3a1 1 0 0 1 1-1Zm0 4a5 5 0 1 0 0 10A5 5 0 0 0 12 6Z"/></svg>
            MANAGEMENT MODE
          </span>
        </div>
      )}
      <div className={managementView ? "border-2 border-blue-200 rounded-xl p-4 bg-blue-50" : ""}>
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Tìm kiếm khóa học, giảng viên hoặc từ khóa..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <div className="hidden lg:block w-64 space-y-6 p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Category</h4>
                <div className="max-h-72 overflow-y-auto flex flex-col gap-2 pr-1">
                  {categories.slice(0, 6).map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.name ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleCategoryChange(category.name)}
                      className="whitespace-nowrap w-full text-base font-semibold justify-start"
                    >
                      {category.name} <span className="ml-2 text-xs text-muted-foreground">({category.courseCount || 0})</span>
                    </Button>
                  ))}
                  {categories.length > 6 && (
                    <span className="text-muted-foreground text-xs flex items-center">Scroll for more...</span>
                  )}
                </div>
              </div>

              {/* Level Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Level</h4>
                {levels.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={selectedLevel === level}
                      onCheckedChange={() => handleLevelChange(level)}
                    />
                    <label htmlFor={`level-${level}`} className="text-sm cursor-pointer">
                      {level}
                    </label>
                  </div>
                ))}
              </div>

              {/* Price Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Price</h4>
                <Select value={priceFilter} onValueChange={handlePriceFilterChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h4 className="font-medium">Price Range</h4>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={500}
                    min={0}
                    step={10}
                    className="w-full"
                    minStepsBetweenThumbs={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Category Menu Scroll (Mobile) */}
              <div className="lg:hidden">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-sm">Category:</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={scrollLeft}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-x-auto scrollbar-hide"
                    style={{ 
                      scrollBehavior: 'smooth',
                      msOverflowStyle: 'none',
                      scrollbarWidth: 'none'
                    }}
                  >
                    <div className="flex space-x-3 py-2 px-1">
                      <Button
                        variant={selectedCategory === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                        className="whitespace-nowrap shrink-0"
                      >
                        All
                        {selectedCategory === null && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {totalElements}
                          </Badge>
                        )}
                      </Button>

                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.name ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCategoryChange(category.name)}
                          className="whitespace-nowrap shrink-0 flex items-center gap-2"
                        >
                          {category.name}
                          <Badge variant="secondary" className="text-xs">
                            {category.courseCount || 0}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={scrollRight}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Search: {searchTerm}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setSearchTerm("")} 
                        />
                      </Badge>
                    )}
                    {selectedCategory && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {selectedCategory}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setSelectedCategory(null)} 
                        />
                      </Badge>
                    )}
                    {selectedLevel && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {selectedLevel}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setSelectedLevel(null)} 
                        />
                      </Badge>
                    )}
                    {priceFilter !== "all" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {priceFilter === "free" ? "Free" : "Paid"}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handlePriceFilterChange("all")} 
                        />
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear all
                  </Button>
                </div>
              )}

              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {loadingCourses ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <>
                      Showing {courses.length} out of {totalElements} courses
                      {totalPages > 1 && (
                        <span className="ml-1">
                          (Page {currentPage + 1} / {totalPages})
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Course Grid */}
              <div className="min-h-[500px]">
                {error ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                      <div className="text-6xl">⚠️</div>
                      <h3 className="text-xl font-semibold">Error occurred</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
                      <Button onClick={() => window.location.reload()} variant="outline">
                        Try again
                      </Button>
                    </div>
                  </div>
                ) : loadingCourses ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                        <div className="bg-muted h-40 rounded mb-4"></div>
                        <div className="bg-muted h-4 rounded mb-2 w-3/4"></div>
                        <div className="bg-muted h-3 rounded mb-1 w-1/2"></div>
                        <div className="bg-muted h-3 rounded w-1/3"></div>
                      </div>
                    ))}
                  </div>
                ) : courses.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map((course) => (
                        <CourseCard 
                          key={course.id} 
                          course={course}
                          variant="default"
                          showInstructor={true}
                        />
                      ))}
                    </div>
                    
                    {renderPagination()}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="space-y-4">
                      <div className="text-6xl">🔍</div>
                      <h3 className="text-xl font-semibold">No courses found</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        No courses found that match your search criteria. Please try changing the keyword or category.
                      </p>
                      <Button onClick={clearFilters} variant="outline">
                        Clear filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 