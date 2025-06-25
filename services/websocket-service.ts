// HTTP-based real-time service (replaces WebSocket)
import { httpClient } from './http-client'

interface EventListener {
  event: string
  callback: (data: any) => void
}

class HttpRealtimeService {
  private listeners: Map<string, (data: any) => void> = new Map()
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()
  private isConnected = false

  connect(userId: string, token: string, onConnect?: () => void) {
    if (this.isConnected) {
      if (onConnect) onConnect()
      return
    }

    // Simulate connection - in HTTP world, we're always "connected"
    this.isConnected = true
    if (onConnect) onConnect()
  }

  disconnect() {
    this.isConnected = false
    this.listeners.clear()
    this.pollingIntervals.forEach(interval => clearInterval(interval))
    this.pollingIntervals.clear()
  }

  subscribe(endpoint: string, event: string, pollInterval = 5000) {
    if (!this.isConnected) {
      return
    }

    // Clear existing polling for this event
    if (this.pollingIntervals.has(event)) {
      clearInterval(this.pollingIntervals.get(event)!)
      this.pollingIntervals.delete(event)
    }

    // Start HTTP polling for this endpoint
    const interval = setInterval(async () => {
      try {
        const response = await httpClient.get(endpoint)
        this.notifyListeners(event, response.data)
      } catch (error) {
        // Handle polling errors silently or emit error event
        this.notifyListeners(`${event}_error`, error)
      }
    }, pollInterval)

    this.pollingIntervals.set(event, interval)
  }

  addSubscriber(event: string, callback: (data: any) => void) {
    this.listeners.set(event, callback)
  }

  removeSubscriber(event: string) {
    this.listeners.delete(event)
    if (this.pollingIntervals.has(event)) {
      clearInterval(this.pollingIntervals.get(event)!)
      this.pollingIntervals.delete(event)
    }
  }

  // Emit events manually (for immediate updates after actions)
  emit(event: string, data: any) {
    this.notifyListeners(event, data)
  }

  private notifyListeners(event: string, data: any) {
    const callback = this.listeners.get(event)
    if (callback) {
      callback(data)
    }
  }
}

export const websocketService = new HttpRealtimeService()

