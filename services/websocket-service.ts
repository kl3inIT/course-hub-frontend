import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

class WebSocketService {
  private client: Client | null = null
  private subscribers: Map<string, (data: any) => void> = new Map()
  private subscriptions: Map<string, StompSubscription> = new Map()
  private currentToken: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000

  private getWebSocketUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    // Development
    if (
      !apiUrl ||
      apiUrl.includes('localhost') ||
      apiUrl.includes('127.0.0.1')
    ) {
      return 'http://localhost:8080/ws'
    }

    // Production - SockJS needs HTTP/HTTPS URLs, not WS/WSS
    // It will auto-upgrade to WebSocket (WSS) if available
    if (apiUrl.startsWith('https://')) {
      return apiUrl + '/ws' // Keep https:// for SockJS
    }

    // Fallback for HTTP
    if (apiUrl.startsWith('http://')) {
      return apiUrl + '/ws' // Keep http:// for SockJS
    }

    // Default fallback - use HTTPS for production
    return 'https://api.coursehub.io.vn/ws'
  }

  connect(token: string, onConnect?: () => void) {
    if (this.client?.connected) {
      onConnect && onConnect()
      return
    }

    this.currentToken = token
    const wsUrl = this.getWebSocketUrl()
    console.log('🔌 Connecting to WebSocket:', wsUrl)

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(wsUrl, null, {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
          timeout: 20000,
        }),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: this.reconnectInterval,
      onConnect: frame => {
        console.log('✅ WebSocket Connected:', frame)
        this.reconnectAttempts = 0
        onConnect && onConnect()
      },
      onDisconnect: () => {
        console.log('🔌 WebSocket Disconnected')
        this.subscriptions.forEach(sub => sub.unsubscribe())
        this.subscriptions.clear()
        this.handleReconnect()
      },
      onStompError: frame => {
        console.error('❌ STOMP Error:', frame)
        this.handleReconnect()
      },
      onWebSocketError: error => {
        console.error('❌ WebSocket Error:', error)
        this.handleReconnect()
      },
      // Disable debug in production
      debug: process.env.NODE_ENV === 'development' ? console.log : () => {},
    })

    this.client.activate()
  }

  private handleReconnect() {
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      this.currentToken
    ) {
      this.reconnectAttempts++
      console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`)

      setTimeout(() => {
        if (!this.client?.connected && this.currentToken) {
          this.connect(this.currentToken)
        }
      }, this.reconnectInterval * this.reconnectAttempts)
    } else {
      console.error('❌ Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.client?.active) {
      this.client.deactivate()
      this.client = null
      this.subscribers.clear()
      this.subscriptions.clear()
      this.currentToken = null
      this.reconnectAttempts = 0
    }
  }

  /**
   * Đăng ký nhận thông báo từ topic theo vai trò user
   * @param userRole Vai trò của user: 'ALL', 'LEARNER', 'MANAGER', ...
   */
  subscribeAnnouncements(userRole: string) {
    if (userRole && userRole.toUpperCase() !== 'ADMIN') {
      this.subscribeTopic('/topic/announcements/ALL_USERS', 'announcement-all')
      console.log('userRole:', userRole)

      if (userRole.toUpperCase() === 'LEARNER') {
        this.subscribeTopic(
          '/topic/announcements/LEARNERS_ONLY',
          'announcement-learners'
        )
        console.log('subscribeTopic:', '/topic/announcements/LEARNERS_ONLY')
      }

      if (userRole.toUpperCase() === 'MANAGER') {
        this.subscribeTopic(
          '/topic/announcements/MANAGERS_ONLY',
          'announcement-managers'
        )
        console.log('subscribeTopic:', '/topic/announcements/MANAGERS_ONLY')
      }
    }
  }
  /**
   * Đăng ký nhận thông báo cá nhân (notification) cho user
   * Khi subscribe thành công sẽ log: 📡 Subscribed to: /user/queue/notifications
   * Để nhận notification, hãy dùng:
   *   websocketService.addSubscriber('user-notification', (data) => { ... })
   */
  subscribeUserNotification() {
    this.subscribeTopic('/user/queue/notifications', 'user-notification')
    console.log('Đã gọi subscribeUserNotification, chờ log 📡 Subscribed to: /user/queue/notifications')
  }

  public subscribeTopic(destination: string, event: string) {
    if (!this.client?.connected) {
      console.warn(
        '⚠️ WebSocket not connected, cannot subscribe to:',
        destination
      )
      return
    }

    // Hủy đăng ký cũ nếu có
    this.subscriptions.get(event)?.unsubscribe()
    this.subscriptions.delete(event)

    try {
      const subscription = this.client.subscribe(
        destination,
        (message: IMessage) => {
          let data = message.body
          try {
            data = JSON.parse(message.body)
          } catch (e) {
            // Keep as string if not JSON
          }
          this.notifySubscribers(event, data)
        }
      )
      this.subscriptions.set(event, subscription)
      console.log(`📡 Subscribed to: ${destination}`)
    } catch (error) {
      console.error(`❌ Failed to subscribe to ${destination}:`, error)
    }
  }

  addSubscriber(event: string, callback: (data: any) => void) {
    this.subscribers.set(event, callback)
  }

  removeSubscriber(event: string) {
    this.subscribers.delete(event)
    this.subscriptions.get(event)?.unsubscribe()
    this.subscriptions.delete(event)
  }

  private notifySubscribers(event: string, data: any) {
    const callback = this.subscribers.get(event)
    callback && callback(data)
  }

  // Utility methods
  isConnected(): boolean {
    return this.client?.connected || false
  }

  getConnectionState(): string {
    if (!this.client) return 'NOT_INITIALIZED'
    if (this.client.connected) return 'CONNECTED'
    if (this.client.active) return 'CONNECTING'
    return 'DISCONNECTED'
  }
}

export const websocketService = new WebSocketService()
