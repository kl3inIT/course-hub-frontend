'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Monitor,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Clock,
} from 'lucide-react'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { CourseDetailsResponseDTO } from '@/types/course'
import { LessonResponseDTO } from '@/types/lesson'

interface VideoPlayerProps {
  videoUrl?: string
  course: CourseDetailsResponseDTO
  lesson: LessonResponseDTO
  onVideoEnded?: () => void
  onProgressUpdate?: (currentTime: number, progress: number) => void
  onPreviousLesson?: () => void
  onNextLesson?: () => void
  hasPreviousLesson?: boolean
  hasNextLesson?: boolean
}

export function VideoPlayer({
  videoUrl,
  course,
  lesson,
  onVideoEnded,
  onProgressUpdate,
  onPreviousLesson,
  onNextLesson,
  hasPreviousLesson = false,
  hasNextLesson = false,
}: VideoPlayerProps) {
  const videoPlayer = useVideoPlayer({
    videoUrl,
    onTimeUpdate: onProgressUpdate,
    onVideoEnded,
    onError: error => console.error('Video error:', error),
  })

  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0m'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) return `${h}h ${m}m ${s > 0 ? s + 's' : ''}`.trim()
    if (m > 0) return `${m}m${s > 0 ? ' ' + s + 's' : ''}`
    return `${s}s`
  }

  return (
    <div className='space-y-4'>
      {/* Video Container */}
      <div className='relative'>
        {!videoUrl && (
          <div className='aspect-video bg-gray-900 rounded-lg flex items-center justify-center'>
            <div className='text-white text-center'>
              <p>No video available for this lesson.</p>
            </div>
          </div>
        )}

        {videoUrl && (
          <div
            className={`relative bg-black transition-all duration-300 ${
              videoPlayer.isFullscreen ? 'fixed inset-0 z-50' : 'rounded-lg'
            }`}
            ref={videoPlayer.videoContainerRef}
          >
            <video
              ref={videoPlayer.videoRef}
              className={`w-full object-contain ${
                videoPlayer.isFullscreen
                  ? 'h-screen'
                  : videoPlayer.videoSize === 'small'
                    ? 'h-48 md:h-64'
                    : videoPlayer.videoSize === 'medium'
                      ? 'h-64 md:h-80 lg:h-96'
                      : 'h-80 md:h-96 lg:h-[32rem]'
              }`}
              poster={
                course.thumbnailUrl || '/placeholder.svg?height=400&width=600'
              }
              controls={false}
              onClick={videoPlayer.togglePlayPause}
              onTimeUpdate={videoPlayer.handleTimeUpdate}
              onLoadedMetadata={videoPlayer.handleLoadedMetadata}
              onEnded={videoPlayer.handleVideoEnded}
              onError={e => console.error('Video error:', e)}
            >
              <source src={videoUrl} type='video/mp4' />
              Your browser does not support the video tag.
            </video>

            {/* Video Overlay Controls */}
            <div
              className={`absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 ${
                videoPlayer.isPlaying ? '' : 'opacity-100'
              }`}
            >
              {/* Center Play/Pause Button */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <Button
                  size='lg'
                  variant='secondary'
                  className='rounded-full h-16 w-16 bg-black/50 hover:bg-black/70 backdrop-blur-sm'
                  onClick={videoPlayer.togglePlayPause}
                >
                  {videoPlayer.isPlaying ? (
                    <Pause className='h-8 w-8' />
                  ) : (
                    <Play className='h-8 w-8 ml-1' />
                  )}
                </Button>
              </div>

              {/* Top Controls */}
              <div className='absolute top-4 right-4 flex items-center space-x-2'>
                {/* Video Size Controls */}
                <div className='flex items-center space-x-1 bg-black/50 rounded-lg p-1 backdrop-blur-sm'>
                  <Button
                    size='sm'
                    variant={
                      videoPlayer.videoSize === 'small' ? 'secondary' : 'ghost'
                    }
                    className='h-8 w-8 p-0 text-white hover:text-black'
                    onClick={() => videoPlayer.setVideoSize('small')}
                    title='Small video'
                  >
                    <Monitor className='h-3 w-3' />
                  </Button>
                  <Button
                    size='sm'
                    variant={
                      videoPlayer.videoSize === 'medium' ? 'secondary' : 'ghost'
                    }
                    className='h-8 w-8 p-0 text-white hover:text-black'
                    onClick={() => videoPlayer.setVideoSize('medium')}
                    title='Medium video'
                  >
                    <Monitor className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant={
                      videoPlayer.videoSize === 'large' ? 'secondary' : 'ghost'
                    }
                    className='h-8 w-8 p-0 text-white hover:text-black'
                    onClick={() => videoPlayer.setVideoSize('large')}
                    title='Large video'
                  >
                    <Monitor className='h-5 w-5' />
                  </Button>
                </div>

                {/* Fullscreen Toggle */}
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-8 w-8 p-0 text-white hover:text-black bg-black/50 hover:bg-white/90 backdrop-blur-sm'
                  onClick={videoPlayer.toggleFullscreen}
                  title={
                    videoPlayer.isFullscreen
                      ? 'Exit fullscreen'
                      : 'Enter fullscreen'
                  }
                >
                  {videoPlayer.isFullscreen ? (
                    <Minimize2 className='h-4 w-4' />
                  ) : (
                    <Maximize2 className='h-4 w-4' />
                  )}
                </Button>
              </div>

              {/* Bottom Controls Bar */}
              <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
                {/* Progress Bar */}
                <div className='mb-3'>
                  <div
                    className='w-full h-1 bg-white/30 rounded-full cursor-pointer group relative'
                    onClick={videoPlayer.handleProgressClick}
                    ref={videoPlayer.progressBarRef}
                    title='Seeking will not count towards watch time'
                  >
                    <div
                      className='h-full bg-primary rounded-full transition-all duration-150'
                      style={{ width: `${videoPlayer.progress}%` }}
                    />
                    {/* Hover Tooltip */}
                    <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap'>
                      Seeking will not count towards watch time
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                      onClick={onPreviousLesson}
                      disabled={!hasPreviousLesson}
                      title='Previous lesson'
                    >
                      <SkipBack className='h-4 w-4' />
                    </Button>

                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                      onClick={() => videoPlayer.seekVideo(-10)}
                      title='Rewind 10 seconds'
                    >
                      <RotateCcw className='h-4 w-4' />
                    </Button>

                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                      onClick={videoPlayer.togglePlayPause}
                      title={videoPlayer.isPlaying ? 'Pause' : 'Play'}
                    >
                      {videoPlayer.isPlaying ? (
                        <Pause className='h-4 w-4' />
                      ) : (
                        <Play className='h-4 w-4' />
                      )}
                    </Button>

                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                      onClick={() => videoPlayer.seekVideo(10)}
                      title='Forward 10 seconds'
                    >
                      <RotateCw className='h-4 w-4' />
                    </Button>

                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                      onClick={onNextLesson}
                      disabled={!hasNextLesson}
                      title='Next lesson'
                    >
                      <SkipForward className='h-4 w-4' />
                    </Button>

                    {/* Volume Control */}
                    <div className='flex items-center space-x-2'>
                      <Button
                        size='sm'
                        variant='ghost'
                        className='h-8 w-8 p-0 text-white hover:text-black hover:bg-white/90'
                        onClick={videoPlayer.toggleMute}
                        title={videoPlayer.isMuted ? 'Unmute' : 'Mute'}
                      >
                        {videoPlayer.isMuted ? (
                          <VolumeX className='h-4 w-4' />
                        ) : (
                          <Volume2 className='h-4 w-4' />
                        )}
                      </Button>
                      <input
                        type='range'
                        min='0'
                        max='1'
                        step='0.1'
                        value={videoPlayer.volume}
                        onChange={videoPlayer.handleVolumeChange}
                        className='w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider'
                        title='Volume'
                      />
                    </div>
                  </div>

                  <div className='flex items-center space-x-4 text-white text-sm'>
                    {/* Time Display */}
                    <span className='font-mono'>
                      {videoPlayer.formatTime(videoPlayer.currentTime)} /{' '}
                      {videoPlayer.formatTime(videoPlayer.duration)}
                    </span>

                    {/* Playback Speed */}
                    <select
                      value={videoPlayer.playbackSpeed}
                      onChange={videoPlayer.handleSpeedChange}
                      className='bg-black/50 text-white text-xs rounded px-2 py-1 border-none outline-none cursor-pointer'
                      title='Playback speed'
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={0.75}>0.75x</option>
                      <option value={1}>1x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={2}>2x</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Fullscreen Exit Hint */}
            {videoPlayer.isFullscreen && (
              <div className='absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded backdrop-blur-sm'>
                Press ESC to exit fullscreen
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Info Bar (only visible when not fullscreen) */}
      {!videoPlayer.isFullscreen && videoUrl && (
        <div className='p-4 border rounded-lg bg-muted/30'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                <Clock className='h-4 w-4' />
                <span>{formatDuration(lesson?.duration || 0)}</span>
              </div>
              <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                <Monitor className='h-4 w-4' />
                <span className='capitalize'>
                  {videoPlayer.videoSize} player
                </span>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={videoPlayer.toggleFullscreen}
              >
                <Maximize2 className='h-4 w-4 mr-2' />
                Fullscreen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
