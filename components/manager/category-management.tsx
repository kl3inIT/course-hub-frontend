'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { categoryApi } from '@/services/category-api'
import {
  CategoryRequestDTO,
  CategoryResponseDTO,
  CategorySearchParams,
} from '@/types/category'
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Tags,
  Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export function CategoryManagement() {
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [allCategories, setAllCategories] = useState<CategoryResponseDTO[]>([])
  const [filteredCategories, setFilteredCategories] = useState<CategoryResponseDTO[]>([])
  const [totalCourses, setTotalCourses] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('') // input field value
  const [currentPage, setCurrentPage] = useState(0)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryResponseDTO | null>(null)
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoryResponseDTO | null>(null)
  const [newCategory, setNewCategory] = useState<CategoryRequestDTO>({
    name: '',
    description: '',
  })
  const [nameError, setNameError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [descriptionTouched, setDescriptionTouched] = useState(false)
  const [editNameError, setEditNameError] = useState('')
  const [editDescriptionError, setEditDescriptionError] = useState('')
  const [editNameTouched, setEditNameTouched] = useState(false)
  const [editDescriptionTouched, setEditDescriptionTouched] = useState(false)

  const router = useRouter()

  // Pagination constants
  const ITEMS_PER_PAGE = 6

  // Calculate pagination data
  const paginationData = useMemo(() => {
    const totalItems = filteredCategories.length
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    const startIndex = currentPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentItems = filteredCategories.slice(startIndex, endIndex)

    return {
      totalItems,
      totalPages,
      currentItems,
      hasNext: currentPage < totalPages - 1,
      hasPrev: currentPage > 0,
      startItem: startIndex + 1,
      endItem: Math.min(endIndex, totalItems),
    }
  }, [filteredCategories, currentPage])

  // Fetch all categories without pagination
  const fetchCategories = async (searchName?: string) => {
    try {
      setLoading(true)
      const params: CategorySearchParams = {
        size: 1000, // Fetch all categories
        name: searchName,
      }
      
      console.log('Fetching all categories with params:', params)
      
      const response = await categoryApi.getAllCategories(params)
      
      console.log('API Response:', response)
      
      const categoriesData = (response.data.content || response.data).map((c: any) => ({
        ...c,
        id: c.id?.toString(),
      }))
      setAllCategories(categoriesData)
      setFilteredCategories(categoriesData)
      setCategories(categoriesData)
      
      // Calculate total courses
      const totalCoursesCount = categoriesData.reduce(
        (sum: number, c: CategoryResponseDTO) => sum + c.courseCount,
        0
      )
      setTotalCourses(totalCoursesCount)
      
      // Reset to first page when data changes
      setCurrentPage(0)
      
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Error', {
        description: 'Failed to load categories. Please try again.',
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
    if (searchTerm.trim()) {
      const filtered = allCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(allCategories)
    }
    setCurrentPage(0)
  }, [searchTerm, allCategories])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleCreateCategory = async () => {
    let hasError = false
    if (!newCategory.name.trim()) {
      setNameError('Please enter a category name')
      hasError = true
    } else if (newCategory.name.length > 30) {
      setNameError('Category name must not exceed 30 characters')
      hasError = true
    } else {
      setNameError('')
    }
    if (!newCategory.description.trim()) {
      setDescriptionError('Please enter a category description')
      hasError = true
    } else if (newCategory.description.length > 200) {
      setDescriptionError('Description must not exceed 200 characters')
      hasError = true
    } else {
      setDescriptionError('')
    }
    if (hasError) return
    try {
      await categoryApi.createCategory(newCategory)
      setNewCategory({ name: '', description: '' })
      setIsCreateDialogOpen(false)
      setNameError('')
      setDescriptionError('')
      toast.success('Category created successfully', {
        description: `Category "${newCategory.name}" has been created successfully.`,
        icon: <CheckCircle className='h-5 w-5 text-green-500' />,
      })
      fetchCategories(searchTerm || undefined)
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to create category. Please try again.',
      })
    }
  }

  const handleEditCategory = async () => {
    let hasError = false
    if (!newCategory.name.trim()) {
      setEditNameError('Please enter a category name')
      hasError = true
    } else if (newCategory.name.length > 30) {
      setEditNameError('Category name must not exceed 30 characters')
      hasError = true
    } else {
      setEditNameError('')
    }
    if (!newCategory.description.trim()) {
      setEditDescriptionError('Please enter a category description')
      hasError = true
    } else if (newCategory.description.length > 200) {
      setEditDescriptionError('Description must not exceed 200 characters')
      hasError = true
    } else {
      setEditDescriptionError('')
    }
    if (hasError) return
    if (!selectedCategory) return
    try {
      await categoryApi.updateCategory(
        Number(selectedCategory.id),
        newCategory
      )
      setNewCategory({ name: '', description: '' })
      setSelectedCategory(null)
      setIsEditDialogOpen(false)
      setEditNameError('')
      setEditDescriptionError('')
      setEditNameTouched(false)
      setEditDescriptionTouched(false)
      toast.success('Category updated successfully', {
        description: `Category "${selectedCategory.name}" has been updated successfully.`,
        icon: <CheckCircle className='h-5 w-5 text-green-500' />,
      })
      fetchCategories(searchTerm || undefined)
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update category. Please try again.',
      })
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    if (categoryToDelete.courseCount > 0) {
      toast.error('Cannot delete category', {
        description: `Category "${categoryToDelete.name}" has ${categoryToDelete.courseCount} course(s). Please remove or reassign courses first.`,
      })
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
      return
    }
    try {
      await categoryApi.deleteCategory(categoryToDelete.id.toString())
      toast.success('Category deleted successfully', {
        icon: <CheckCircle className='h-5 w-5 text-green-500' />,
        description: `Category "${categoryToDelete.name}" has been deleted successfully.`,
      })
      fetchCategories(searchTerm || undefined)
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } catch (error: any) {
      console.error('Delete category error:', error)
      let errorMessage = 'Failed to delete category. Please try again.'
      if (
        error.message?.includes('being used by courses') ||
        error.message?.includes('CategoryInUseException')
      ) {
        errorMessage = `Cannot delete "${categoryToDelete.name}" because it is still being used by courses. Please remove or reassign courses first.`
      } else if (error.message?.includes('not found')) {
        errorMessage = `Category "${categoryToDelete.name}" not found. It may have been deleted already.`
      }
      toast.error('Delete failed', { description: errorMessage })
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
    setEditNameError('')
    setEditDescriptionError('')
    setEditNameTouched(false)
    setEditDescriptionTouched(false)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (category: CategoryResponseDTO) => {
    setCategoryToDelete(category)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getCategoryStats = () => {
    const total = allCategories.length
    return { total, totalCourses }
  }

  const stats = getCategoryStats()

  return (
    <div className='space-y-6 min-h-screen'>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Category Management</h1>
          <p className='text-muted-foreground mt-2'>
            Organize and manage course categories for better navigation and
            discovery.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => fetchCategories()}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button
            className='gap-2'
            onClick={() => router.push('/manager/categories/add')}
          >
            <Plus className='h-4 w-4' />
            Add category
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 grid-cols-2'>
        <Card className='w-full'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Categories
            </CardTitle>
            <Tags className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
          </CardContent>
        </Card>
        <Card className='w-full'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Courses</CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalCourses}</div>
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
          <div className='flex items-center mb-6 gap-4'>
            <div className='flex flex-col flex-1 max-w-sm'>
              <div className='relative flex items-center'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none' />
                <Input
                  placeholder='Search categories...'
                  value={searchInput}
                  maxLength={100}
                  onChange={e => {
                    if (e.target.value.length <= 100) {
                      setSearchInput(e.target.value)
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setSearchTerm(searchInput)
                    }
                  }}
                  className='pl-10 pr-4 h-10'
                />
                <button
                  type='button'
                  onClick={() => setSearchTerm(searchInput)}
                  className='ml-2 flex items-center justify-center h-10 w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors'
                  tabIndex={0}
                >
                  <Search className='h-5 w-5' />
                </button>
              </div>
              <span className='text-xs text-muted-foreground text-right mt-1'>{searchInput.length}/100</span>
            </div>
            <div className='text-sm text-muted-foreground'>
              {searchTerm ? `${filteredCategories.length} of ${allCategories.length} categories` : `${filteredCategories.length} categories total`}
            </div>
          </div>

          {/* Categories Table */}
          <Table className='table-fixed w-full'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[22%] truncate'>Name</TableHead>
                <TableHead className='w-[33%] truncate'>Description</TableHead>
                <TableHead className='w-[12%] text-center'>Courses</TableHead>
                <TableHead className='w-[13%] text-center'>Created</TableHead>
                <TableHead className='w-[10%] text-center'>
                  Last Updated
                </TableHead>
                <TableHead className='w-[10%] text-center'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='min-h-[300px]'>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className='text-center py-8'>
                    <RefreshCw className='h-4 w-4 animate-spin mx-auto mb-2' />
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : paginationData.currentItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='text-center py-8 text-muted-foreground'
                  >
                    {searchTerm
                      ? 'No categories found matching your search.'
                      : 'No categories available.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginationData.currentItems.map(category => (
                  <TableRow
                    key={category.id}
                    className='cursor-pointer hover:bg-gray-50 transition group'
                    onClick={() => {
                      toast.success('Redirecting to courses', {
                        description: `Showing courses in "${category.name}" category`,
                      })
                      router.push(
                        `/manager/courses?category=${encodeURIComponent(category.name)}`
                      )
                    }}
                  >
                    <TableCell className='font-medium w-[22%] truncate'>
                      {category.name}
                      {category.courseCount > 0 && (
                        <Badge variant='outline' className='ml-2 text-xs'>
                          In Use
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='w-[33%] truncate'>
                      {category.description}
                    </TableCell>
                    <TableCell className='w-[12%] text-center'>
                      <Badge
                        className={
                          category.courseCount > 0
                            ? 'bg-blue-50 text-blue-500 border border-blue-200 font-semibold group-hover:text-blue-400'
                            : 'bg-gray-50 text-gray-500 border border-gray-200 font-semibold group-hover:text-gray-400'
                        }
                      >
                        {category.courseCount} courses
                      </Badge>
                    </TableCell>
                    <TableCell className='w-[13%] text-center'>
                      {formatDate(category.createdDate)}
                    </TableCell>
                    <TableCell className='w-[10%] text-center'>
                      {formatDate(category.modifiedDate)}
                    </TableCell>
                    <TableCell className='w-[10%] text-center'>
                      <div className='flex gap-2 justify-center'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/manager/categories/${category.id}/edit`);
                          }}
                          title='Edit'
                          className='hover:bg-blue-100 hover:text-blue-600'
                        >
                          <Edit className='h-5 w-5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={e => {
                            e.stopPropagation()
                            e.preventDefault()
                            openDeleteDialog(category)
                          }}
                          title='Delete'
                          disabled={category.courseCount > 0}
                          className={`${
                            category.courseCount > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'hover:bg-red-100 hover:text-red-600 text-red-600'
                          }`}
                        >
                          <Trash2 className='h-5 w-5' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {paginationData.totalItems > 0 && (
            <div className='flex items-center justify-between mt-6'>
              <p className='text-sm text-muted-foreground'>
                Showing {paginationData.startItem} to {paginationData.endItem} of {paginationData.totalItems} categories
              </p>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationData.hasPrev || loading}
                >
                  <ChevronLeft className='h-4 w-4' />
                  Previous
                </Button>
                <span className='text-sm'>
                  Page {currentPage + 1} of {Math.max(1, paginationData.totalPages)}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationData.hasNext || loading}
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className='space-y-2'>
              This action cannot be undone. This will permanently delete the
              category
              <span
                className='inline-block max-w-[250px] align-middle ml-1 truncate'
                title={categoryToDelete?.name}
              >
                "{categoryToDelete?.name}"
              </span>
              .
              {categoryToDelete && categoryToDelete.courseCount > 0 && (
                <div className='bg-red-50 border border-red-200 rounded-md p-3 mt-3'>
                  <p className='text-red-800 font-medium'>
                    ⚠️ Warning: This category has {categoryToDelete.courseCount}{' '}
                    course(s).
                  </p>
                  <p className='text-red-600 text-sm mt-1'>
                    You cannot delete this category until all courses are
                    removed or reassigned to other categories.
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
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                handleDeleteCategory()
              }}
              className={`${
                !!categoryToDelete && categoryToDelete.courseCount > 0
                  ? 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={!!categoryToDelete && categoryToDelete.courseCount > 0}
            >
              {categoryToDelete && categoryToDelete.courseCount > 0
                ? 'Cannot Delete'
                : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}