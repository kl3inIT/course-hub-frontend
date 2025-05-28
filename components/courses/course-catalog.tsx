"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Search, Star, Clock, Users, X, SlidersHorizontal } from "lucide-react"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import Link from "next/link"

const courses = [
  {
    id: 1,
    title: "React.js Fundamentals",
    description:
      "Learn the basics of React.js and build modern web applications with hooks, components, and state management",
    instructor: "John Doe",
    price: 99,
    originalPrice: 149,
    rating: 4.8,
    students: 1234,
    duration: "8 hours",
    category: "Programming",
    level: "Beginner",
    image: "/placeholder.svg?height=200&width=300",
    keywords: ["react", "javascript", "frontend", "web development", "hooks"],
    popularity: 95,
    isFree: false,
  },
  {
    id: 2,
    title: "Advanced JavaScript ES6+",
    description:
      "Master advanced JavaScript concepts, ES6+ features, async programming, and modern development patterns",
    instructor: "Jane Smith",
    price: 149,
    rating: 4.9,
    students: 856,
    duration: "12 hours",
    category: "Programming",
    level: "Advanced",
    image: "/placeholder.svg?height=200&width=300",
    keywords: ["javascript", "es6", "async", "promises", "advanced"],
    popularity: 88,
    isFree: false,
  },
  {
    id: 3,
    title: "UI/UX Design Principles",
    description: "Learn design thinking, user research, wireframing, and create beautiful user interfaces",
    instructor: "Mike Johnson",
    price: 79,
    originalPrice: 99,
    rating: 4.7,
    students: 2341,
    duration: "6 hours",
    category: "Design",
    level: "Beginner",
    image: "/placeholder.svg?height=200&width=300",
    keywords: ["design", "ui", "ux", "wireframing", "user research"],
    popularity: 92,
    isFree: false,
  },
  {
    id: 4,
    title: "Node.js Backend Development",
    description: "Build scalable backend applications with Node.js, Express, databases, and API development",
    instructor: "Sarah Wilson",
    price: 129,
    rating: 4.6,
    students: 567,
    duration: "10 hours",
    category: "Programming",
    level: "Intermediate",
    image: "/placeholder.svg?height=200&width=300",
    keywords: ["nodejs", "backend", "express", "api", "database"],
    popularity: 75,
    isFree: false,
  },
  {
    id: 5,
    title: "Digital Marketing Fundamentals",
    description: "Learn SEO, social media marketing, content strategy, and analytics to grow your business online",
    instructor: "Emily Davis",
    price: 0,
    rating: 4.5,
    students: 3456,
    duration: "4 hours",
    category: "Business",
    level: "Beginner",
    image: "/placeholder.svg?height=200&width=300",
    keywords: ["marketing", "seo", "social media", "analytics", "business"],
    popularity: 89,
    isFree: true,
  },
  {
    id: 6,
    title: "Python Data Science",
    description: "Master data analysis, visualization, and machine learning with Python, pandas, and scikit-learn",
    instructor: "David Chen",
    price: 199,
    rating: 4.8,
    students: 1876,
    duration: "15 hours",
    category: "Programming",
    level: "Intermediate",
    image: "/placeholder.svg?height=200&width=300",
    keywords: ["python", "data science", "machine learning", "pandas", "analysis"],
    popularity: 91,
    isFree: false,
  },
  {
    id: 7,
    title: "Graphic Design Mastery",
    description: "Create stunning visual designs using Adobe Creative Suite, typography, and color theory",
    instructor: "Lisa Rodriguez",
    price: 89,
    rating: 4.6,
    students: 987,
    duration: "9 hours",
    category: "Design",
    level: "Intermediate",
    image: "/placeholder.svg?height=200&width=300",
    keywords: ["graphic design", "adobe", "typography", "color theory", "visual"],
    popularity: 78,
    isFree: false,
  },
  {
    id: 8,
    title: "Business Strategy & Leadership",
    description: "Develop strategic thinking, leadership skills, and learn to make data-driven business decisions",
    instructor: "Robert Taylor",
    price: 0,
    rating: 4.4,
    students: 2134,
    duration: "7 hours",
    category: "Business",
    level: "Advanced",
    image: "/placeholder.svg?height=200&width=300",
    keywords: ["business", "strategy", "leadership", "management", "decisions"],
    popularity: 82,
    isFree: true,
  },
]

const categories = ["Programming", "Design", "Business"]
const levels = ["Beginner", "Intermediate", "Advanced"]
const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
]

export function CourseCatalog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [priceFilter, setPriceFilter] = useState<string>("all")
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(false)

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const handleLevelChange = (level: string, checked: boolean) => {
    if (checked) {
      setSelectedLevels([...selectedLevels, level])
    } else {
      setSelectedLevels(selectedLevels.filter((l) => l !== level))
    }
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedLevels([])
    setPriceFilter("all")
    setPriceRange([0, 200])
    setSortBy("relevance")
  }

  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      // Search functionality
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower) ||
        course.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category)

      // Level filter
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level)

      // Price filter
      const matchesPrice = (() => {
        if (priceFilter === "free") return course.isFree
        if (priceFilter === "paid") return !course.isFree
        return true
      })()

      // Price range filter
      const matchesPriceRange = course.price >= priceRange[0] && course.price <= priceRange[1]

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesPriceRange
    })

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.popularity - a.popularity
        case "rating":
          return b.rating - a.rating
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
          return b.id - a.id
        case "relevance":
        default:
          // Simple relevance based on search term match and popularity
          if (searchTerm) {
            const aRelevance =
              (a.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 2 : 0) +
              (a.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase())) ? 1 : 0)
            const bRelevance =
              (b.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 2 : 0) +
              (b.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase())) ? 1 : 0)
            if (aRelevance !== bRelevance) return bRelevance - aRelevance
          }
          return b.popularity - a.popularity
      }
    })

    return filtered
  }, [searchTerm, selectedCategories, selectedLevels, priceFilter, priceRange, sortBy])

  const activeFiltersCount =
    selectedCategories.length + selectedLevels.length + (priceFilter !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Search and Sort Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search courses, instructors, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedCourses.length} of {courses.length} courses
          {searchTerm && (
            <span className="ml-1">
              for "<span className="font-medium text-foreground">{searchTerm}</span>"
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear all filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchTerm}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
            </Badge>
          )}
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              {category}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange(category, false)} />
            </Badge>
          ))}
          {selectedLevels.map((level) => (
            <Badge key={level} variant="secondary" className="flex items-center gap-1">
              {level}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleLevelChange(level, false)} />
            </Badge>
          ))}
          {priceFilter !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {priceFilter === "free" ? "Free" : "Paid"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceFilter("all")} />
            </Badge>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent className="lg:block">
            <div className="w-full lg:w-64 space-y-6 p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="lg:hidden">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Category</h4>
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                    />
                    <label htmlFor={category} className="text-sm cursor-pointer">
                      {category}
                    </label>
                  </div>
                ))}
              </div>

              {/* Level Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Skill Level</h4>
                {levels.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={level}
                      checked={selectedLevels.includes(level)}
                      onCheckedChange={(checked) => handleLevelChange(level, checked as boolean)}
                    />
                    <label htmlFor={level} className="text-sm cursor-pointer">
                      {level}
                    </label>
                  </div>
                ))}
              </div>

              {/* Price Filter */}
              <div className="space-y-3">
                <h4 className="font-medium">Price</h4>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              {priceFilter !== "free" && (
                <div className="space-y-3">
                  <h4 className="font-medium">Price Range</h4>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={200}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Course Grid */}
        <div className="flex-1">
          {filteredAndSortedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                    {course.isFree && <Badge className="absolute top-2 left-2 bg-green-500 text-white">FREE</Badge>}
                    {course.originalPrice && course.originalPrice > course.price && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{course.category}</Badge>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          {course.isFree ? (
                            <span className="text-2xl font-bold text-green-600">Free</span>
                          ) : course.originalPrice && course.originalPrice > course.price ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg text-muted-foreground line-through">
                                ${course.originalPrice}
                              </span>
                              <span className="text-2xl font-bold text-green-600">${course.price}</span>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold">${course.price}</span>
                          )}
                        </div>
                        <Link href={`/courses/${course.id}`}>
                          <Button>View Course</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="text-6xl">🔍</div>
                <h3 className="text-xl font-semibold">No courses found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any courses matching your search criteria. Try adjusting your filters or search
                  terms.
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
