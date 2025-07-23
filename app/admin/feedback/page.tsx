'use client'

import { RoleGuard } from '@/components/auth/role-guard'
import FeedbackDetail from '@/components/feedback/FeedbackDetail'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { feedbackApi, type Feedback } from '@/services/feedback-api'
import { httpClient } from '@/services/http-client'
import { Client } from '@stomp/stompjs'
import { Eye, Filter, MessageSquare, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import SockJS from 'sockjs-client'

// Khai báo global cho window.showFeedbackDetail
declare global {
  interface Window {
    showFeedbackDetail?: (feedbackId: number) => void
  }
}

export function useNotificationSocket(
  userId: string | number,
  onNotification: (notification: any) => void
) {
  useEffect(() => {
    const getWebSocketUrl = () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      // Development
      if (
        !apiUrl ||
        apiUrl.includes('localhost') ||
        apiUrl.includes('127.0.0.1')
      ) {
        return 'http://localhost:8080/ws'
      }

      // Production - SockJS needs HTTPS URLs (auto-upgrades to WSS)
      if (apiUrl.startsWith('https://')) {
        return apiUrl + '/ws' // Keep https:// for SockJS
      }

      // Fallback
      return 'https://api.coursehub.io.vn/ws'
    }

    const wsUrl = getWebSocketUrl()
    const socket = new SockJS(wsUrl)
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      onConnect: () => {
        client.subscribe(`/topic/notifications/user-${userId}`, message => {
          const notification = JSON.parse(message.body)
          onNotification(notification)
        })
      },
      debug: process.env.NODE_ENV === 'development' ? console.log : () => {},
    })
    client.activate()
    return () => {
      client.deactivate()
    }
  }, [userId, onNotification])
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  )
  const [replyMessage, setReplyMessage] = useState('')
  const [showFAQ, setShowFAQ] = useState(false)

  useEffect(() => {
    loadFeedbacks()
  }, [])

  useEffect(() => {
    window.showFeedbackDetail = async (feedbackId: number) => {
      try {
        const res = await fetch(`/api/feedbacks/${feedbackId}`)
        const data = await res.json()
        setSelectedFeedback(data.data || data) // tuỳ response
      } catch (e) {
        alert('Không thể tải chi tiết feedback!')
      }
    }
    return () => {
      delete window.showFeedbackDetail
    }
  }, [])

  const loadFeedbacks = async () => {
    try {
      setLoading(true)
      const response = await feedbackApi.getAllFeedback()
      setFeedbacks(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Failed to load feedbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch =
      feedback.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.subject.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      categoryFilter === 'all' || feedback.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GENERAL_SUPPORT':
        return 'bg-blue-100 text-blue-800'
      case 'TECHNICAL_ISSUE':
        return 'bg-red-100 text-red-800'
      case 'BILLING_QUESTION':
        return 'bg-yellow-100 text-yellow-800'
      case 'COURSE_RELATED':
        return 'bg-green-100 text-green-800'
      case 'BUSINESS_INQUIRY':
        return 'bg-purple-100 text-purple-800'
      case 'FEEDBACK':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    // Nếu không có 'T', thay thế dấu cách đầu tiên bằng 'T'
    const isoString = dateString.includes('T')
      ? dateString
      : dateString.replace(' ', 'T')
    const date = new Date(isoString)
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
  }

  const handleSendReply = async () => {
    if (!selectedFeedback) return
    try {
      const url = `/api/feedbacks/${selectedFeedback.id}/reply`
      const payload = { reply: replyMessage }
      console.log('Sending reply to:', url, 'with payload:', payload)
      await httpClient.post(url, payload)
      alert('Reply sent successfully!')
      setReplyMessage('')
      setSelectedFeedback(null)
      loadFeedbacks()
    } catch (error) {
      alert('Failed to send reply!')
      console.error(error)
    }
  }

  return (
    <RoleGuard allowedRoles={['admin']} redirectOnUnauthorized={true}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className='flex-1 space-y-4 p-8 pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-3xl font-bold tracking-tight'>
                  Feedback Management
                </h2>
                <p className='text-muted-foreground'>
                  Quản lý và xem tất cả feedback từ người dùng
                </p>
              </div>
              <Button onClick={loadFeedbacks} disabled={loading}>
                <MessageSquare className='mr-2 h-4 w-4' />
                Refresh
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Filter className='h-5 w-5' />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='search'>Search</Label>
                    <div className='relative'>
                      <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='search'
                        placeholder='Search by name, email, or subject...'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className='pl-10'
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='category'>Category</Label>
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Categories</SelectItem>
                        <SelectItem value='GENERAL_SUPPORT'>
                          GENERAL_SUPPORT
                        </SelectItem>
                        <SelectItem value='TECHNICAL_ISSUE'>
                          TECHNICAL_ISSUE
                        </SelectItem>
                        <SelectItem value='BILLING_QUESTION'>
                          BILLING_QUESTION
                        </SelectItem>
                        <SelectItem value='COURSE_RELATED'>
                          COURSE_RELATED
                        </SelectItem>
                        <SelectItem value='BUSINESS_INQUIRY'>
                          BUSINESS_INQUIRY
                        </SelectItem>
                        <SelectItem value='FEEDBACK'>FEEDBACK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback List */}
            <div className='space-y-4'>
              {loading ? (
                <div className='text-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                  <p className='mt-2 text-muted-foreground'>
                    Loading feedbacks...
                  </p>
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <Card>
                  <CardContent className='text-center py-8'>
                    <MessageSquare className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <p className='text-muted-foreground'>No feedback found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredFeedbacks.map(feedback => (
                  <Card
                    key={feedback.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 space-y-2'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-semibold text-lg'>
                              {feedback.subject}
                            </h3>
                            <Badge
                              className={getCategoryColor(feedback.category)}
                            >
                              {feedback.category}
                            </Badge>
                          </div>
                          <div className='text-sm text-muted-foreground space-y-1'>
                            <p>
                              <strong>From:</strong> {feedback.fullName} (
                              {feedback.email})
                            </p>
                            <p>
                              <strong>Date:</strong>{' '}
                              {formatDate(feedback.createdAt)}
                            </p>
                          </div>
                          <p className='text-sm line-clamp-2'>
                            {feedback.message}
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setSelectedFeedback(feedback)}
                            >
                              <Eye className='h-4 w-4 mr-2' />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='max-w-2xl'>
                            <DialogHeader>
                              <DialogTitle>{feedback.subject}</DialogTitle>
                              <DialogDescription>
                                Feedback from {feedback.fullName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4'>
                              <div className='grid grid-cols-2 gap-4 text-sm'>
                                <div>
                                  <Label className='font-semibold'>Name:</Label>
                                  <p>{feedback.fullName}</p>
                                </div>
                                <div>
                                  <Label className='font-semibold'>
                                    Email:
                                  </Label>
                                  <p>{feedback.email}</p>
                                </div>
                                <div>
                                  <Label className='font-semibold'>
                                    Category:
                                  </Label>
                                  <Badge
                                    className={getCategoryColor(
                                      feedback.category
                                    )}
                                  >
                                    {feedback.category}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className='font-semibold'>Date:</Label>
                                  <p>{formatDate(feedback.createdAt)}</p>
                                </div>
                              </div>
                              <div>
                                <Label className='font-semibold'>
                                  Message:
                                </Label>
                                <div className='mt-2 p-4 bg-muted rounded-lg'>
                                  <p className='whitespace-pre-wrap'>
                                    {feedback.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className='flex gap-2 mt-4'>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant='secondary'>Reply</Button>
                                </DialogTrigger>
                                <DialogContent className='max-w-md'>
                                  <DialogHeader>
                                    <DialogTitle>Reply to Feedback</DialogTitle>
                                  </DialogHeader>
                                  <div className='space-y-2'>
                                    <Label htmlFor='reply-message'>
                                      Message
                                    </Label>
                                    <Input
                                      id='reply-message'
                                      placeholder='Type your reply...'
                                      value={replyMessage}
                                      onChange={e =>
                                        setReplyMessage(e.target.value)
                                      }
                                    />
                                    <Button
                                      className='mt-2'
                                      onClick={handleSendReply}
                                      disabled={!replyMessage.trim()}
                                    >
                                      Send Reply
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant='outline'
                                onClick={() => alert('Marked as resolved!')}
                              >
                                Mark as Resolved
                              </Button>
                              <Button
                                variant='ghost'
                                onClick={() => alert('Forwarded!')}
                              >
                                Forward
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {selectedFeedback && <FeedbackDetail feedback={selectedFeedback} />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
