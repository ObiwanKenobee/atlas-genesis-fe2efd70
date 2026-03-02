/**
 * RVE WebSocket Service
 * Real-time updates for prices, trades, and notifications
 */

// ============================================================================
// TYPES
// ============================================================================

export type WSMessageType = 
  | 'price_update'
  | 'trade_executed'
  | 'order_update'
  | 'governance_vote'
  | 'verification_complete'
  | 'notification'
  | 'system_alert';

export interface WSMessage<T = any> {
  type: WSMessageType;
  channel: string;
  data: T;
  timestamp: string;
}

export interface PriceUpdate {
  assetId: string;
  price: number;
  change24h: number;
  volume24h: number;
}

export interface TradeExecuted {
  id: string;
  assetId: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  timestamp: string;
}

export interface OrderUpdate {
  orderId: string;
  status: 'pending' | 'filled' | 'cancelled';
  filledAmount?: number;
}

// ============================================================================
// WEBSOCKET SERVICE
// ============================================================================

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private subscriptions: Set<string> = new Set();
  private isConnecting = false;

  constructor(url: string = import.meta.env?.VITE_WS_URL || 'wss://ws.rve.network') {
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        const wsUrl = token ? `${this.url}?token=${token}` : this.url;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          
          // Re-subscribe to channels
          this.subscriptions.forEach(channel => {
            this.send('subscribe', { channel });
          });

          resolve();
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          
          // Attempt reconnection
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
            
            setTimeout(() => {
              this.connect(token).catch(console.error);
            }, delay);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.subscriptions.clear();
  }

  /**
   * Send message to server
   */
  private send(type: string, data: any): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    const message = {
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Subscribe to channel
   */
  subscribe(channel: string, handler: (data: any) => void): () => void {
    // Add to subscriptions
    this.subscriptions.add(channel);

    // Add handler
    if (!this.messageHandlers.has(channel)) {
      this.messageHandlers.set(channel, new Set());
    }
    this.messageHandlers.get(channel)!.add(handler);

    // Send subscribe message if connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.send('subscribe', { channel });
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channel, handler);
    };
  }

  /**
   * Unsubscribe from channel
   */
  unsubscribe(channel: string, handler?: (data: any) => void): void {
    if (handler) {
      this.messageHandlers.get(channel)?.delete(handler);
      
      // If no more handlers, unsubscribe from channel
      if (this.messageHandlers.get(channel)?.size === 0) {
        this.messageHandlers.delete(channel);
        this.subscriptions.delete(channel);
        
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.send('unsubscribe', { channel });
        }
      }
    } else {
      // Remove all handlers for channel
      this.messageHandlers.delete(channel);
      this.subscriptions.delete(channel);
      
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('unsubscribe', { channel });
      }
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    try {
      const message: WSMessage = JSON.parse(data);

      // Handle heartbeat
      if (message.type === 'ping' as any) {
        this.send('pong', {});
        return;
      }

      // Emit to channel handlers
      const handlers = this.messageHandlers.get(message.channel);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message.data);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });
      }

      // Emit to type-specific handlers
      const typeHandlers = this.messageHandlers.get(message.type);
      if (typeHandlers) {
        typeHandlers.forEach(handler => {
          try {
            handler(message.data);
          } catch (error) {
            console.error('Error in type handler:', error);
          }
        });
      }

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Subscribe to asset prices
   */
  subscribeToPrices(assetIds: string[], handler: (update: PriceUpdate) => void): () => void {
    return this.subscribe(`prices:${assetIds.join(',')}`, handler);
  }

  /**
   * Subscribe to trades
   */
  subscribeToTrades(assetId: string, handler: (trade: TradeExecuted) => void): () => void {
    return this.subscribe(`trades:${assetId}`, handler);
  }

  /**
   * Subscribe to user orders
   */
  subscribeToOrders(userId: string, handler: (order: OrderUpdate) => void): () => void {
    return this.subscribe(`orders:${userId}`, handler);
  }

  /**
   * Subscribe to governance events
   */
  subscribeToGovernance(handler: (event: any) => void): () => void {
    return this.subscribe('governance', handler);
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(userId: string, handler: (notification: any) => void): () => void {
    return this.subscribe(`notifications:${userId}`, handler);
  }
}

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private unreadCount = 0;

  constructor(private ws: WebSocketService) {}

  /**
   * Initialize notification service
   */
  init(userId: string): () => void {
    return this.ws.subscribeToNotifications(userId, (notification) => {
      this.addNotification(notification);
    });
  }

  /**
   * Add notification
   */
  private addNotification(notification: Notification): void {
    this.notifications.unshift(notification);
    
    if (!notification.read) {
      this.unreadCount++;
    }

    // Limit to last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.notifyListeners();

    // Show browser notification if permitted
    this.showBrowserNotification(notification);
  }

  /**
   * Show browser notification
   */
  private async showBrowserNotification(notification: Notification): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        badge: '/logo.png',
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          badge: '/logo.png',
        });
      }
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.notifyListeners();
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
    this.notifyListeners();
  }

  /**
   * Get all notifications
   */
  getNotifications(): Notification[] {
    return this.notifications;
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.unreadCount;
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }
}

// Singleton instances
export const wsService = new WebSocketService();
export const notificationService = new NotificationService(wsService);
