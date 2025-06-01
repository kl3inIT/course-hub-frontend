"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Edit, Trash2, Tags, BookOpen, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { categoryAPI, PaginatedResponse, CategoryFilters, PaginationParams, CategoryResponseDTO, CategoryRequestDTO } from "@/api/category"

export function CategoryManagement() {
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    size: 6,
    number: 0,
    first: true,
    last: true,
  })
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponseDTO | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryResponseDTO | null>(null)
  const [newCategory, setNewCategory] = useState<CategoryRequestDTO>({
    name: "",
    description: "",
  })
  const [nameError, setNameError] = useState("")
  const [descriptionError, setDescriptionError] = useState("")
  const [nameTouched, setNameTouched] = useState(false)
  const [descriptionTouched, setDescriptionTouched] = useState(false)

  // Fetch categories from API
  const fetchCategories = async (paginationParams: PaginationParams = {}, filters: CategoryFilters = {}) => {
    try {
      setLoading(true)
      const response = await categoryAPI.getAllCategories(paginationParams, filters)
      
      setCategories(response.data.content)
      setPagination({
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        size: response.data.size,
        number: response.data.number,
        first: response.data.first,
        last: response.data.last,
      })
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast({
        title: "Error",
        description: "Failed to fetch categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchCategories()
  }, [])

  // Handle search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchCategories(
        { page: 0, size: pagination.size },
        { name: searchTerm || undefined }
      )
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  const handlePageChange = (newPage: number) => {
    fetchCategories(
      { page: newPage, size: pagination.size },
      { name: searchTerm || undefined }
    )
  }

  const handleCreateCategory = async () => {
    let hasError = false
    if (!newCategory.name.trim()) {
      setNameError("Please enter a category name")
      hasError = true
    } else {
      setNameError("")
    }
    if (!newCategory.description.trim()) {
      setDescriptionError("Please enter a category description")
      hasError = true
    } else {
      setDescriptionError("")
    }
    if (hasError) return
    try {
      await categoryAPI.createCategory(newCategory)
      setNewCategory({ name: "", description: "" })
      setIsCreateDialogOpen(false)
      setNameError("")
      setDescriptionError("")
      toast({
        title: "Success",
        description: `Category ${newCategory.name} has been created successfully.`,
      })
      fetchCategories(
        { page: pagination.number, size: pagination.size },
        { name: searchTerm || undefined }
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = async () => {
    if (!selectedCategory || !newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    try {
      await categoryAPI.updateCategory(selectedCategory.id, newCategory)
      setNewCategory({ name: "", description: "" })
      setSelectedCategory(null)
      setIsEditDialogOpen(false)
      
      toast({
        title: "Category Updated",
        description: `Category has been updated successfully.`,
      })

      // Refresh the list
      fetchCategories(
        { page: pagination.number, size: pagination.size },
        { name: searchTerm || undefined }
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    if (categoryToDelete.courseCount > 0) {
      toast({
        title: "❌ Cannot Delete Category",
        description: `Category "${categoryToDelete.name}" has ${categoryToDelete.courseCount} course(s). Please reassign or remove courses first.`,
        variant: "destructive",
      })
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
      return
    }

    try {
      await categoryAPI.deleteCategory(categoryToDelete.id)
      
      toast({
        title: "✅ Category Deleted",
        description: `${categoryToDelete.name} has been deleted successfully.`,
      })
      
      // Refresh the list
      fetchCategories(
        { page: pagination.number, size: pagination.size },
        { name: searchTerm || undefined }
      )
    } catch (error: any) {
      console.error('Delete category error:', error)
      
      let errorMessage = "Failed to delete category. Please try again."
      
      if (error.message?.includes("being used by courses") || 
          error.message?.includes("CategoryInUseException")) {
        errorMessage = `Cannot delete "${categoryToDelete.name}" because it is still being used by courses. Please remove or reassign the courses first.`
      } else if (error.message?.includes("not found")) {
        errorMessage = `Category "${categoryToDelete.name}" not found. It may have been already deleted.`
      }
      
      toast({
        title: "❌ Delete Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const openEditDialog = (category: CategoryResponseDTO) => {
    setSelectedCategory(category)
    setNewCategory({
      name: category.name,
      description: category.description,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (category: CategoryResponseDTO) => {
    setCategoryToDelete(category)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getCategoryStats = () => {
    const total = pagination.totalElements
    const totalCourses = categories.reduce((sum, c) => sum + c.courseCount, 0)
    
    return { total, totalCourses }
  }

  const stats = getCategoryStats()

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground mt-2">
            Organize and manage course categories for better navigation and discovery.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchCategories()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open)
            if (open) {
              setNameError("")
              setDescriptionError("")
              setNameTouched(false)
              setDescriptionTouched(false)
            } else {
              setNameError("")
              setDescriptionError("")
              setNewCategory({ name: "", description: "" })
              setNameTouched(false)
              setDescriptionTouched(false)
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize your courses better.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    placeholder="Enter category name"
                    value={newCategory.name}
                    onChange={(e) => {
                      setNewCategory({ ...newCategory, name: e.target.value })
                      if (e.target.value.trim()) setNameError("")
                    }}
                    onBlur={() => {
                      setNameTouched(true)
                      if (!newCategory.name.trim()) setNameError("Please enter a category name")
                    }}
                  />
                  {nameTouched && nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea
                    id="category-description"
                    placeholder="Enter category description"
                    value={newCategory.description}
                    onChange={(e) => {
                      setNewCategory({ ...newCategory, description: e.target.value })
                      if (e.target.value.trim()) setDescriptionError("")
                    }}
                    onBlur={() => {
                      setDescriptionTouched(true)
                      if (!newCategory.description.trim()) setDescriptionError("Please enter a category description")
                    }}
                    rows={3}
                  />
                  {descriptionTouched && descriptionError && <p className="text-red-500 text-xs mt-1">{descriptionError}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCategory} disabled={!newCategory.name.trim() || !newCategory.description.trim()}>
                  Create Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage all categories used to organize your courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No categories found matching your search." : "No categories available."}
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                      {category.courseCount > 0 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          In Use
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={category.courseCount > 0 ? "default" : "secondary"}
                        className={category.courseCount > 0 ? "bg-blue-100 text-blue-800" : ""}
                      >
                        {category.courseCount} courses
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(category.createdDate)}</TableCell>
                    <TableCell>{formatDate(category.modifiedDate)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(category)}
                            className={
                              category.courseCount > 0 
                                ? "text-gray-400 cursor-not-allowed" 
                                : "text-red-600 focus:text-red-600"
                            }
                            disabled={category.courseCount > 0}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {category.courseCount > 0 ? "Cannot Delete" : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {pagination.number * pagination.size + 1} to{" "}
                {Math.min((pagination.number + 1) * pagination.size, pagination.totalElements)} of{" "}
                {pagination.totalElements} categories
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.number - 1)}
                  disabled={pagination.first}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.number + 1} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.number + 1)}
                  disabled={pagination.last}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Category Name</Label>
              <Input
                id="edit-category-name"
                placeholder="Enter category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-description">Description</Label>
              <Textarea
                id="edit-category-description"
                placeholder="Enter category description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedCategory(null)
                setNewCategory({ name: "", description: "" })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This action cannot be undone. This will permanently delete the category "{categoryToDelete?.name}".</p>
              
              {categoryToDelete && categoryToDelete.courseCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                  <p className="text-red-800 font-medium">
                    ⚠️ Warning: This category has {categoryToDelete.courseCount} course(s).
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    You cannot delete this category until all courses are removed or reassigned to other categories.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setCategoryToDelete(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className={`${
                !!categoryToDelete && categoryToDelete.courseCount > 0 
                  ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
              disabled={!!categoryToDelete && categoryToDelete.courseCount > 0}
            >
              {categoryToDelete && categoryToDelete.courseCount > 0 ? "Cannot Delete" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 