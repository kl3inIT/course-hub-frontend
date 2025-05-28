"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  CheckCircle,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock content data
const mockContent = [
  {
    id: "content-1",
    title: "Introduction to React Hooks",
    type: "article",
    status: "published",
    author: "John Doe",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:20:00Z",
    views: 1250,
    category: "Programming",
    tags: ["React", "JavaScript", "Hooks"],
    size: "2.5 MB",
  },
  {
    id: "content-2",
    title: "Advanced CSS Techniques",
    type: "video",
    status: "draft",
    author: "Jane Smith",
    createdAt: "2024-01-18T09:15:00Z",
    updatedAt: "2024-01-20T11:45:00Z",
    views: 0,
    category: "Design",
    tags: ["CSS", "Web Design", "Frontend"],
    size: "125 MB",
  },
  {
    id: "content-3",
    title: "Python Data Analysis Guide",
    type: "document",
    status: "published",
    author: "Bob Wilson",
    createdAt: "2024-01-10T16:20:00Z",
    updatedAt: "2024-01-19T13:30:00Z",
    views: 890,
    category: "Data Science",
    tags: ["Python", "Data Analysis", "Pandas"],
    size: "5.2 MB",
  },
  {
    id: "content-4",
    title: "UI Design Principles",
    type: "image",
    status: "review",
    author: "Alice Johnson",
    createdAt: "2024-01-20T08:45:00Z",
    updatedAt: "2024-01-20T08:45:00Z",
    views: 45,
    category: "Design",
    tags: ["UI", "Design", "Principles"],
    size: "8.7 MB",
  },
]

const mockMediaAssets = [
  {
    id: "media-1",
    name: "course-thumbnail-react.jpg",
    type: "image",
    size: "245 KB",
    uploadedAt: "2024-01-20T10:30:00Z",
    uploadedBy: "admin@example.com",
    url: "/placeholder.svg?height=100&width=100",
    usageCount: 5,
  },
  {
    id: "media-2",
    name: "intro-video.mp4",
    type: "video",
    size: "45.2 MB",
    uploadedAt: "2024-01-19T14:20:00Z",
    uploadedBy: "manager@example.com",
    url: "/placeholder.svg?height=100&width=100",
    usageCount: 12,
  },
  {
    id: "media-3",
    name: "background-music.mp3",
    type: "audio",
    size: "3.8 MB",
    uploadedAt: "2024-01-18T11:15:00Z",
    uploadedBy: "creator@example.com",
    url: "/placeholder.svg?height=100&width=100",
    usageCount: 8,
  },
]

const contentTypes = {
  article: { label: "Article", icon: FileText },
  video: { label: "Video", icon: Video },
  document: { label: "Document", icon: FileText },
  image: { label: "Image", icon: Image },
  audio: { label: "Audio", icon: Music },
}

const statusConfig = {
  published: { label: "Published", variant: "default" as const, icon: CheckCircle },
  draft: { label: "Draft", variant: "secondary" as const, icon: Clock },
  review: { label: "Under Review", variant: "outline" as const, icon: Eye },
  archived: { label: "Archived", variant: "destructive" as const, icon: Archive },
}

export function ContentManagement() {
  const [content, setContent] = useState(mockContent)
  const [mediaAssets, setMediaAssets] = useState(mockMediaAssets)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newContent, setNewContent] = useState({
    title: "",
    type: "article",
    category: "",
    tags: "",
    description: "",
  })
  const { toast } = useToast()

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || item.type === selectedType
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getContentStats = () => {
    const total = content.length
    const published = content.filter((c) => c.status === "published").length
    const draft = content.filter((c) => c.status === "draft").length
    const review = content.filter((c) => c.status === "review").length
    const totalViews = content.reduce((sum, c) => sum + c.views, 0)

    return { total, published, draft, review, totalViews }
  }

  const stats = getContentStats()

  const handleCreateContent = () => {
    const content = {
      id: `content-${Date.now()}`,
      ...newContent,
      status: "draft",
      author: "Current User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      tags: newContent.tags.split(",").map((tag) => tag.trim()),
      size: "0 MB",
    }
    setContent([content, ...content])
    setNewContent({ title: "", type: "article", category: "", tags: "", description: "" })
    setIsCreateDialogOpen(false)
    toast({
      title: "Content Created",
      description: `${content.title} has been created successfully.`,
    })
  }

  const handleDeleteContent = (contentId: string) => {
    const contentItem = content.find((c) => c.id === contentId)
    setContent(content.filter((c) => c.id !== contentId))
    toast({
      title: "Content Deleted",
      description: `${contentItem?.title} has been deleted.`,
      variant: "destructive",
    })
  }

  const handleStatusChange = (contentId: string, newStatus: string) => {
    setContent(content.map((c) => (c.id === contentId ? { ...c, status: newStatus } : c)))
    toast({
      title: "Status Updated",
      description: `Content status has been updated to ${newStatus}.`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground mt-2">Manage all content, media assets, and publishing workflows.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.review}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content Library</TabsTrigger>
          <TabsTrigger value="media">Media Assets</TabsTrigger>
          <TabsTrigger value="workflow">Publishing Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Content Library</CardTitle>
                  <CardDescription>Manage all content across the platform</CardDescription>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Content
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Content</DialogTitle>
                      <DialogDescription>Add new content to the platform</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="title"
                          value={newContent.title}
                          onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                          Type
                        </Label>
                        <Select
                          value={newContent.type}
                          onValueChange={(value) => setNewContent({ ...newContent, type: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                          Category
                        </Label>
                        <Input
                          id="category"
                          value={newContent.category}
                          onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tags" className="text-right">
                          Tags
                        </Label>
                        <Input
                          id="tags"
                          value={newContent.tags}
                          onChange={(e) => setNewContent({ ...newContent, tags: e.target.value })}
                          placeholder="Comma separated tags"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={newContent.description}
                          onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleCreateContent}>
                        Create Content
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((item) => {
                    const typeConfig = contentTypes[item.type as keyof typeof contentTypes]
                    const statusInfo = statusConfig[item.status as keyof typeof statusConfig]
                    const TypeIcon = typeConfig?.icon
                    const StatusIcon = statusInfo?.icon

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {TypeIcon && <TypeIcon className="h-4 w-4" />}
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-muted-foreground">{item.category}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{typeConfig?.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo?.variant} className="flex items-center gap-1 w-fit">
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            {statusInfo?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.author}</TableCell>
                        <TableCell>{item.views.toLocaleString()}</TableCell>
                        <TableCell>{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleStatusChange(item.id, "published")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(item.id, "archived")}>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteContent(item.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Media Assets</CardTitle>
                  <CardDescription>Manage images, videos, and other media files</CardDescription>
                </div>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Media
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mediaAssets.map((asset) => (
                  <Card key={asset.id}>
                    <CardContent className="p-4">
                      <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                        {asset.type === "image" && <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                        {asset.type === "video" && <Video className="h-8 w-8 text-muted-foreground" />}
                        {asset.type === "audio" && <Music className="h-8 w-8 text-muted-foreground" />}
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium truncate">{asset.name}</h4>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{asset.size}</span>
                          <span>Used {asset.usageCount}x</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Uploaded by {asset.uploadedBy}</div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publishing Workflow</CardTitle>
              <CardDescription>Configure content approval and publishing processes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Draft Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.draft}</div>
                      <p className="text-xs text-muted-foreground">Content in draft</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Review Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.review}</div>
                      <p className="text-xs text-muted-foreground">Awaiting review</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Published</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.published}</div>
                      <p className="text-xs text-muted-foreground">Live content</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Workflow Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Require approval for publishing</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Auto-publish scheduled content</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email notifications for reviews</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
