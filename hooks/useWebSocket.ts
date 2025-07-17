import { useEffect, useState, useCallback } from 'react'
import { websocketService } from '@/services/websocket-service'

interface UseWebSocketOptions {
  autoConnect?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: any) => void
}

interface UseWebSocketReturn {
  isConnected: boolean
  connectionState: string
  connect: () => void
  disconnect: () => void
  subscribe: (destination: string, event: string, callback: (data: any) => void) => void
  unsubscribe: (event: string) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState('NOT_INITIALIZED')

  // Monitor connection state
  useEffect(() => {
    const checkConnection = () => {
      const connected = websocketService.isConnected()
      const state = websocketService.getConnectionState()
      
      setIsConnected(connected)
      setConnectionState(state)
    }

    // Check immediately
    checkConnection()

    // Check periodically
    const interval = setInterval(checkConnection, 1000)
    return () => clearInterval(interval)
  }, [])

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      console.warn('⚠️ No access token found, cannot connect to WebSocket')
      return
    }

    websocketService.connect(token, () => {
      console.log('🔌 WebSocket connected via hook')
      onConnect?.()
    })
  }, [onConnect])

  const disconnect = useCallback(() => {
    websocketService.disconnect()
    console.log('🔌 WebSocket disconnected via hook')
    onDisconnect?.()
  }, [onDisconnect])

  const subscribe = useCallback((destination: string, event: string, callback: (data: any) => void) => {
    websocketService.addSubscriber(event, callback)
    websocketService.subscribeTopic(destination, event)
  }, [])

  const unsubscribe = useCallback((event: string) => {
    websocketService.removeSubscriber(event)
  }, [])

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (autoConnect) {
      const token = localStorage.getItem('accessToken')
      const user = localStorage.getItem('user')
      
      if (token && user && !isConnected) {
        connect()
      }
    }
  }, [autoConnect, isConnected, connect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoConnect) {
        disconnect()
      }
    }
  }, [autoConnect, disconnect])

  return {
    isConnected,
    connectionState,
    connect,
    disconnect,
    subscribe,
    unsubscribe
  }
}

// Specialized hook for notifications
export function useNotifications(userId?: string | number) {
  const { isConnected, subscribe, unsubscribe } = useWebSocket()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const addNotification = useCallback((notification: any) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (isConnected && userId) {
      // Subscribe to user-specific notifications
      subscribe(`/user/queue/notifications`, 'user-notifications', addNotification)

      return () => {
        unsubscribe('user-notifications')
      }
    }
  }, [isConnected, userId, subscribe, unsubscribe, addNotification])

  const markAsRead = useCallback((notificationId: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearAll
  }
}

// Specialized hook for announcements
export function useAnnouncements(userRole?: string) {
  const { isConnected, subscribe, unsubscribe } = useWebSocket()
  const [announcements, setAnnouncements] = useState<any[]>([])

  const addAnnouncement = useCallback((announcement: any) => {
    setAnnouncements(prev => [announcement, ...prev])
  }, [])

  useEffect(() => {
    if (isConnected && userRole) {
      // Subscribe to role-based announcements
      subscribe('/topic/announcements/ALL_USERS', 'announcements-all', addAnnouncement)

      if (userRole.toUpperCase() === 'LEARNER') {
        subscribe('/topic/announcements/LEARNERS_ONLY', 'announcements-learners', addAnnouncement)
      }

      if (userRole.toUpperCase() === 'MANAGER') {
        subscribe('/topic/announcements/MANAGERS_ONLY', 'announcements-managers', addAnnouncement)
      }

      return () => {
        unsubscribe('announcements-all')
        unsubscribe('announcements-learners')
        unsubscribe('announcements-managers')
      }
    }
  }, [isConnected, userRole, subscribe, unsubscribe, addAnnouncement])

  return {
    announcements,
    addAnnouncement
  }
} 