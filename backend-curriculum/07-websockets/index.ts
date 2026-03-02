/**
 * Module 7: WebSockets and Real-Time Systems
 * 
 * WebSocket implementation, Socket.io integration, pub/sub patterns
 */

// ============================================================================
// 7.1 WEBSOCKET SERVER
// ============================================================================

import { Server as HttpServer } from "http";

interface SocketUser {
  id: string;
  socketId: string;
  userId: string;
  rooms: Set<string>;
  connectedAt: Date;
}

interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  timestamp: Date;
}

interface TypingIndicator {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

// Event handlers type
type SocketEventHandler = (socket: WebSocket, data?: unknown) => void;

class WebSocketServer {
  private wss: WebSocket.Server;
  private users: Map<string, SocketUser> = new Map();
  private userSockets: Map<string, Set<string>> = new Map();
  private messageHistory: Map<string, ChatMessage[]> = new Map();
  
  constructor(server: HttpServer) {
    this.wss = new WebSocket.Server({ server });
    this.setupServer();
  }
  
  private setupServer(): void {
    this.wss.on("connection", (socket) => {
      const userId = this.authenticate(socket);
      if (!userId) {
        socket.close(4001, "Authentication required");
        return;
      }
      
      this.registerSocket(socket, userId);
      this.setupEventHandlers(socket, userId);
    });
  }
  
  private authenticate(socket: WebSocket): string | null {
    // In production, extract and verify token from headers or query
    return "anonymous-user";
  }
  
  private registerSocket(socket: WebSocket, userId: string): void {
    const socketId = this.generateId();
    (socket as any).id = socketId;
    (socket as any).userId = userId;
    
    const user: SocketUser = {
      id: socketId,
      socketId,
      userId,
      rooms: new Set(),
      connectedAt: new Date()
    };
    
    this.users.set(socketId, user);
    
    const userSocketIds = this.userSockets.get(userId) ?? new Set();
    userSocketIds.add(socketId);
    this.userSockets.set(userId, userSocketIds);
    
    // Broadcast online status
    this.broadcast("user:online", { userId });
  }
  
  private setupEventHandlers(socket: WebSocket, userId: string): void {
    socket.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(socket, userId, message);
      } catch (error) {
        console.error("Invalid message format:", error);
      }
    });
    
    socket.on("close", () => {
      this.unregisterSocket(socket);
    });
    
    socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.unregisterSocket(socket);
    });
  }
  
  private handleMessage(socket: WebSocket, userId: string, message: {
    type: string;
    payload: unknown;
  }): void {
    switch (message.type) {
      case "join:room":
        this.handleJoinRoom(socket, userId, message.payload as { roomId: string });
        break;
        
      case "leave:room":
        this.handleLeaveRoom(socket, userId, message.payload as { roomId: string });
        break;
        
      case "message:send":
        this.handleMessageSend(socket, userId, message.payload as {
          roomId: string;
          content: string;
        });
        break;
        
      case "typing:start":
        this.handleTyping(userId, message.payload as { roomId: string });
        break;
        
      case "typing:stop":
        this.handleStopTyping(userId, message.payload as { roomId: string });
        break;
        
      case "ping":
        this.send(socket, "pong", { timestamp: Date.now() });
        break;
    }
  }
  
  private handleJoinRoom(socket: WebSocket, userId: string, payload: { roomId: string }): void {
    const { roomId } = payload;
    const user = this.users.get((socket as any).id);
    
    if (user) {
      user.rooms.add(roomId);
    }
    
    // Send message history
    const history = this.messageHistory.get(roomId) ?? [];
    this.send(socket, "room:history", { roomId, messages: history.slice(-50) });
    
    // Broadcast join
    this.broadcastToRoom(roomId, "user:joined", {
      roomId,
      userId,
      timestamp: new Date()
    }, userId);
  }
  
  private handleLeaveRoom(socket: WebSocket, userId: string, payload: { roomId: string }): void {
    const { roomId } = payload;
    const user = this.users.get((socket as any).id);
    
    if (user) {
      user.rooms.delete(roomId);
    }
    
    // Broadcast leave
    this.broadcastToRoom(roomId, "user:left", {
      roomId,
      userId,
      timestamp: new Date()
    }, userId);
  }
  
  private handleMessageSend(socket: WebSocket, userId: string, payload: {
    roomId: string;
    content: string;
  }): void {
    const { roomId, content } = payload;
    
    const message: ChatMessage = {
      id: this.generateId(),
      roomId,
      userId,
      content,
      timestamp: new Date()
    };
    
    // Store in history
    const history = this.messageHistory.get(roomId) ?? [];
    history.push(message);
    if (history.length > 1000) {
      history.shift();
    }
    this.messageHistory.set(roomId, history);
    
    // Broadcast to room
    this.broadcastToRoom(roomId, "message:received", message);
  }
  
  private handleTyping(userId: string, payload: { roomId: string }): void {
    const { roomId } = payload;
    
    this.broadcastToRoom(roomId, "user:typing", {
      roomId,
      userId,
      isTyping: true
    }, userId);
  }
  
  private handleStopTyping(userId: string, payload: { roomId: string }): void {
    const { roomId } = payload;
    
    this.broadcastToRoom(roomId, "user:stopped-typing", {
      roomId,
      userId,
      isTyping: false
    }, userId);
  }
  
  private unregisterSocket(socket: WebSocket): void {
    const socketId = (socket as any).id;
    const user = this.users.get(socketId);
    
    if (!user) return;
    
    // Notify rooms
    for (const roomId of user.rooms) {
      this.broadcastToRoom(roomId, "user:left", {
        roomId,
        userId: user.userId,
        timestamp: new Date()
      });
    }
    
    // Remove from maps
    this.users.delete(socketId);
    
    const userSocketIds = this.userSockets.get(user.userId);
    if (userSocketIds) {
      userSocketIds.delete(socketId);
      if (userSocketIds.size === 0) {
        this.userSockets.delete(user.userId);
        // Broadcast offline
        this.broadcast("user:offline", { userId: user.userId });
      }
    }
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  send(socket: WebSocket, type: string, payload: unknown): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    }
  }
  
  broadcast(type: string, payload: unknown): void {
    const message = JSON.stringify({ type, payload });
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  broadcastToRoom(roomId: string, type: string, payload: unknown, excludeUserId?: string): void {
    const message = JSON.stringify({ type, payload });
    
    this.users.forEach((user) => {
      if (user.userId !== excludeUserId && user.rooms.has(roomId)) {
        const client = this.getClientBySocketId(user.socketId);
        if (client?.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      }
    });
  }
  
  private getClientBySocketId(socketId: string): WebSocket | null {
    // In production, maintain a map of socketId -> WebSocket
    return null;
  }
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }
  
  getRoomUsers(roomId: string): string[] {
    const users: string[] = [];
    
    this.users.forEach((user) => {
      if (user.rooms.has(roomId)) {
        users.push(user.userId);
      }
    });
    
    return users;
  }
  
  sendToUser(userId: string, type: string, payload: unknown): void {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds) return;
    
    const message = JSON.stringify({ type, payload });
    
    socketIds.forEach((socketId) => {
      const client = this.getClientBySocketId(socketId);
      if (client?.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
  
  close(): void {
    this.wss.clients.forEach((client) => {
      client.close(1001, "Server shutting down");
    });
    this.wss.close();
  }
}

// ============================================================================
// 7.2 SOCKET.IO IMPLEMENTATION (Commented for reference)
// ============================================================================

/*
import { Server as SocketIOServer, Socket } from "socket.io";

class SocketIOServer {
  private io: SocketIOServer;
  
  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }
  
  private setupMiddleware(): void {
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }
      // Verify token and attach user
      (socket as any).userId = "verified-user";
      next();
    });
  }
  
  private setupEventHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      const userId = (socket as any).userId;
      
      socket.on("join:room", (roomId: string) => {
        socket.join(`room:${roomId}`);
      });
      
      socket.on("message:send", (data: { roomId: string; content: string }) => {
        this.io.to(`room:${data.roomId}`).emit("message:received", {
          id: Date.now().toString(),
          roomId: data.roomId,
          content: data.content,
          userId
        });
      });
      
      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected`);
      });
    });
  }
}
*/

// ============================================================================
// 7.3 PRESENCE SYSTEM
// ============================================================================

interface PresenceState {
  online: Set<string>;
  away: Set<string>;
  lastSeen: Map<string, Date>;
}

class PresenceService {
  private state: PresenceState = {
    online: new Set(),
    away: new Set(),
    lastSeen: new Map()
  };
  
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly heartbeatTimeout = 30000; // 30 seconds
  
  constructor() {
    this.startHeartbeat();
  }
  
  /**
   * Mark user as online
   */
  setOnline(userId: string): void {
    this.state.online.add(userId);
    this.state.away.delete(userId);
    this.state.lastSeen.set(userId, new Date());
  }
  
  /**
   * Mark user as away
   */
  setAway(userId: string): void {
    this.state.away.add(userId);
    this.state.lastSeen.set(userId, new Date());
  }
  
  /**
   * Mark user as offline
   */
  setOffline(userId: string): void {
    this.state.online.delete(userId);
    this.state.away.delete(userId);
  }
  
  /**
   * Check if user is online
   */
  isOnline(userId: string): boolean {
    return this.state.online.has(userId);
  }
  
  /**
   * Check if user is away
   */
  isAway(userId: string): boolean {
    return this.state.away.has(userId);
  }
  
  /**
   * Get online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.state.online);
  }
  
  /**
   * Get user's last seen time
   */
  getLastSeen(userId: string): Date | null {
    return this.state.lastSeen.get(userId) ?? null;
  }
  
  /**
   * Start heartbeat to detect stale connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const staleUsers: string[] = [];
      
      this.state.online.forEach((userId) => {
        const lastSeen = this.state.lastSeen.get(userId);
        if (lastSeen && now - lastSeen.getTime() > this.heartbeatTimeout) {
          staleUsers.push(userId);
        }
      });
      
      staleUsers.forEach((userId) => {
        this.setAway(userId);
      });
    }, 10000);
  }
  
  /**
   * Handle user heartbeat
   */
  handleHeartbeat(userId: string): void {
    this.state.lastSeen.set(userId, new Date());
    if (!this.state.online.has(userId)) {
      this.state.online.add(userId);
    }
    this.state.away.delete(userId);
  }
  
  /**
   * Stop the presence service
   */
  stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// ============================================================================
// 7.4 REAL-TIME COLLABORATION (Document Sync)
// ============================================================================

interface DocumentOperation {
  id: string;
  userId: string;
  type: "insert" | "delete" | "replace";
  position: number;
  content?: string;
  length?: number;
  timestamp: number;
}

interface DocumentState {
  id: string;
  content: string;
  version: number;
  operations: DocumentOperation[];
}

class DocumentSync {
  private documents: Map<string, DocumentState> = new Map();
  private pendingOperations: Map<string, DocumentOperation[]> = new Map();
  
  /**
   * Create or get document
   */
  getOrCreate(docId: string, initialContent: string = ""): DocumentState {
    let doc = this.documents.get(docId);
    
    if (!doc) {
      doc = {
        id: docId,
        content: initialContent,
        version: 0,
        operations: []
      };
      this.documents.set(docId, doc);
    }
    
    return doc;
  }
  
  /**
   * Apply operation to document
   */
  applyOperation(docId: string, operation: Omit<DocumentOperation, "id" | "timestamp">): DocumentOperation {
    const doc = this.documents.get(docId);
    if (!doc) {
      throw new Error("Document not found");
    }
    
    const fullOperation: DocumentOperation = {
      ...operation,
      id: this.generateId(),
      timestamp: Date.now()
    };
    
    // Apply operation to content
    switch (operation.type) {
      case "insert":
        doc.content = 
          doc.content.slice(0, operation.position) +
          (operation.content ?? "") +
          doc.content.slice(operation.position);
        break;
        
      case "delete":
        doc.content = 
          doc.content.slice(0, operation.position) +
          doc.content.slice(operation.position + (operation.length ?? 0));
        break;
        
      case "replace":
        doc.content = 
          doc.content.slice(0, operation.position) +
          (operation.content ?? "") +
          doc.content.slice(operation.position + (operation.length ?? 0));
        break;
    }
    
    doc.version++;
    fullOperation.timestamp = doc.version;
    doc.operations.push(fullOperation);
    
    return fullOperation;
  }
  
  /**
   * Get document state
   */
  getState(docId: string): DocumentState | undefined {
    return this.documents.get(docId);
  }
  
  /**
   * Get document content
   */
  getContent(docId: string): string {
    return this.documents.get(docId)?.content ?? "";
  }
  
  /**
   * Get operations since version
   */
  getOperationsSince(docId: string, version: number): DocumentOperation[] {
    const doc = this.documents.get(docId);
    if (!doc) return [];
    
    return doc.operations.filter(op => op.timestamp > version);
  }
  
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// EXERCISES
// ============================================================================

/**
 * Exercise 7.1: Implement a Room Manager
 */
class RoomManager {
  private rooms: Map<string, Set<string>> = new Map();
  private userRooms: Map<string, Set<string>> = new Map();
  
  createRoom(roomId: string): boolean {
    if (this.rooms.has(roomId)) {
      return false;
    }
    this.rooms.set(roomId, new Set());
    return true;
  }
  
  joinRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    room.add(userId);
    
    const userRoomList = this.userRooms.get(userId) ?? new Set();
    userRoomList.add(roomId);
    this.userRooms.set(userId, userRoomList);
    
    return true;
  }
  
  leaveRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    room.delete(userId);
    
    const userRoomList = this.userRooms.get(userId);
    if (userRoomList) {
      userRoomList.delete(roomId);
      if (userRoomList.size === 0) {
        this.userRooms.delete(userId);
      }
    }
    
    // Clean up empty rooms
    if (room.size === 0) {
      this.rooms.delete(roomId);
    }
    
    return true;
  }
  
  getRoomUsers(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room) : [];
  }
  
  getUserRooms(userId: string): string[] {
    const rooms = this.userRooms.get(userId);
    return rooms ? Array.from(rooms) : [];
  }
  
  getRoomCount(): number {
    return this.rooms.size;
  }
  
  getOnlineCount(): number {
    return this.userRooms.size;
  }
}

/**
 * Exercise 7.2: Implement a Message Broker for WebSocket
 */
class MessageBroker {
  private subscribers: Map<string, Set<(data: unknown) => void>> = new Map();
  private wildcardSubscribers: Map<string, Set<(topic: string, data: unknown) => void>> = new Map();
  
  subscribe(topic: string, callback: (data: unknown) => void): void {
    if (topic.includes("*")) {
      const subs = this.wildcardSubscribers.get(topic) ?? new Set();
      subs.add(callback);
      this.wildcardSubscribers.set(topic, subs);
    } else {
      const subs = this.subscribers.get(topic) ?? new Set();
      subs.add(callback);
      this.subscribers.set(topic, subs);
    }
  }
  
  unsubscribe(topic: string, callback?: (data: unknown) => void): void {
    if (callback) {
      if (topic.includes("*")) {
        const subs = this.wildcardSubscribers.get(topic);
        if (subs) {
          subs.delete(callback);
          if (subs.size === 0) {
            this.wildcardSubscribers.delete(topic);
          }
        }
      } else {
        const subs = this.subscribers.get(topic);
        if (subs) {
          subs.delete(callback);
          if (subs.size === 0) {
            this.subscribers.delete(topic);
          }
        }
      }
    } else {
      this.subscribers.delete(topic);
      this.wildcardSubscribers.delete(topic);
    }
  }
  
  publish(topic: string, data: unknown): void {
    // Exact match subscribers
    const exactSubs = this.subscribers.get(topic);
    exactSubs?.forEach(callback => callback(data));
    
    // Wildcard subscribers
    this.wildcardSubscribers.forEach((callbacks, pattern) => {
      if (this.matchPattern(pattern, topic)) {
        callbacks.forEach(callback => callback(topic, data));
      }
    });
  }
  
  private matchPattern(pattern: string, topic: string): boolean {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return regex.test(topic);
  }
}

// ============================================================================
// TESTS
// ============================================================================

describe("Module 7: WebSockets and Real-Time Systems", () => {
  describe("Room Manager", () => {
    test("creates room", () => {
      const manager = new RoomManager();
      expect(manager.createRoom("room1")).toBe(true);
      expect(manager.getRoomCount()).toBe(1);
    });
    
    test("prevents duplicate rooms", () => {
      const manager = new RoomManager();
      manager.createRoom("room1");
      expect(manager.createRoom("room1")).toBe(false);
    });
    
    test("joins user to room", () => {
      const manager = new RoomManager();
      manager.createRoom("room1");
      expect(manager.joinRoom("room1", "user1")).toBe(true);
      expect(manager.getRoomUsers("room1")).toContain("user1");
    });
    
    test("removes user from room", () => {
      const manager = new RoomManager();
      manager.createRoom("room1");
      manager.joinRoom("room1", "user1");
      expect(manager.leaveRoom("room1", "user1")).toBe(true);
      expect(manager.getRoomUsers("room1")).not.toContain("user1");
    });
  });
  
  describe("Presence Service", () => {
    let presence: PresenceService;
    
    beforeEach(() => {
      presence = new PresenceService();
    });
    
    afterEach(() => {
      presence.stop();
    });
    
    test("sets user online", () => {
      presence.setOnline("user1");
      expect(presence.isOnline("user1")).toBe(true);
    });
    
    test("sets user away", () => {
      presence.setOnline("user1");
      presence.setAway("user1");
      expect(presence.isOnline("user1")).toBe(false);
      expect(presence.isAway("user1")).toBe(true);
    });
    
    test("sets user offline", () => {
      presence.setOnline("user1");
      presence.setOffline("user1");
      expect(presence.isOnline("user1")).toBe(false);
      expect(presence.isAway("user1")).toBe(false);
    });
    
    test("tracks last seen", () => {
      presence.setOnline("user1");
      const lastSeen = presence.getLastSeen("user1");
      expect(lastSeen).not.toBeNull();
    });
  });
  
  describe("Document Sync", () => {
    let sync: DocumentSync;
    
    beforeEach(() => {
      sync = new DocumentSync();
    });
    
    test("creates document", () => {
      const doc = sync.getOrCreate("doc1", "Hello");
      expect(doc.content).toBe("Hello");
      expect(doc.version).toBe(0);
    });
    
    test("inserts text", () => {
      sync.getOrCreate("doc1", "Hello");
      const op = sync.applyOperation("doc1", {
        userId: "user1",
        type: "insert",
        position: 5,
        content: " World"
      });
      
      expect(sync.getContent("doc1")).toBe("Hello World");
    });
    
    test("deletes text", () => {
      sync.getOrCreate("doc1", "Hello World");
      sync.applyOperation("doc1", {
        userId: "user1",
        type: "delete",
        position: 5,
        length: 6
      });
      
      expect(sync.getContent("doc1")).toBe("Hello");
    });
  });
  
  describe("Message Broker", () => {
    let broker: MessageBroker;
    
    beforeEach(() => {
      broker = new MessageBroker();
    });
    
    test("subscribes and publishes", () => {
      const received: unknown[] = [];
      
      broker.subscribe("user.*", (data) => {
        received.push(data);
      });
      
      broker.publish("user.created", { id: "1" });
      broker.publish("user.updated", { id: "1" });
      
      expect(received.length).toBe(2);
    });
    
    test("handles wildcard patterns", () => {
      const received: [string, unknown][] = [];
      
      broker.subscribe("user.*", (topic, data) => {
        received.push([topic, data]);
      });
      
      broker.publish("user.created", { id: "1" });
      broker.publish("order.created", { id: "1" });
      
      expect(received.length).toBe(1);
      expect(received[0][0]).toBe("user.created");
    });
  });
});

export { 
  WebSocketServer,
  PresenceService,
  DocumentSync,
  RoomManager,
  MessageBroker
};
