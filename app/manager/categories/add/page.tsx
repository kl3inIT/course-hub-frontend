'use client'

import { RoleGuard } from '@/components/auth/role-guard'
import { ManagerSidebar } from '@/components/layout/manager-sidebar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Textarea } from '@/components/ui/textarea'
import { categoryApi } from '@/services/category-api'
import { CategoryRequestDTO, CategoryResponseDTO } from '@/types/category'
import { BookOpen, CheckCircle, Tags } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function AddCategoryPage() {
  const [newCategory, setNewCategory] = useState<CategoryRequestDTO>({
    name: '',
    description: '',
  })
  const [nameError, setNameError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [descriptionTouched, setDescriptionTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [allCategories, setAllCategories] = useState<CategoryResponseDTO[]>([])
  const [totalCourses, setTotalCourses] = useState(0)
  const router = useRouter()

  useEffect(() => {
    categoryApi
      .getAllCategories({ size: 1000 })
      .then(res => {
        const categories = res.data.content || res.data
        setAllCategories(categories)
        setTotalCourses(
          categories.reduce(
            (sum: number, c: CategoryResponseDTO) => sum + (c.courseCount || 0),
            0
          )
        )
      })
      .catch(() => setAllCategories([]))
  }, [])

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
    setLoading(true)
    try {
      await categoryApi.createCategory(newCategory)
      toast.success('Category created successfully', {
        description: `Category "${newCategory.name}" has been created successfully!`,
        icon: <CheckCircle className='h-5 w-5 text-green-500' />,
      })
      router.push('/manager/categories')
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to create category. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <RoleGuard allowedRoles={['manager', 'admin']}>
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className='space-y-6 min-h-screen'>
            {/* Header Section + Statistics giống manage */}
            <div className='flex items-center justify-between px-6 pt-6'>
              <div>
                <h1 className='text-3xl font-bold'>Category Management</h1>
                <p className='text-muted-foreground mt-2'>
                  Organize and manage course categories for better navigation and discovery.
                </p>
              </div>
            </div>
            <div className='grid gap-4 grid-cols-2 px-6'>
              <Card className='w-full'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Total Categories</CardTitle>
                  <Tags className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{allCategories.length}</div>
                </CardContent>
              </Card>
              <Card className='w-full'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Total Courses</CardTitle>
                  <BookOpen className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{totalCourses}</div>
                </CardContent>
              </Card>
              {/* Form Add Category */}
              <Card className='w-full col-span-2 mt-2'>
                <CardHeader className='pb-2'>
                  <div className='flex flex-col gap-1'>
                    <h2 className='text-xl font-bold'>Add Category</h2>
                    <CardDescription>Manage all categories used to organize your courses.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='w-full max-w-lg mx-auto space-y-6'>
                    <form className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='category-name'>Category Name</Label>
                        <Input
                          id='category-name'
                          placeholder='Enter category name'
                          value={newCategory.name}
                          maxLength={30}
                          onChange={e => {
                            setNewCategory({
                              ...newCategory,
                              name: e.target.value,
                            })
                            if (e.target.value.length > 30) {
                              setNameError('Category name must not exceed 30 characters')
                            } else if (!e.target.value.trim()) {
                              setNameError('Please enter a category name')
                            } else {
                              setNameError('')
                            }
                          }}
                          onBlur={() => {
                            setNameTouched(true)
                            if (!newCategory.name.trim()) setNameError('Please enter a category name')
                          }}
                        />
                        <p className='text-xs text-muted-foreground text-right'>{newCategory.name.length}/30</p>
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
                          maxLength={200}
                          onChange={e => {
                            setNewCategory({
                              ...newCategory,
                              description: e.target.value,
                            })
                            if (e.target.value.length > 200) {
                              setDescriptionError('Description must not exceed 200 characters')
                            } else if (!e.target.value.trim()) {
                              setDescriptionError('Please enter a category description')
                            } else {
                              setDescriptionError('')
                            }
                          }}
                          onBlur={() => {
                            setDescriptionTouched(true)
                            if (!newCategory.description.trim()) setDescriptionError('Please enter a category description')
                          }}
                          rows={3}
                        />
                        <p className='text-xs text-muted-foreground text-right'>{newCategory.description.length}/200</p>
                        {descriptionTouched && descriptionError && (
                          <p className='text-red-500 text-xs mt-1'>{descriptionError}</p>
                        )}
                      </div>
                      <div className='flex justify-end gap-2 mt-6'>
                        <Button
                          variant='outline'
                          type='button'
                          onClick={() => router.back()}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type='button'
                          onClick={handleCreateCategory}
                          disabled={!newCategory.name.trim() || !newCategory.description.trim() || loading}
                        >
                          {loading ? 'Creating...' : 'Create Category'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
