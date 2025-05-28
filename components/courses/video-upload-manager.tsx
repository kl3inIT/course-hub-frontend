"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Trash2,
  Edit,
  FileVideo,
  Clock,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Loader2,
  MoreVertical,
  Eye,
  Settings,
  ImageIcon,
} from "lucide-react"

interface VideoFile {
  id: string
  file: File
  name: string
  size: number
  duration?: number
  thumbnail?: string
  uploadProgress: number
  processingStatus: "pending" | "uploading" | "processing" | "completed" | "error"
  processingProgress: number
  url?: string
  metadata: {
    title: string
    description: string
    tags: string[]
    resolution: string
    bitrate: string
    format: string
  }
  transcoding: {
    formats: Array<{
      quality: string
      size: number
      url?: string
      status: "pending" | "processing" | "completed" | "error"
    }>
  }
}

interface VideoUploadManagerProps {
  lessonId: string
  onVideoUploaded: (video: VideoFile) => void
  existingVideo?: VideoFile
}

export function VideoUploadManager({ lessonId, onVideoUploaded, existingVideo }: VideoUploadManagerProps) {
  const [videos, setVideos] = useState<VideoFile[]>(existingVideo ? [existingVideo] : [])
  const [dragActive, setDragActive] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(existingVideo || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showMetadataDialog, setShowMetadataDialog] = useState(false)
  const [showThumbnailDialog, setShowThumbnailDialog] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const dragCounter = useRef(0)

  const supportedFormats = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/flv",
    "video/mkv",
  ]

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement("video")
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        video.currentTime = Math.min(5, video.duration / 4) // Capture at 5 seconds or 1/4 duration
      }

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0)
          const thumbnail = canvas.toDataURL("image/jpeg", 0.8)
          resolve(thumbnail)
        }
      }

      video.src = URL.createObjectURL(file)
    })
  }

  const getVideoMetadata = (file: File): Promise<{ duration: number; resolution: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement("video")
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          resolution: `${video.videoWidth}x${video.videoHeight}`,
        })
      }
      video.src = URL.createObjectURL(file)
    })
  }

  const simulateUpload = async (video: VideoFile): Promise<void> => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, uploadProgress: progress } : v)))
    }

    // Start processing
    setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, processingStatus: "processing" } : v)))

    // Simulate processing progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, processingProgress: progress } : v)))
    }

    // Complete processing
    const videoUrl = URL.createObjectURL(video.file)
    setVideos((prev) =>
      prev.map((v) =>
        v.id === video.id
          ? {
              ...v,
              processingStatus: "completed",
              url: videoUrl,
              transcoding: {
                formats: [
                  { quality: "1080p", size: video.file.size, url: videoUrl, status: "completed" },
                  { quality: "720p", size: video.file.size * 0.7, url: videoUrl, status: "completed" },
                  { quality: "480p", size: video.file.size * 0.4, url: videoUrl, status: "completed" },
                  { quality: "360p", size: video.file.size * 0.2, url: videoUrl, status: "completed" },
                ],
              },
            }
          : v,
      ),
    )
  }

  const handleFileSelect = async (files: FileList) => {
    const validFiles = Array.from(files).filter((file) => {
      if (!supportedFormats.includes(file.type)) {
        alert(`Unsupported file format: ${file.type}`)
        return false
      }
      if (file.size > 500 * 1024 * 1024) {
        // 500MB limit
        alert(`File too large: ${formatFileSize(file.size)}. Maximum size is 500MB.`)
        return false
      }
      return true
    })

    for (const file of validFiles) {
      const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const thumbnail = await generateThumbnail(file)
      const metadata = await getVideoMetadata(file)

      const newVideo: VideoFile = {
        id: videoId,
        file,
        name: file.name,
        size: file.size,
        duration: metadata.duration,
        thumbnail,
        uploadProgress: 0,
        processingStatus: "uploading",
        processingProgress: 0,
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          description: "",
          tags: [],
          resolution: metadata.resolution,
          bitrate: "Unknown",
          format: file.type,
        },
        transcoding: {
          formats: [
            { quality: "1080p", size: 0, status: "pending" },
            { quality: "720p", size: 0, status: "pending" },
            { quality: "480p", size: 0, status: "pending" },
            { quality: "360p", size: 0, status: "pending" },
          ],
        },
      }

      setVideos((prev) => [...prev, newVideo])
      setSelectedVideo(newVideo)

      // Start upload simulation
      simulateUpload(newVideo)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true)
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    dragCounter.current = 0
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [])

  const updateVideoMetadata = (videoId: string, metadata: Partial<VideoFile["metadata"]>) => {
    setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, metadata: { ...v.metadata, ...metadata } } : v)))
  }

  const deleteVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId))
    if (selectedVideo?.id === videoId) {
      setSelectedVideo(null)
    }
  }

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const getStatusIcon = (status: VideoFile["processingStatus"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (video: VideoFile) => {
    switch (video.processingStatus) {
      case "uploading":
        return `Uploading... ${video.uploadProgress}%`
      case "processing":
        return `Processing... ${video.processingProgress}%`
      case "completed":
        return "Ready"
      case "error":
        return "Error"
      default:
        return "Pending"
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileVideo className="h-5 w-5" />
            Video Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Upload Video Files</h3>
              <p className="text-muted-foreground">Drag and drop your video files here, or click to browse</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span>Supported formats:</span>
                <Badge variant="outline">MP4</Badge>
                <Badge variant="outline">WebM</Badge>
                <Badge variant="outline">MOV</Badge>
                <Badge variant="outline">AVI</Badge>
                <Badge variant="outline">WMV</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Maximum file size: 500MB</p>
            </div>
            <Button className="mt-4" onClick={() => fileInputRef.current?.click()}>
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Video List */}
      {videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedVideo?.id === video.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail || "/placeholder.svg"}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileVideo className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      {video.duration && (
                        <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{video.metadata.title}</h4>
                        {getStatusIcon(video.processingStatus)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{formatFileSize(video.size)}</p>

                      {/* Progress Bars */}
                      {video.processingStatus === "uploading" && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Uploading</span>
                            <span>{video.uploadProgress}%</span>
                          </div>
                          <Progress value={video.uploadProgress} className="h-2" />
                        </div>
                      )}

                      {video.processingStatus === "processing" && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Processing</span>
                            <span>{video.processingProgress}%</span>
                          </div>
                          <Progress value={video.processingProgress} className="h-2" />
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">{getStatusText(video)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setShowMetadataDialog(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Metadata
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowThumbnailDialog(true)}>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Change Thumbnail
                          </DropdownMenuItem>
                          {video.url && (
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteVideo(video.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Player */}
      {selectedVideo && selectedVideo.url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Video Preview</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedVideo.metadata.resolution}</Badge>
                <Badge variant="outline">{selectedVideo.metadata.format}</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Video Player */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={selectedVideo.url}
                  className="w-full aspect-video"
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Custom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-4">
                  <div className="space-y-2">
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 text-white text-sm">
                      <span>{formatDuration(currentTime)}</span>
                      <div className="flex-1">
                        <input
                          type="range"
                          min={0}
                          max={duration}
                          value={currentTime}
                          onChange={(e) => handleSeek(Number(e.target.value))}
                          className="w-full h-1 bg-white/25 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <span>{formatDuration(duration)}</span>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleVideoPlay}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.muted = !isMuted
                              setIsMuted(!isMuted)
                            }
                          }}
                          className="text-white hover:bg-white/20"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (videoRef.current) {
                            if (document.fullscreenElement) {
                              document.exitFullscreen()
                            } else {
                              videoRef.current.requestFullscreen()
                            }
                          }
                        }}
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Information */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="transcoding">Quality Options</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="video-title">Title</Label>
                      <Input
                        id="video-title"
                        value={selectedVideo.metadata.title}
                        onChange={(e) => updateVideoMetadata(selectedVideo.id, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="video-duration">Duration</Label>
                      <Input id="video-duration" value={formatDuration(selectedVideo.duration || 0)} readOnly />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="video-description">Description</Label>
                    <Textarea
                      id="video-description"
                      value={selectedVideo.metadata.description}
                      onChange={(e) => updateVideoMetadata(selectedVideo.id, { description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedVideo.metadata.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              const newTags = selectedVideo.metadata.tags.filter((_, i) => i !== index)
                              updateVideoMetadata(selectedVideo.id, { tags: newTags })
                            }}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Add a tag"
                      className="mt-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          if (input.value.trim()) {
                            const newTags = [...selectedVideo.metadata.tags, input.value.trim()]
                            updateVideoMetadata(selectedVideo.id, { tags: newTags })
                            input.value = ""
                          }
                        }
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="transcoding" className="space-y-4">
                  <div className="space-y-3">
                    {selectedVideo.transcoding.formats.map((format, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div>
                            <p className="font-medium">{format.quality}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(format.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{format.status === "completed" ? "Ready" : "Processing"}</Badge>
                          {format.url && (
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>File Size</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span>{formatFileSize(selectedVideo.size)}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Resolution</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedVideo.metadata.resolution}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Format</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <FileVideo className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedVideo.metadata.format}</span>
                      </div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedVideo.processingStatus)}
                        <span>{getStatusText(selectedVideo)}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata Dialog */}
      <Dialog open={showMetadataDialog} onOpenChange={setShowMetadataDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Video Metadata</DialogTitle>
            <DialogDescription>Update the title, description, and tags for your video</DialogDescription>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Title</Label>
                <Input
                  id="meta-title"
                  value={selectedVideo.metadata.title}
                  onChange={(e) => updateVideoMetadata(selectedVideo.id, { title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="meta-description">Description</Label>
                <Textarea
                  id="meta-description"
                  value={selectedVideo.metadata.description}
                  onChange={(e) => updateVideoMetadata(selectedVideo.id, { description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMetadataDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowMetadataDialog(false)}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Thumbnail Dialog */}
      <Dialog open={showThumbnailDialog} onOpenChange={setShowThumbnailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Video Thumbnail</DialogTitle>
            <DialogDescription>Upload a custom thumbnail or generate one from the video</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" className="h-24">
                <div className="text-center">
                  <Upload className="mx-auto h-6 w-6 mb-2" />
                  <span className="text-sm">Upload Custom</span>
                </div>
              </Button>
              <Button variant="outline" className="h-24">
                <div className="text-center">
                  <FileVideo className="mx-auto h-6 w-6 mb-2" />
                  <span className="text-sm">Generate from Video</span>
                </div>
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowThumbnailDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowThumbnailDialog(false)}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
