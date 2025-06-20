import { useState, useRef, useEffect, useCallback } from 'react'

export interface UseVideoPlayerProps {
  videoUrl?: string
  onTimeUpdate?: (currentTime: number, progress: number) => void
  onVideoEnded?: () => void
  onError?: (error: string) => void
}

export interface UseVideoPlayerReturn {
  // Video refs
  videoRef: React.RefObject<HTMLVideoElement | null>
  videoContainerRef: React.RefObject<HTMLDivElement | null>
  progressBarRef: React.RefObject<HTMLDivElement | null>
  
  // Video state
  isPlaying: boolean
  currentTime: number
  duration: number
  progress: number
  volume: number
  isMuted: boolean
  playbackSpeed: number
  videoSize: 'small' | 'medium' | 'large'
  isFullscreen: boolean
  
  // Video actions
  togglePlayPause: () => Promise<void>
  toggleFullscreen: () => void
  seekVideo: (seconds: number) => void
  handleProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void
  toggleMute: () => void
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSpeedChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  setVideoSize: (size: 'small' | 'medium' | 'large') => void
  
  // Video event handlers
  handleTimeUpdate: () => void
  handleLoadedMetadata: () => void
  handleVideoEnded: () => void
  
  // Utility functions
  formatTime: (time: number) => string
}

export function useVideoPlayer({
  videoUrl,
  onTimeUpdate,
  onVideoEnded,
  onError,
}: UseVideoPlayerProps): UseVideoPlayerReturn {
  // Video refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Video state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [videoSize, setVideoSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Video player functions
  const togglePlayPause = useCallback(async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause()
          setIsPlaying(false)
        } else {
          if (!videoUrl) {
            return
          }
          if (videoRef.current.readyState < 2) {
            videoRef.current.load()
            await new Promise(resolve => {
              const handleCanPlay = () => {
                videoRef.current?.removeEventListener('canplay', handleCanPlay)
                resolve(true)
              }
              videoRef.current?.addEventListener('canplay', handleCanPlay)
            })
          }
          try {
            await videoRef.current.play()
            setIsPlaying(true)
          } catch (error) {
            setIsPlaying(false)
            onError?.('Failed to play video')
          }
        }
      } catch (error) {
        setIsPlaying(false)
        onError?.('Video playback error')
      }
    }
  }, [isPlaying, videoUrl, onError])

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (videoContainerRef.current?.requestFullscreen) {
        videoContainerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }, [isFullscreen])

  const seekVideo = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }, [])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const percentage = clickX / width
      const newTime = percentage * duration
      videoRef.current.currentTime = newTime
    }
  }, [duration])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }, [])

  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = Number.parseFloat(e.target.value)
    setPlaybackSpeed(newSpeed)
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed
    }
  }, [])

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      const newProgress = (current / total) * 100
      setProgress(newProgress)
      onTimeUpdate?.(current, newProgress)
    }
  }, [onTimeUpdate])

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }, [])

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false)
    onVideoEnded?.()
  }, [onVideoEnded])

  // Utility functions
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Fullscreen event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    const handleKeyPress = async (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
      const activeElement = document.activeElement?.tagName
      if (
        e.key === ' ' &&
        activeElement !== 'INPUT' &&
        activeElement !== 'TEXTAREA'
      ) {
        e.preventDefault()
        await togglePlayPause()
      }
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyPress)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isFullscreen, togglePlayPause])

  // Reset video state when videoUrl changes
  useEffect(() => {
    setIsPlaying(false)
    setProgress(0)
    setCurrentTime(0)
    setDuration(0)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }, [videoUrl])

  // Handle video source changes
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.load()
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
      setDuration(0)

      const handleCanPlay = () => {
        if (videoRef.current) {
          setDuration(videoRef.current.duration)
        }
      }
      
      videoRef.current.addEventListener('canplay', handleCanPlay)
      return () => {
        videoRef.current?.removeEventListener('canplay', handleCanPlay)
      }
    }
  }, [videoUrl])

  return {
    // Video refs
    videoRef,
    videoContainerRef,
    progressBarRef,
    
    // Video state
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    playbackSpeed,
    videoSize,
    isFullscreen,
    
    // Video actions
    togglePlayPause,
    toggleFullscreen,
    seekVideo,
    handleProgressClick,
    toggleMute,
    handleVolumeChange,
    handleSpeedChange,
    setVideoSize,
    
    // Video event handlers
    handleTimeUpdate,
    handleLoadedMetadata,
    handleVideoEnded,
    
    // Utility functions
    formatTime,
  }
} 