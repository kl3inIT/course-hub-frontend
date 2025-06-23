'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ImageIcon, Upload, X } from 'lucide-react'

interface CourseThumbnailUploaderProps {
  value: File | string | null
  onChange: (file: File | null) => void
  disabled?: boolean
}

export function CourseThumbnailUploader({
  value,
  onChange,
  disabled = false,
}: CourseThumbnailUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (typeof value === 'string' && value) {
      setPreview(value)
    } else if (value instanceof File) {
      const reader = new FileReader()
      reader.onload = e => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(value)
    } else {
      setPreview('')
    }
  }, [value])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if there's an existing thumbnail
    const hasExistingThumbnail = typeof value === 'string' && value

    if (hasExistingThumbnail) {
      const shouldReplace = window.confirm(
        'Uploading a new thumbnail will permanently delete the current one from storage. Do you want to continue?'
      )

      if (!shouldReplace) {
        // Reset the file input
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, WebP)')
      return
    }
    // Validate size
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }
    setError('')
    onChange(file)
  }

  const handleRemove = () => {
    setPreview('')
    setError('')
    onChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className='space-y-2'>
      <Label className='text-sm font-medium'>Course Thumbnail</Label>
      <div className='flex items-center gap-4'>
        <Button
          type='button'
          variant='outline'
          onClick={() => fileInputRef.current?.click()}
          className='flex items-center gap-2'
          disabled={disabled}
        >
          <Upload className='h-4 w-4' />
          Choose File
        </Button>
        <span className='text-sm text-muted-foreground'>
          JPEG, PNG, GIF, WebP (max 5MB)
        </span>
      </div>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        className='hidden'
        disabled={disabled}
      />
      {error && <p className='text-xs text-red-500'>{error}</p>}
      {preview && (
        <div className='relative w-full max-w-md mt-2'>
          <img
            src={preview}
            alt='Course thumbnail preview'
            className='w-full h-48 object-cover rounded-lg border'
            onError={handleRemove}
          />
          <Button
            type='button'
            variant='destructive'
            size='sm'
            className='absolute top-2 right-2'
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className='h-4 w-4' />
          </Button>
        </div>
      )}
      {!preview && (
        <div className='w-full max-w-md h-48 flex items-center justify-center bg-muted rounded-lg border mt-2'>
          <ImageIcon className='h-8 w-8 text-muted-foreground' />
        </div>
      )}
    </div>
  )
}
