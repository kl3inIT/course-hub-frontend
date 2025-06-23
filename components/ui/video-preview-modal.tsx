'use client'

import React, { useRef, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

interface VideoPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  videoUrl: string | null
  isLoading?: boolean
  autoPlay?: boolean
  showControls?: boolean
  className?: string
}

export function VideoPreviewModal({
  isOpen,
  onClose,
  title,
  description,
  videoUrl,
  isLoading = false,
  autoPlay = true,
  showControls = true,
  className = '',
}: VideoPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [_isFullscreen, setIsFullscreen] = useState(false)

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [isOpen])

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [videoUrl])

  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return

    const time = (parseFloat(e.target.value) / 100) * duration
    videoRef.current.currentTime = time
  }

  const toggleFullscreen = async () => {
    if (!videoRef.current) return

    try {
      if (!document.fullscreenElement) {
        await videoRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[900px] p-0 gap-0 ${className}`}>
        <DialogHeader className='p-4 border-b'>
          <DialogTitle className='text-lg font-semibold'>{title}</DialogTitle>
          {description && (
            <DialogDescription className='text-sm text-muted-foreground'>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className='relative group'>
          <div className='aspect-video bg-black relative overflow-hidden'>
            {isLoading ? (
              <div className='flex items-center justify-center h-full'>
                <Loader2 className='h-8 w-8 animate-spin text-white' />
                <span className='ml-2 text-white'>Loading video...</span>
              </div>
            ) : videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className='w-full h-full object-contain'
                  autoPlay={autoPlay}
                  controls={!showControls} // Use native controls if custom controls are disabled
                  playsInline
                  onError={e => {
                    console.error('Video playback error:', e)
                  }}
                />

                {/* Custom Controls Overlay */}
                {showControls && (
                  <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                    {/* Play/Pause Overlay */}
                    <div
                      className='absolute inset-0 flex items-center justify-center cursor-pointer'
                      onClick={togglePlayPause}
                    >
                      {!isPlaying && (
                        <div className='bg-black/50 rounded-full p-4'>
                          <Play className='h-8 w-8 text-white' />
                        </div>
                      )}
                    </div>

                    {/* Bottom Controls */}
                    <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
                      {/* Progress Bar */}
                      <div className='mb-3'>
                        <input
                          type='range'
                          min='0'
                          max='100'
                          value={progress}
                          onChange={handleSeek}
                          className='w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider'
                        />
                      </div>

                      {/* Control Buttons */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-4'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={togglePlayPause}
                            className='text-white hover:bg-white/20 p-2'
                          >
                            {isPlaying ? (
                              <Pause className='h-4 w-4' />
                            ) : (
                              <Play className='h-4 w-4' />
                            )}
                          </Button>

                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={toggleMute}
                            className='text-white hover:bg-white/20 p-2'
                          >
                            {isMuted ? (
                              <VolumeX className='h-4 w-4' />
                            ) : (
                              <Volume2 className='h-4 w-4' />
                            )}
                          </Button>

                          <span className='text-white text-sm'>
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>

                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={toggleFullscreen}
                          className='text-white hover:bg-white/20 p-2'
                        >
                          <Maximize className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className='flex items-center justify-center h-full text-white'>
                <div className='text-center'>
                  <div className='text-lg mb-2'>No video available</div>
                  <div className='text-sm text-white/70'>
                    Unable to load video content
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className='p-4 border-t flex justify-end space-x-2'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
