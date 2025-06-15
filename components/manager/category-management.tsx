'use client'

import { categoryApi } from '@/api/category-api'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  CategoryRequestDTO,
  CategoryResponseDTO,
  CategorySearchParams,
} from '@/types/category'
import { Page } from '@/types/common'
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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function CategoryManagement() {
  const [categories, setCategories] = useState<CategoryResponseDTO[]>([])
  const [pagination, setPagination] = useState<Page<CategoryResponseDTO>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 6,
    number: 0,
  })
  const [totalCourses, setTotalCourses] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
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

  // Fetch total courses count
  const fetchTotalCourses = async () => {
    try {
      const response = await categoryApi.getAllCategories({ size: 100 }) // Giảm size xuống để tránh quá tải
      const totalCoursesCount = response.data.content.reduce(
        (sum, c) => sum + c.courseCount,
        0
      )
      setTotalCourses(totalCoursesCount)
    } catch (error: any) {
      console.error('Failed to fetch total courses:', error)
      toast.error('Lỗi', {
        description: `Không thể tải dữ liệu: ${error.message || 'Lỗi không xác định'}`,
      })
    }
  }

  // Fetch categories from API
  const fetchCategories = async (
    page: number = 0,
    size: number = 6,
    searchName?: string
  ) => {
    try {
      setLoading(true)
      const params: CategorySearchParams = {
        page,
        size,
        name: searchName,
      }
      const response = await categoryApi.getAllCategories(params)

      setCategories(response.data.content)
      setPagination(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Error', {
        description: 'Failed to fetch categories. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchCategories()
    fetchTotalCourses()
  }, [])

  // Handle search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchCategories(0, pagination.size, searchTerm || undefined)
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  const handlePageChange = (newPage: number) => {
    fetchCategories(newPage, pagination.size, searchTerm || undefined)
  }

  const handleCreateCategory = async () => {
    let hasError = false
    if (!newCategory.name.trim()) {
      setNameError('Please enter a category name')
      hasError = true
    } else {
      setNameError('')
    }
    if (!newCategory.description.trim()) {
      setDescriptionError('Please enter a category description')
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
      toast.success('Category created successfully.', {
        description: `Category ${newCategory.name} has been created successfully.`,
        icon: <CheckCircle className='h-5 w-5 text-green-500' />,
      })
      fetchCategories(
        pagination.number,
        pagination.size,
        searchTerm || undefined
      )
      fetchTotalCourses() // Cập nhật tổng số khóa học
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to create category. Please try again.',
      })
    }
  }

  const handleEditCategory = async () => {
    let hasError = false
    if (!newCategory.name.trim()) {
      setEditNameError('Please enter category name')
      hasError = true
    } else {
      setEditNameError('')
    }
    if (!newCategory.description.trim()) {
      setEditDescriptionError('Please enter category description')
      hasError = true
    } else {
      setEditDescriptionError('')
    }
    if (hasError) return
    if (!selectedCategory) return
    try {
      await categoryApi.updateCategory(
        selectedCategory.id.toString(),
        newCategory
      )
      setNewCategory({ name: '', description: '' })
      setSelectedCategory(null)
      setIsEditDialogOpen(false)
      setEditNameError('')
      setEditDescriptionError('')
      setEditNameTouched(false)
      setEditDescriptionTouched(false)
      toast.success(`Category ${selectedCategory.name} has been updated successfully!`, {
        description: `Category ${selectedCategory.name} has been updated successfully!`,
        icon: <CheckCircle className='h-5 w-5 text-green-500' />,
      })
      fetchCategories(
        pagination.number,
        pagination.size,
        searchTerm || undefined
      )
      fetchTotalCourses()
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update category. Please try again.',
      })
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    if (categoryToDelete.courseCount > 0) {
      toast.error('❌ Không thể xoá danh mục', {
        description: `Danh mục "${categoryToDelete.name}" đang có ${categoryToDelete.courseCount} khoá học. Hãy chuyển hoặc xoá các khoá học trước!`,
      })
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
      return
    }
    try {
      await categoryApi.deleteCategory(categoryToDelete.id.toString())
      toast.success('Category deleted', {
        icon: <CheckCircle className='h-5 w-5 text-green-500' />,
        description: (
          <span>
            Category&nbsp;
            <span
              className='inline-block max-w-[200px] align-middle truncate'
              title={categoryToDelete.name}
              style={{ verticalAlign: 'middle' }}
            >
              "{categoryToDelete.name}"
            </span>
            &nbsp;has been deleted successfully!
          </span>
        ),
      })
      fetchCategories(
        pagination.number,
        pagination.size,
        searchTerm || undefined
      )
      fetchTotalCourses()
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } catch (error: any) {
      console.error('Delete category error:', error)
      let errorMessage = 'Không thể xoá danh mục. Vui lòng thử lại.'
      if (
        error.message?.includes('being used by courses') ||
        error.message?.includes('CategoryInUseException')
      ) {
        errorMessage = `Không thể xoá "${categoryToDelete.name}" vì vẫn còn khoá học sử dụng. Hãy chuyển hoặc xoá các khoá học trước!`
      } else if (error.message?.includes('not found')) {
        errorMessage = `Danh mục "${categoryToDelete.name}" không tồn tại. Có thể đã bị xoá trước đó.`
      }
      toast.error('❌ Xoá thất bại', { description: errorMessage })
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
    const total = pagination.totalElements
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
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={open => {
              setIsCreateDialogOpen(open)
              if (open) {
                setNewCategory({ name: '', description: '' })
                setNameError('')
                setDescriptionError('')
                setNameTouched(false)
                setDescriptionTouched(false)
              } else {
                setNameError('')
                setDescriptionError('')
                setNewCategory({ name: '', description: '' })
                setNameTouched(false)
                setDescriptionTouched(false)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className='gap-2'>
                <Plus className='h-4 w-4' />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent key={isCreateDialogOpen ? 'add-category-open' : 'add-category-closed'}>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize your courses better.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='category-name'>Category Name</Label>
                  <Input
                    id='category-name'
                    placeholder='Enter category name'
                    value={newCategory.name}
                    onChange={e => {
                      setNewCategory({ ...newCategory, name: e.target.value })
                      if (e.target.value.trim()) setNameError('')
                    }}
                    onBlur={() => {
                      setNameTouched(true)
                      if (!newCategory.name.trim())
                        setNameError('Please enter a category name')
                    }}
                  />
                  {nameTouched && nameError && (
                    <p className='text-red-500 text-xs mt-1'>{nameError}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='category-description'>Description</Label>
                  <Textarea
                    id='category-description'
                    placeholder='Enter category description'
                    value={newCategory.description}
                    onChange={e => {
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                      if (e.target.value.trim()) setDescriptionError('')
                    }}
                    onBlur={() => {
                      setDescriptionTouched(true)
                      if (!newCategory.description.trim())
                        setDescriptionError(
                          'Please enter a category description'
                        )
                    }}
                    rows={3}
                  />
                  {descriptionTouched && descriptionError && (
                    <p className='text-red-500 text-xs mt-1'>
                      {descriptionError}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCategory}
                  disabled={
                    !newCategory.name.trim() || !newCategory.description.trim()
                  }
                >
                  Create Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
          <div className='flex items-center gap-4 mb-6'>
            <div className='relative flex-1 max-w-sm'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Search categories...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
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
              ) : categories.length === 0 ? (
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
                categories.map(category => (
                  <TableRow
                    key={category.id}
                    className='cursor-pointer hover:bg-gray-50 transition group'
                    onClick={() =>
                      router.push(
                        `/manager/courses?category=${encodeURIComponent(category.name)}`
                      )
                    }
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
                            e.stopPropagation()
                            openEditDialog(category)
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
          {pagination.totalPages >= 1 && (
            <div className='flex items-center justify-between mt-6'>
              <p className='text-sm text-muted-foreground'>
                Showing {pagination.number * pagination.size + 1} to{' '}
                {Math.min(
                  (pagination.number + 1) * pagination.size,
                  pagination.totalElements
                )}{' '}
                of {pagination.totalElements} categories
              </p>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(pagination.number - 1)}
                  disabled={pagination.number === 0}
                >
                  <ChevronLeft className='h-4 w-4' />
                  Previous
                </Button>
                <span className='text-sm'>
                  Page {pagination.number + 1} of {pagination.totalPages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(pagination.number + 1)}
                  disabled={pagination.number === pagination.totalPages - 1}
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={open => {
          setIsEditDialogOpen(open)
          if (!open) {
            // Khi dialog đóng, reset newCategory và các lỗi/touched state
            setNewCategory({ name: '', description: '' })
            setSelectedCategory(null) // Đảm bảo selectedCategory cũng được reset
            setEditNameError('')
            setEditDescriptionError('')
            setEditNameTouched(false)
            setEditDescriptionTouched(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-category-name'>Category Name</Label>
              <Input
                id='edit-category-name'
                placeholder='Enter category name'
                value={newCategory.name}
                onChange={e => {
                  setNewCategory({ ...newCategory, name: e.target.value })
                  if (e.target.value.trim()) setEditNameError('')
                }}
                onBlur={() => {
                  setEditNameTouched(true)
                  if (!newCategory.name.trim())
                    setEditNameError('Please enter category name')
                }}
              />
              {editNameTouched && editNameError && (
                <p className='text-red-500 text-xs mt-1'>{editNameError}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-category-description'>Description</Label>
              <Textarea
                id='edit-category-description'
                placeholder='Enter category description'
                value={newCategory.description}
                onChange={e => {
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                  if (e.target.value.trim()) setEditDescriptionError('')
                }}
                onBlur={() => {
                  setEditDescriptionTouched(true)
                  if (!newCategory.description.trim())
                    setEditDescriptionError('Please enter category description')
                }}
                rows={3}
              />
              {editDescriptionTouched && editDescriptionError && (
                <p className='text-red-500 text-xs mt-1'>
                  {editDescriptionError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsEditDialogOpen(false)
                setSelectedCategory(null)
                setNewCategory({ name: '', description: '' })
                setEditNameError('')
                setEditDescriptionError('')
                setEditNameTouched(false)
                setEditDescriptionTouched(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditCategory}
              disabled={
                !newCategory.name.trim() || !newCategory.description.trim()
              }
            >
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              onClick={(e) => {
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
