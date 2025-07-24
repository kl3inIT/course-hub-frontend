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
  private currentRole: string | null = null // <== lưu lại role để dùng lại khi reconnect

  private getWebSocketUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (
      !apiUrl ||
      apiUrl.includes('localhost') ||
      apiUrl.includes('127.0.0.1')
    ) {
      return 'http://localhost:8080/ws'
    }

    if (apiUrl.startsWith('https://') || apiUrl.startsWith('http://')) {
      return apiUrl + '/ws'
    }

    return 'https://api.coursehub.io.vn/ws'
  }

  connect(token: string, userRole: string, onConnect?: () => void) {
    if (this.client?.connected) {
      this.subscribeAnnouncements(userRole)
      this.subscribeUserNotification()
      onConnect && onConnect()
      return
    }

    this.currentToken = token
    this.currentRole = userRole
    const wsUrl = this.getWebSocketUrl() + `?token=${token}`

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(wsUrl, null, {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
          timeout: 20000,
        }),
      reconnectDelay: this.reconnectInterval,
      onConnect: frame => {
        this.reconnectAttempts = 0
        this.subscribeAnnouncements(userRole)
        this.subscribeUserNotification()
        onConnect && onConnect()
      },
      onDisconnect: () => {
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
      debug: process.env.NODE_ENV === 'development' ? console.log : () => {},
    })

    this.client.activate()
  }

  private handleReconnect() {
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      this.currentToken &&
      this.currentRole
    ) {
      this.reconnectAttempts++

      setTimeout(() => {
        if (!this.client?.connected && this.currentToken && this.currentRole) {
          this.connect(this.currentToken, this.currentRole)
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
      this.currentRole = null
      this.reconnectAttempts = 0
    }
  }

  subscribeAnnouncements(userRole: string) {
    console.log('[WS] Subscribing announcements for role:', userRole)

    if (userRole && userRole.toUpperCase() !== 'ADMIN') {
      this.subscribeTopic('/topic/announcements/ALL_USERS', 'announcement-all')

      if (userRole.toUpperCase() === 'LEARNER') {
        this.subscribeTopic(
          '/topic/announcements/LEARNERS_ONLY',
          'announcement-learners'
        )
      }

      if (userRole.toUpperCase() === 'MANAGER') {
        this.subscribeTopic(
          '/topic/announcements/MANAGERS_ONLY',
          'announcement-managers'
        )
      }
    }
  }

  subscribeUserNotification() {
    this.subscribeTopic('/user/queue/notifications', 'user-notification')
  }

  public subscribeTopic(destination: string, event: string) {
    if (!this.client?.connected) {
      console.warn(
        '⚠️ WebSocket not connected, cannot subscribe to:',
        destination
      )
      return
    }

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
