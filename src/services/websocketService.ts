// WebSocket Service for Real-Time Analytics Updates
import { WebSocketMessage, MetricUpdatePayload } from '../types/analytics';

type MessageHandler = (message: WebSocketMessage) => void;
type ConnectionHandler = () => void;

interface WebSocketServiceConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionHandlers: { onConnect: ConnectionHandler[]; onDisconnect: ConnectionHandler[] } = {
    onConnect: [],
    onDisconnect: [],
  };
  private isConnected: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(config: WebSocketServiceConfig) {
    this.url = config.url;
    this.reconnectInterval = config.reconnectInterval || 5000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;
  }

  // Connect to WebSocket server
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.connectionHandlers.onConnect.forEach((handler) => handler());
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();
        this.connectionHandlers.onDisconnect.forEach((handler) => handler());
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
  }

  // Send message to server
  send(type: string, payload: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload, timestamp: new Date().toISOString() }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  // Subscribe to specific message types
  subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  // Subscribe to all messages
  subscribeAll(handler: MessageHandler): () => void {
    return this.subscribe('*', handler);
  }

  // Register connection handlers
  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.onConnect.push(handler);
    return () => {
      this.connectionHandlers.onConnect = this.connectionHandlers.onConnect.filter((h) => h !== handler);
    };
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.onDisconnect.push(handler);
    return () => {
      this.connectionHandlers.onDisconnect = this.connectionHandlers.onDisconnect.filter((h) => h !== handler);
    };
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Private methods
  private handleMessage(message: WebSocketMessage): void {
    // Handle specific message types
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }

    // Also notify wildcard handlers
    const wildcardHandlers = this.messageHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(message));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send('ping', { timestamp: Date.now() });
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Analytics-specific WebSocket service
class AnalyticsWebSocketService {
  private wsService: WebSocketService | null = null;
  private metricUpdateHandlers: Set<(payload: MetricUpdatePayload) => void> = new Set();
  private alertHandlers: Set<(alert: { type: string; message: string; severity: string }) => void> = new Set();
  private unsubscribeCallbacks: (() => void)[] = [];

  connect(): void {
    const wsUrl = `ws://${window.location.host}/ws/analytics`;
    this.wsService = new WebSocketService({ url: wsUrl });

    // Subscribe to metric updates
    const unsubMetric = this.wsService.subscribe('metric_update', (message) => {
      this.metricUpdateHandlers.forEach((handler) => handler(message.payload as MetricUpdatePayload));
    });
    this.unsubscribeCallbacks.push(unsubMetric);

    // Subscribe to alerts
    const unsubAlert = this.wsService.subscribe('alert', (message) => {
      this.alertHandlers.forEach((handler) => handler(message.payload as { type: string; message: string; severity: string }));
    });
    this.unsubscribeCallbacks.push(unsubAlert);

    this.wsService.connect();
  }

  disconnect(): void {
    this.unsubscribeCallbacks.forEach((cb) => cb());
    this.unsubscribeCallbacks = [];
    this.wsService?.disconnect();
  }

  onMetricUpdate(handler: (payload: MetricUpdatePayload) => void): () => void {
    this.metricUpdateHandlers.add(handler);
    return () => this.metricUpdateHandlers.delete(handler);
  }

  onAlert(handler: (alert: { type: string; message: string; severity: string }) => void): () => void {
    this.alertHandlers.add(handler);
    return () => this.alertHandlers.delete(handler);
  }

  getConnectionStatus(): boolean {
    return this.wsService?.getConnectionStatus() || false;
  }
}

// Singleton instance for analytics
export const analyticsWsService = new AnalyticsWebSocketService();

// Export WebSocketService class for other uses
export { WebSocketService };
export default WebSocketService;
