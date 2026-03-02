/**
 * Admin WebSocket Connector
 * 
 * WebSocket connector for real-time updates in the Admin Template.
 */

import { getAuthToken } from './adminConnector';

type WebSocketHandler = (data: unknown) => void;
type WebSocketEventType = 'connect' | 'disconnect' | 'error' | 'alert' | 'notification' | 'health' | 'audit' | 'security' | 'message';

interface WebSocketMessage {
  type: WebSocketEventType;
  payload: unknown;
  timestamp: string;
}

interface WebSocketConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class AdminWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Map<WebSocketEventType, Set<WebSocketHandler>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isManualDisconnect = false;
  private config: Required<WebSocketConfig>;

  constructor(config: WebSocketConfig = {}) {
    this.config = {
      url: config.url || import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      heartbeatInterval: config.heartbeatInterval || 30000,
    };

    // Initialize handler sets
    this.handlers.set('connect', new Set());
    this.handlers.set('disconnect', new Set());
    this.handlers.set('error', new Set());
    this.handlers.set('alert', new Set());
    this.handlers.set('notification', new Set());
    this.handlers.set('health', new Set());
    this.handlers.set('audit', new Set());
    this.handlers.set('security', new Set());
    this.handlers.set('message', new Set());
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;
      this.isManualDisconnect = false;

      try {
        const token = getAuthToken();
        const url = token ? `${this.config.url}/admin?token=${token}` : this.config.url;
        
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connect', null);
          resolve();
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit('disconnect', { code: event.code, reason: event.reason });
          
          if (!this.isManualDisconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe(event: WebSocketEventType, handler: WebSocketHandler): () => void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.add(handler);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(event, handler);
    };
  }

  /**
   * Unsubscribe from a specific event type
   */
  unsubscribe(event: WebSocketEventType, handler: WebSocketHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Subscribe to all events
   */
  subscribeAll(handler: WebSocketHandler): () => void {
    const events: WebSocketEventType[] = [
      'connect', 'disconnect', 'error', 'alert', 
      'notification', 'health', 'audit', 'security', 'message'
    ];

    events.forEach(event => {
      this.subscribe(event, handler);
    });

    return () => {
      events.forEach(event => {
        this.unsubscribe(event, handler);
      });
    };
  }

  /**
   * Send a message to the server
   */
  send(type: string, payload: unknown): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected. Message not sent.');
      return;
    }

    const message: WebSocketMessage = {
      type: type as WebSocketEventType,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Subscribe to specific channels
   */
  subscribeToChannels(channels: string[]): void {
    this.send('subscribe', { channels });
  }

  /**
   * Unsubscribe from specific channels
   */
  unsubscribeFromChannels(channels: string[]): void {
    this.send('unsubscribe', { channels });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private handleMessage(message: WebSocketMessage): void {
    this.emit('message', message);
    
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.payload);
        } catch (e) {
          console.error(`Error in WebSocket handler for ${message.type}:`, e);
        }
      });
    }
  }

  private emit(event: WebSocketEventType, data: unknown): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (e) {
          console.error(`Error in WebSocket emit for ${event}:`, e);
        }
      });
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(console.error);
    }, Math.min(delay, 30000));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.send('ping', { timestamp: Date.now() });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// ============================================
// PRE-INSTANTIATED CONNECTOR
// ============================================

let adminWS: AdminWebSocket | null = null;

export function getAdminWebSocket(): AdminWebSocket {
  if (!adminWS) {
    adminWS = new AdminWebSocket();
  }
  return adminWS;
}

export function createAdminWebSocket(config?: WebSocketConfig): AdminWebSocket {
  return new AdminWebSocket(config);
}

// ============================================
// SPECIALIZED HOOKS
// ============================================

/**
 * Hook for real-time alerts
 */
export function useRealtimeAlerts() {
  const ws = getAdminWebSocket();
  
  return {
    subscribe: (handler: WebSocketHandler) => ws.subscribe('alert', handler),
    unsubscribe: (handler: WebSocketHandler) => ws.unsubscribe('alert', handler),
    markAsRead: (alertId: string) => ws.send('mark_alert_read', { alertId }),
    dismiss: (alertId: string) => ws.send('dismiss_alert', { alertId }),
  };
}

/**
 * Hook for real-time notifications
 */
export function useRealtimeNotifications() {
  const ws = getAdminWebSocket();
  
  return {
    subscribe: (handler: WebSocketHandler) => ws.subscribe('notification', handler),
    unsubscribe: (handler: WebSocketHandler) => ws.unsubscribe('notification', handler),
    markAsRead: (notificationId: string) => ws.send('mark_notification_read', { notificationId }),
    dismiss: (notificationId: string) => ws.send('dismiss_notification', { notificationId }),
  };
}

/**
 * Hook for real-time health updates
 */
export function useRealtimeHealth() {
  const ws = getAdminWebSocket();
  
  return {
    subscribe: (handler: WebSocketHandler) => ws.subscribe('health', handler),
    unsubscribe: (handler: WebSocketHandler) => ws.unsubscribe('health', handler),
  };
}

/**
 * Hook for real-time audit updates
 */
export function useRealtimeAudit() {
  const ws = getAdminWebSocket();
  
  return {
    subscribe: (handler: WebSocketHandler) => ws.subscribe('audit', handler),
    unsubscribe: (handler: WebSocketHandler) => ws.unsubscribe('audit', handler),
  };
}

/**
 * Hook for real-time security updates
 */
export function useRealtimeSecurity() {
  const ws = getAdminWebSocket();
  
  return {
    subscribe: (handler: WebSocketHandler) => ws.subscribe('security', handler),
    unsubscribe: (handler: WebSocketHandler) => ws.unsubscribe('security', handler),
  };
}

// ============================================
// EXPORT
// ============================================

export { AdminWebSocket, type WebSocketConfig, type WebSocketHandler, type WebSocketEventType };
export default AdminWebSocket;
