import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

class WebSocketService {
  private client: Client | null = null
  private subscribers: Map<string, (data: any) => void> = new Map()
  private subscriptions: Map<string, StompSubscription> = new Map()

  connect(token: string, onConnect?: () => void) {
    if (this.client?.connected) {
      onConnect && onConnect()
      return
    }
    const wsUrl = `http://localhost:8080/ws?token=${encodeURIComponent(token)}`
    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        onConnect && onConnect()
      },
      onDisconnect: () => {
        this.subscriptions.forEach(sub => sub.unsubscribe())
        this.subscriptions.clear()
      },
    })
    this.client.activate()
  }

  disconnect() {
    if (this.client?.active) {
      this.client.deactivate()
      this.client = null
      this.subscribers.clear()
      this.subscriptions.clear()
    }
  }

  /**
   * Đăng ký nhận thông báo từ topic theo vai trò user
   * @param userRole Vai trò của user: 'ALL', 'LEARNER', 'MANAGER', ...
   */
  subscribeAnnouncements(userRole: string) {
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
        console.log('subscribeTopic : ', '/topic/announcements/MANAGERS_ONLY')
      }
    }
  }

  public subscribeTopic(destination: string, event: string) {
    if (!this.client?.connected) return

    // Hủy đăng ký cũ nếu có
    this.subscriptions.get(event)?.unsubscribe()
    this.subscriptions.delete(event)

    const subscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        let data = message.body
        try {
          data = JSON.parse(message.body)
        } catch {}
        this.notifySubscribers(event, data)
      }
    )
    this.subscriptions.set(event, subscription)
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
}

export const websocketService = new WebSocketService()
