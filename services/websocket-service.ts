import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

class WebSocketService {
  private client: Client | null = null
  private subscribers: Map<string, (data: any) => void> = new Map()
  private subscriptions: Map<string, StompSubscription> = new Map()

  connect(userId: string, token: string, onConnect?: () => void) {
    if (this.client?.connected) {
      if (onConnect) onConnect()
      return
    }

    const wsUrl = `http://localhost:8080/ws?token=${encodeURIComponent(token)}`

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        if (onConnect) onConnect()
      },
      onDisconnect: () => {
        this.subscriptions.forEach(sub => sub.unsubscribe())
        this.subscriptions.clear()
      },
    })

    try {
      this.client.activate()
    } catch (_error) {
      // Failed to connect to WebSocket
    }
  }

  disconnect() {
    if (this.client?.active) {
      this.client.deactivate()
      this.client = null
      this.subscribers.clear()
      this.subscriptions.clear()
    }
  }

  subscribe(destination: string, event: string) {
    if (!this.client?.connected) {
      return
    }

    if (this.subscriptions.has(event)) {
      this.subscriptions.get(event)?.unsubscribe()
      this.subscriptions.delete(event)
    }

    const subscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        try {
          const data = JSON.parse(message.body)
          this.notifySubscribers(event, data)
        } catch (_e) {
          // Error parsing message.body
          this.notifySubscribers(event, message.body)
        }
      }
    )

    this.subscriptions.set(event, subscription)
  }

  addSubscriber(event: string, callback: (data: any) => void) {
    this.subscribers.set(event, callback)
  }

  removeSubscriber(event: string) {
    this.subscribers.delete(event)
    if (this.subscriptions.has(event)) {
      this.subscriptions.get(event)?.unsubscribe()
      this.subscriptions.delete(event)
    }
  }

  private notifySubscribers(event: string, data: any) {
    const callback = this.subscribers.get(event)
    if (callback) {
      callback(data)
    } else {
      // No subscriber found for event
    }
  }
}

export const websocketService = new WebSocketService()
