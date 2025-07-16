import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

export const CourseFilterSidebar = React.memo(function CourseFilterSidebar({
  categories,
  selectedCategories,
  onCategoryChange,
  levels,
  selectedLevels,
  onLevelChange,
  priceFilter,
  setPriceFilter,
  priceRange,
  setPriceRange,
  searchStats,
  isDiscounted,
  setIsDiscounted,
  isFree,
  setIsFree,
}: {
  categories: any[]
  selectedCategories: string[]
  onCategoryChange: (category: string, checked: boolean) => void
  levels: string[]
  selectedLevels: string[]
  onLevelChange: (level: string, checked: boolean) => void
  priceFilter: string
  setPriceFilter: (value: string) => void
  priceRange: number[]
  setPriceRange: (value: number[]) => void
  searchStats: any
  isDiscounted: boolean | undefined
  setIsDiscounted: (value: boolean | undefined) => void
  isFree: boolean | undefined
  setIsFree: (value: boolean | undefined) => void
}) {
  return (
    <div className='hidden lg:block w-64 space-y-6 p-4 border rounded-lg bg-card'>
      <h3 className='font-semibold'>Filters</h3>
      {/* Category Filter */}
      <div className='space-y-3'>
        <h4 className='font-medium'>Category</h4>
        {categories.length > 0 ? (
          categories.map(category => (
            <div key={category.id} className='flex items-center space-x-2'>
              <Checkbox
                id={category.name}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={checked =>
                  onCategoryChange(category.name, checked as boolean)
                }
              />
              <label htmlFor={category.name} className='text-sm cursor-pointer'>
                {category.name}{' '}
                {category.courseCount && `(${category.courseCount})`}
              </label>
            </div>
          ))
        ) : (
          <p className='text-sm text-muted-foreground'>
            No categories available
          </p>
        )}
      </div>
      {/* Level Filter */}
      <div className='space-y-3'>
        <h4 className='font-medium'>Skill Level</h4>
        {levels.map(level => (
          <div key={level} className='flex items-center space-x-2'>
            <Checkbox
              id={level}
              checked={selectedLevels.includes(level)}
              onCheckedChange={checked =>
                onLevelChange(level, checked as boolean)
              }
            />
            <label htmlFor={level} className='text-sm cursor-pointer'>
              {level}
              <span className='text-muted-foreground ml-1'>
                ({searchStats?.levelStats?.[level] ?? 0})
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* Price Filter */}
      <div className='space-y-3'>
        <h4 className='font-medium'>Price</h4>
        <Select value={priceFilter} onValueChange={setPriceFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Courses</SelectItem>
            <SelectItem value='free'>Free</SelectItem>
            <SelectItem value='paid'>Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Price Range */}
      {priceFilter !== 'free' && (
        <div className='space-y-3'>
          <h4 className='font-medium'>Price Range</h4>
          <div className='px-2'>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={searchStats?.maxPrice || 200}
              min={searchStats?.minPrice || 0}
              step={10}
              className='w-full'
            />
            <div className='flex justify-between text-xs text-muted-foreground mt-1'>
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
      )}
      {/* Discount Filter */}
      <div className='space-y-3'>
        <h4 className='font-medium'>Discount</h4>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='discounted'
            checked={isDiscounted || false}
            onCheckedChange={checked => setIsDiscounted(checked ? true : undefined)}
          />
          <label htmlFor='discounted' className='text-sm cursor-pointer'>
            Show only discounted courses
          </label>
        </div>
      </div>
    </div>
  )
})
