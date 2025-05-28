"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Upload,
  ImageIcon,
  Link,
  Eye,
  DollarSign,
  Percent,
  BookOpen,
  Save,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  Tags,
  Plus,
} from "lucide-react"
import { RoleGuard } from "@/components/auth/role-guard"

interface FormData {
  title: string
  price: string
  discount: string
  description: string
  thumbnail: File | null
  level: string
  categories: string[]
  tags: string[]
}

interface FormErrors {
  title?: string
  price?: string
  discount?: string
  description?: string
  thumbnail?: string
  level?: string
  categories?: string
  tags?: string
}

const CATEGORIES = [
  "Web Development",
  "Data Science",
  "Marketing",
  "Design",
  "Business",
  "Photography",
  "Music",
  "Health & Fitness",
  "Language Learning",
  "Programming",
  "Mobile Development",
  "DevOps",
  "Artificial Intelligence",
  "Machine Learning",
  "Cybersecurity",
  "Cloud Computing",
  "Database Management",
  "Project Management",
  "Digital Marketing",
  "Content Creation",
]

const TAG_SUGGESTIONS = [
  "javascript",
  "react",
  "nodejs",
  "python",
  "html",
  "css",
  "typescript",
  "vue",
  "angular",
  "mongodb",
  "sql",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "api",
  "frontend",
  "backend",
  "fullstack",
  "responsive",
  "mobile",
  "web",
  "beginner",
  "advanced",
  "tutorial",
  "project",
  "hands-on",
  "practical",
  "theory",
  "certification",
]

export function CourseCreationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: "",
    price: "",
    discount: "",
    description: "",
    thumbnail: null,
    level: "",
    categories: [],
    tags: [],
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [imagePreview, setImagePreview] = useState<string>("")
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const formatPrice = (value: string): string => {
    const num = Number.parseFloat(value)
    if (isNaN(num)) return ""
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const calculateDiscountedPrice = (): string => {
    const price = Number.parseFloat(formData.price)
    const discount = Number.parseFloat(formData.discount)
    if (isNaN(price) || isNaN(discount)) return ""
    const discountedPrice = price * (1 - discount)
    return discountedPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const validateField = (name: keyof FormData, value: any): string | undefined => {
    switch (name) {
      case "title":
        if (!value.trim()) return "Course title is required"
        if (value.length > 100) return "Title must be 100 characters or less"
        break
      case "price":
        if (!value) return "Price is required"
        const price = Number.parseFloat(value)
        if (isNaN(price) || price < 0) return "Price must be a positive number"
        if (!/^\d+(\.\d{1,2})?$/.test(value)) return "Price must have at most 2 decimal places"
        break
      case "discount":
        if (value && value !== "") {
          const discount = Number.parseFloat(value)
          if (isNaN(discount) || discount < 0 || discount >= 1) {
            return "Discount must be between 0 and 0.99"
          }
          if (!/^\d*\.?\d{1,2}$/.test(value)) return "Discount must have at most 2 decimal places"
        }
        break
      case "description":
        if (!value.trim()) return "Course description is required"
        if (value.length < 100) return "Description must be at least 100 characters"
        if (value.length > 2000) return "Description must be 2000 characters or less"
        break
      case "thumbnail":
        if (!value) return "Course thumbnail is required"
        break
      case "level":
        if (!value) return "Course level is required"
        break
      case "categories":
        if (!value || value.length === 0) return "At least one category is required"
        break
      case "tags":
        if (!value || value.length === 0) return "At least one tag is required"
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

      // Real-time validation for price and discount
      if (name === "price" || name === "discount") {
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

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, thumbnail: "Image size must be less than 2MB" }))
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

  const insertFormatting = (format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.description.substring(start, end)
    let replacement = ""

    switch (format) {
      case "bold":
        replacement = `**${selectedText || "bold text"}**`
        break
      case "italic":
        replacement = `*${selectedText || "italic text"}*`
        break
      case "h1":
        replacement = `# ${selectedText || "Heading 1"}`
        break
      case "h2":
        replacement = `## ${selectedText || "Heading 2"}`
        break
      case "ul":
        replacement = `- ${selectedText || "List item"}`
        break
      case "ol":
        replacement = `1. ${selectedText || "List item"}`
        break
      case "link":
        replacement = `[${selectedText || "link text"}](url)`
        break
    }

    const newText = formData.description.substring(0, start) + replacement + formData.description.substring(end)
    handleInputChange("description", newText)

    // Focus back to textarea
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + replacement.length, start + replacement.length)
    }, 0)
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = formData.categories.includes(category)
      ? formData.categories.filter((c) => c !== category)
      : [...formData.categories, category]
    handleInputChange("categories", newCategories)
  }

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim().toLowerCase())) {
      handleInputChange("tags", [...formData.tags, tag.trim().toLowerCase()])
    }
    setTagInput("")
    setShowTagSuggestions(false)
  }

  const handleTagRemove = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    )
  }

  const getFilteredTagSuggestions = () => {
    if (!tagInput) return []
    return TAG_SUGGESTIONS.filter(
      (tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !formData.tags.includes(tag),
    ).slice(0, 5)
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
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Course created:", formData)
      setSubmitStatus("success")
      setIsDirty(false)

      // Reset form after success
      setTimeout(() => {
        setFormData({
          title: "",
          price: "",
          discount: "",
          description: "",
          thumbnail: null,
          level: "",
          categories: [],
          tags: [],
        })
        setImagePreview("")
        setSubmitStatus("idle")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 2000)
    } catch (error) {
      setSubmitStatus("error")
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
    setFormData({
      title: "",
      price: "",
      discount: "",
      description: "",
      thumbnail: null,
      level: "",
      categories: [],
      tags: [],
    })
    setImagePreview("")
    setErrors({})
    setIsDirty(false)
    setSubmitStatus("idle")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const discountValue = Number.parseFloat(formData.discount) || 0

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

              {/* Price and Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Price */}
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
                  <div className="relative">
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

                {/* Discount */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="discount" className="text-sm font-medium">
                      Discount (0.00 - 0.99)
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter discount as decimal (e.g., 0.20 for 20% off)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      max="0.99"
                      value={formData.discount}
                      onChange={(e) => handleInputChange("discount", e.target.value)}
                      placeholder="0.20"
                      className={`pl-10 ${errors.discount ? "border-red-500" : ""}`}
                    />
                  </div>
                  {formData.discount && !errors.discount && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Discount: {(discountValue * 100).toFixed(0)}%</span>
                        <span>Final Price: ${formData.price ? calculateDiscountedPrice() : "0.00"}</span>
                      </div>
                      <Progress value={discountValue * 100} className="h-2" />
                    </div>
                  )}
                  {errors.discount && <p className="text-xs text-red-500">{errors.discount}</p>}
                </div>
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
            </CardContent>
          </Card>

          {/* Categories and Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Categories & Tags</CardTitle>
              <CardDescription>
                Help students find your course by selecting relevant categories and tags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categories */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">
                    Categories <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select one or more categories that best describe your course</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className={`w-full justify-between ${errors.categories ? "border-red-500" : ""}`}
                    >
                      {formData.categories.length > 0
                        ? `${formData.categories.length} categories selected`
                        : "Select categories..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                          {CATEGORIES.map((category) => (
                            <CommandItem
                              key={category}
                              onSelect={() => handleCategoryToggle(category)}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={formData.categories.includes(category)}
                                onChange={() => handleCategoryToggle(category)}
                              />
                              <span>{category}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="flex items-center gap-1">
                        {category}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryToggle(category)} />
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.categories && <p className="text-xs text-red-500">{errors.categories}</p>}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">
                    Tags <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add relevant keywords to help students discover your course</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Tags className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value)
                      setShowTagSuggestions(e.target.value.length > 0)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleTagAdd(tagInput)
                      }
                    }}
                    placeholder="Type a tag and press Enter"
                    className={`pl-10 ${errors.tags ? "border-red-500" : ""}`}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6"
                    onClick={() => handleTagAdd(tagInput)}
                    disabled={!tagInput.trim()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Tag Suggestions */}
                {showTagSuggestions && getFilteredTagSuggestions().length > 0 && (
                  <div className="border rounded-md p-2 bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {getFilteredTagSuggestions().map((suggestion) => (
                        <Button
                          key={suggestion}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => handleTagAdd(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleTagRemove(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.tags && <p className="text-xs text-red-500">{errors.tags}</p>}
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
              {/* Rich Text Toolbar */}
              <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/50">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("bold")}
                  className="h-8 w-8 p-0"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("italic")}
                  className="h-8 w-8 p-0"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("h1")}
                  className="h-8 w-8 p-0"
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("h2")}
                  className="h-8 w-8 p-0"
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("ul")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("ol")}
                  className="h-8 w-8 p-0"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting("link")}
                  className="h-8 w-8 p-0"
                >
                  <Link className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  ref={textareaRef}
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what students will learn in this course. Use Markdown formatting for better presentation.

Example:
# What You'll Learn
- Master React fundamentals
- Build real-world projects
- **Advanced concepts** like hooks and context

## Prerequisites
- Basic JavaScript knowledge
- HTML/CSS understanding"
                  className={`min-h-[200px] font-mono text-sm ${errors.description ? "border-red-500" : ""}`}
                  maxLength={2000}
                />
                <div className="flex justify-between text-xs">
                  <span className={errors.description ? "text-red-500" : "text-muted-foreground"}>
                    {errors.description || "Minimum 100 characters required"}
                  </span>
                  <span
                    className={`${formData.description.length > 1800 ? "text-orange-500" : "text-muted-foreground"}`}
                  >
                    {formData.description.length}/2000
                  </span>
                </div>
              </div>

              {/* Markdown Preview */}
              {formData.description && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </Label>
                  <div className="p-4 border rounded-lg bg-muted/20 prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{formData.description}</div>
                  </div>
                </div>
              )}
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
                  <span className="text-sm text-muted-foreground">JPEG, PNG, GIF, WebP (max 2MB)</span>
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
                      src={imagePreview || "/placeholder.svg"}
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
                    Course created successfully! The form has been reset for your next course.
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === "error" && (
                <Alert className="mb-4 border-red-500 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Please fix the errors above before submitting the form.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none md:min-w-[200px]">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating Course...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Course
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
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
