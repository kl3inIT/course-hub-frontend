"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Upload,
  ImageIcon,
  DollarSign,
  BookOpen,
  Save,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Tags,
  ArrowRight,
} from "lucide-react"
import { RoleGuard } from "@/components/auth/role-guard"
import { courseAPI, type CourseRequestDTO, type CourseResponseDTO } from "@/api/course"
import { categoryAPI, type CategoryResponseDTO } from "@/api/category"
import { toast } from "sonner"

interface FormData {
  title: string
  price: string
  description: string
  thumbnail: File | null
  level: string
  category: string
}

interface FormErrors {
  title?: string
  price?: string
  description?: string
  thumbnail?: string
  level?: string
  category?: string
}

export function CourseCreationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: "",
    price: "",
    description: "",
    thumbnail: null,
    level: "",
    category: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error" | "creating" | "uploading">("idle")
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isDirty, setIsDirty] = useState(false)
  const [createdCourseId, setCreatedCourseId] = useState<number | null>(null)
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await categoryAPI.getAllCategories()
        setCategories(response.data.content || [])
        console.log('Categories loaded:', response.data.content)
      } catch (error) {
        console.error('Failed to load categories:', error)
        toast.error('Failed to load categories')
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    
    loadCategories()
  }, [])

  const formatPrice = (value: string): string => {
    const num = Number.parseFloat(value)
    if (isNaN(num)) return ""
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const validateField = (name: keyof FormData, value: any): string | undefined => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Course title is required"
        if (value.length < 5) return "Title must be at least 5 characters"
        if (value.length > 100) return "Title must be 100 characters or less"
        break
      case "price":
        if (!value) return "Price is required"
        const price = Number.parseFloat(value)
        if (isNaN(price) || price <= 0) return "Price must be greater than 0"
        if (!/^\d+(\.\d{1,2})?$/.test(value)) return "Price must have at most 2 decimal places"
        break
      case "description":
        if (!value.trim()) return "Course description is required"
        if (value.length < 20) return "Description must be at least 20 characters"
        if (value.length > 2000) return "Description must be 2000 characters or less"
        break
      case "thumbnail":
        if (!value) return "Course thumbnail is required"
        break
      case "level":
        if (!value) return "Course level is required"
        break
      case "category":
        if (!value) return "Course category is required"
        break
    }
    return undefined
  }

  const handleInputChange = useCallback(
    (name: keyof FormData, value: any) => {
      setFormData((prev) => ({ ...prev, [name]: value }))
      setIsDirty(true)

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }))
      }

      // Real-time validation for price
      if (name === "price") {
        const error = validateField(name, value)
        if (error) {
          setErrors((prev) => ({ ...prev, [name]: error }))
        }
      }
    },
    [errors],
  )

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, thumbnail: "Please upload a valid image file (JPEG, PNG, GIF, WebP)" }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, thumbnail: "Image size must be less than 5MB" }))
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImagePreview(result)
      setFormData((prev) => ({ ...prev, thumbnail: file }))
      setErrors((prev) => ({ ...prev, thumbnail: undefined }))
      setIsDirty(true)
    }
    reader.readAsDataURL(file)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof FormData, formData[key as keyof FormData])
      if (error) {
        newErrors[key as keyof FormErrors] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setSubmitStatus("error")
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("creating")

    try {
      // Step 1: Create course
      const courseData: CourseRequestDTO = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        level: formData.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        categoryCode: parseInt(formData.category),
      }

      const selectedCategory = categories.find(cat => cat.id === formData.category)
      
      console.log('Creating course with data:', courseData)
      console.log('Selected category:', selectedCategory?.name)
      
      const createResponse = await courseAPI.createCourse(courseData)
      console.log('Course created successfully:', createResponse)
      
      const createdCourse = createResponse.data
      setCreatedCourseId(createdCourse.id)
      
      toast.success(createResponse.message || "Course created successfully!")

      // Step 2: Upload thumbnail if provided
      if (formData.thumbnail) {
        setSubmitStatus("uploading")
        toast.info("Uploading thumbnail...")
        
        try {
          const thumbnailResponse = await courseAPI.uploadThumbnail(createdCourse.id, formData.thumbnail)
          console.log('Thumbnail uploaded successfully:', thumbnailResponse)
          toast.success(thumbnailResponse.message || "Thumbnail uploaded successfully!")
        } catch (thumbnailError) {
          console.error('Thumbnail upload failed:', thumbnailError)
          
          const errorMessage = thumbnailError instanceof Error ? thumbnailError.message : 'Thumbnail upload failed'
          toast.warning(`Course created but thumbnail upload failed: ${errorMessage}`)
        }
      }

      setSubmitStatus("success")
      setIsDirty(false)
      
      if (selectedCategory) {
        toast.success(`Course created successfully in ${selectedCategory.name} category! Redirecting to course editor...`)
      } else {
        toast.success("Course created successfully! Redirecting to course editor...")
      }

      // Redirect to course editor to add modules and lessons
      setTimeout(() => {
        router.push(`/manager/courses/${createdCourse.id}/edit`)
      }, 2000)

    } catch (error) {
      console.error('Course creation failed:', error)
      setSubmitStatus("error")
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course'
      toast.error(`Failed to create course: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to clear the form?")
      if (!confirmed) return
    }

    // Reset form
    resetForm()
    setSubmitStatus("idle")
  }

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      description: "",
      thumbnail: null,
      level: "",
      category: "",
    })
    setImagePreview("")
    setErrors({})
    setIsDirty(false)
    setCreatedCourseId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getSubmitButtonContent = () => {
    if (submitStatus === "creating" || submitStatus === "uploading") {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          {submitStatus === "creating" ? "Creating course..." : "Uploading thumbnail..."}
        </>
      )
    } else {
      return (
        <>
          <Save className="h-4 w-4 mr-2" />
          Create & Edit Course
        </>
      )
    }
  }

  return (
    <RoleGuard allowedRoles={["manager", "admin"]}>
      <TooltipProvider>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Information
              </CardTitle>
              <CardDescription>Provide the basic details about your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Course Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Course Title <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Choose a clear, descriptive title that accurately represents your course content</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Complete React.js Development Course"
                  className={errors.title ? "border-red-500" : ""}
                  maxLength={100}
                />
                <div className="flex justify-between text-xs">
                  <span className={errors.title ? "text-red-500" : "text-muted-foreground"}>
                    {errors.title || "Enter a compelling course title"}
                  </span>
                  <span className={`${formData.title.length > 90 ? "text-orange-500" : "text-muted-foreground"}`}>
                    {formData.title.length}/100
                  </span>
                </div>
              </div>

              {/* Course Price - Now single column */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Course Price <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set a competitive price for your course. Consider the value you're providing.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative max-w-xs">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="99.99"
                    className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
                  />
                </div>
                {formData.price && !errors.price && (
                  <p className="text-sm text-green-600">Formatted: ${formatPrice(formData.price)}</p>
                )}
                {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
              </div>

              {/* Course Level */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="level" className="text-sm font-medium">
                    Course Level <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select the appropriate difficulty level for your target audience</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                  <SelectTrigger className={errors.level ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select course level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Beginner</Badge>
                        <span className="text-sm text-muted-foreground">No prior experience required</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="INTERMEDIATE">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Intermediate</Badge>
                        <span className="text-sm text-muted-foreground">Some experience recommended</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ADVANCED">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Advanced</Badge>
                        <span className="text-sm text-muted-foreground">Extensive experience required</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.level && <p className="text-xs text-red-500">{errors.level}</p>}
              </div>

              {/* Course Category */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Course Category <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select the appropriate category for your course</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""} disabled={loadingCategories}>
                    <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select course category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 && !loadingCategories ? (
                      <SelectItem value="none" disabled>
                        <span className="text-muted-foreground">No categories available</span>
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <Tags className="h-4 w-4" />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                {loadingCategories && <p className="text-xs text-blue-600">Loading available categories...</p>}
              </div>
            </CardContent>
          </Card>

          {/* Course Description */}
          <Card>
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
              <CardDescription>Write a compelling description that explains what students will learn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what students will learn in this course. Include course objectives, prerequisites, and what makes your course unique.

Example:
This comprehensive React course will teach you everything you need to know to build modern web applications. You'll learn React fundamentals, hooks, state management, and much more through hands-on projects.

What you'll learn:
- React fundamentals and JSX
- Component lifecycle and hooks
- State management with Redux
- Building real-world projects

Prerequisites:
- Basic JavaScript knowledge
- HTML/CSS understanding"
                  className={`min-h-[200px] ${errors.description ? "border-red-500" : ""}`}
                  maxLength={2000}
                />
                <div className="flex justify-between text-xs">
                  <span className={errors.description ? "text-red-500" : "text-muted-foreground"}>
                    {errors.description || "Minimum 20 characters required"}
                  </span>
                  <span
                    className={`${formData.description.length > 1800 ? "text-orange-500" : "text-muted-foreground"}`}
                  >
                    {formData.description.length}/2000
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Course Thumbnail
              </CardTitle>
              <CardDescription>Upload an attractive thumbnail image for your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Upload Thumbnail <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File
                  </Button>
                  <span className="text-sm text-muted-foreground">JPEG, PNG, GIF, WebP (max 5MB)</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                {errors.thumbnail && <p className="text-xs text-red-500">{errors.thumbnail}</p>}
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Preview</Label>
                  <div className="relative w-full max-w-md">
                    <img
                      src={imagePreview}
                      alt="Course thumbnail preview"
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={() => {
                        setImagePreview("")
                        setErrors((prev) => ({ ...prev, thumbnail: "Failed to load image" }))
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview("")
                        setFormData((prev) => ({ ...prev, thumbnail: null }))
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card>
            <CardContent className="pt-6">
              {submitStatus === "success" && (
                <Alert className="mb-4 border-green-500 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Course created successfully! 
                    {createdCourseId && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm">Course ID: {createdCourseId}</span>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/manager/courses/${createdCourseId}/edit`)}
                          className="gap-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                          Continue to Course Editor
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/courses/${createdCourseId}`)}
                        >
                          View Course
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === "error" && (
                <Alert className="mb-4 border-red-500 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Failed to create course. Please check the form and try again.
                  </AlertDescription>
                </Alert>
              )}

              {(submitStatus === "creating" || submitStatus === "uploading") && (
                <Alert className="mb-4 border-blue-500 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    {submitStatus === "creating" ? "Creating your course..." : "Uploading thumbnail..."}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 md:flex-none md:min-w-[200px]"
                >
                  {getSubmitButtonContent()}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel} 
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </TooltipProvider>
    </RoleGuard>
  )
}
