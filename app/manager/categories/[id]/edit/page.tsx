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
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const idRaw = params?.id as string
  const id = Number(idRaw)
  if (!id || isNaN(id) || id <= 0) {
    toast.error('Invalid category id')
    router.push('/manager/categories')
    return null
  }
  const [category, setCategory] = useState<CategoryResponseDTO | null>(null)
  const [form, setForm] = useState<CategoryRequestDTO>({
    name: '',
    description: '',
  })
  const [nameError, setNameError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [descriptionTouched, setDescriptionTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [allCategories, setAllCategories] = useState<CategoryResponseDTO[]>([])
  const [totalCourses, setTotalCourses] = useState(0)

  useEffect(() => {
    // Fetch all categories for stats
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

  useEffect(() => {
    if (!id || isNaN(id) || id <= 0) return
    setFetching(true)
    categoryApi
      .getCategoryById(id)
      .then(res => {
        setCategory(res.data)
        setForm({ name: res.data.name, description: res.data.description })
      })
      .catch(() => {
        setNotFound(true)
        toast.error('Category not found')
        router.push('/manager/categories')
      })
      .finally(() => setFetching(false))
  }, [id, router])

  const handleEditCategory = async () => {
    let hasError = false
    if (!form.name.trim()) {
      setNameError('Please enter a category name')
      hasError = true
    } else if (form.name.length > 30) {
      setNameError('Category name must not exceed 30 characters')
      hasError = true
    } else {
      setNameError('')
    }
    if (!form.description.trim()) {
      setDescriptionError('Please enter a category description')
      hasError = true
    } else if (form.description.length > 200) {
      setDescriptionError('Description must not exceed 200 characters')
      hasError = true
    } else {
      setDescriptionError('')
    }
    if (hasError || !id || isNaN(id) || id <= 0) return
    setLoading(true)
    try {
      await categoryApi.updateCategory(id, form)
      toast.success('Category updated successfully', {
        description: `Category "${form.name}" has been updated!`,
        icon: <CheckCircle className='h-5 w-5 text-green-500' />,
      })
      router.push('/manager/categories')
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update category. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className='text-center mt-10'>Loading data...</div>
  if (notFound) return null
  if (!category) return null

  return (
    <RoleGuard allowedRoles={['manager', 'admin']}>
      <SidebarProvider>
        <ManagerSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-6 min-h-screen'>
            {/* Header Section */}
            <div className='px-6'>
              <div>
                <h1 className='text-3xl font-bold'>Category Management</h1>
                <p className='text-muted-foreground mt-2'>
                  Organize and manage course categories for better navigation
                  and discovery.
                </p>
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
                    <div className='text-2xl font-bold'>
                      {allCategories.length}
                    </div>
                  </CardContent>
                </Card>
                <Card className='w-full'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Total Courses
                    </CardTitle>
                    <BookOpen className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{totalCourses}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
            {/* Categories Card with Form */}
            <Card className='w-full'>
              <CardHeader className='pb-2'>
                <div className='flex flex-col gap-1'>
                  <h2 className='text-xl font-bold'>Edit Category</h2>
                  <CardDescription>
                    Manage all categories used to organize your courses.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='max-w-xl mx-auto px-4'>
                  <form className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='edit-category-name'>Category Name</Label>
                      <Input
                        id='edit-category-name'
                        placeholder='Enter category name'
                        value={form.name}
                        maxLength={30}
                        onChange={e => {
                          setForm({ ...form, name: e.target.value })
                          if (e.target.value.length > 30) {
                            setNameError(
                              'Category name must not exceed 30 characters'
                            )
                          } else if (!e.target.value.trim()) {
                            setNameError('Please enter a category name')
                          } else {
                            setNameError('')
                          }
                        }}
                        onBlur={() => {
                          setNameTouched(true)
                          if (!form.name.trim())
                            setNameError('Please enter a category name')
                        }}
                      />
                      <p className='text-xs text-muted-foreground text-right'>
                        {form.name.length}/30
                      </p>
                      {nameTouched && nameError && (
                        <p className='text-red-500 text-xs mt-1'>{nameError}</p>
                      )}
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='edit-category-description'>
                        Description
                      </Label>
                      <Textarea
                        id='edit-category-description'
                        placeholder='Enter category description'
                        value={form.description}
                        maxLength={200}
                        onChange={e => {
                          setForm({ ...form, description: e.target.value })
                          if (e.target.value.length > 200) {
                            setDescriptionError(
                              'Description must not exceed 200 characters'
                            )
                          } else if (!e.target.value.trim()) {
                            setDescriptionError(
                              'Please enter a category description'
                            )
                          } else {
                            setDescriptionError('')
                          }
                        }}
                        onBlur={() => {
                          setDescriptionTouched(true)
                          if (!form.description.trim())
                            setDescriptionError(
                              'Please enter a category description'
                            )
                        }}
                        rows={3}
                      />
                      <p className='text-xs text-muted-foreground text-right'>
                        {form.description.length}/200
                      </p>
                      {descriptionTouched && descriptionError && (
                        <p className='text-red-500 text-xs mt-1'>
                          {descriptionError}
                        </p>
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
                        onClick={handleEditCategory}
                        disabled={
                          !form.name.trim() ||
                          !form.description.trim() ||
                          loading
                        }
                      >
                        {loading ? 'Updating...' : 'Update'}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
