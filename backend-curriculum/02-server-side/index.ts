/**
 * Module 2: Server-Side Programming
 * 
 * HTTP server implementation, RESTful routing, MVC pattern, and middleware
 */

import { IncomingMessage, ServerResponse, createServer } from "http";

// ============================================================================
// 2.1 HTTP SERVER - Request and Response Lifecycle
// ============================================================================

interface HttpMethod {
  GET: "GET";
  POST: "POST";
  PUT: "PUT";
  PATCH: "PATCH";
  DELETE: "DELETE";
  OPTIONS: "OPTIONS";
  HEAD: "HEAD";
}

const HttpMethod: HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  OPTIONS: "OPTIONS",
  HEAD: "HEAD"
};

type HttpMethodType = keyof HttpMethod;

interface RouteHandler {
  (req: IncomingMessage, res: ServerResponse, params: Record<string, string>): Promise<void> | void;
}

interface Route {
  method: HttpMethodType;
  path: string;
  handler: RouteHandler;
}

interface Middleware {
  (req: IncomingMessage, res: ServerResponse, next: () => Promise<void>): Promise<void> | void;
}

class HttpServer {
  private routes: Map<string, RouteHandler> = new Map();
  private middleware: Middleware[] = [];
  private middlewaresMap: Map<string, Middleware[]> = new Map();
  
  // ============================================================================
  // 2.2 ROUTING - RESTful API Design
  // ============================================================================
  
  private getRouteKey(method: HttpMethodType, path: string): string {
    return `${method}:${path}`;
  }
  
  get(path: string, handler: RouteHandler): void {
    this.routes.set(this.getRouteKey(HttpMethod.GET, path), handler);
  }
  
  post(path: string, handler: RouteHandler): void {
    this.routes.set(this.getRouteKey(HttpMethod.POST, path), handler);
  }
  
  put(path: string, handler: RouteHandler): void {
    this.routes.set(this.getRouteKey(HttpMethod.PUT, path), handler);
  }
  
  patch(path: string, handler: RouteHandler): void {
    this.routes.set(this.getRouteKey(HttpMethod.PATCH, path), handler);
  }
  
  delete(path: string, handler: RouteHandler): void {
    this.routes.set(this.getRouteKey(HttpMethod.DELETE, path), handler);
  }
  
  // ============================================================================
  // 2.3 MIDDLEWARE - Cross-cutting concerns
  // ============================================================================
  
  use(pathOrMiddleware: string | Middleware, middleware?: Middleware): void {
    if (typeof pathOrMiddleware === "function") {
      this.middleware.push(pathOrMiddleware);
    } else {
      const path = pathOrMiddleware;
      const mw = middleware!;
      const existing = this.middlewaresMap.get(path) ?? [];
      existing.push(mw);
      this.middlewaresMap.set(path, existing);
    }
  }
  
  // ============================================================================
  // REQUEST/PARAMETER PARSING
  // ============================================================================
  
  private parseUrl(url: string): { path: string; query: Record<string, string> } {
    const [path, queryString] = url.split("?");
    const query: Record<string, string> = {};
    
    if (queryString) {
      const pairs = queryString.split("&");
      for (const pair of pairs) {
        const [key, value] = pair.split("=");
        query[key] = decodeURIComponent(value);
      }
    }
    
    return { path, query };
  }
  
  private parseParams(routePath: string, requestPath: string): Record<string, string> {
    const routeParts = routePath.split("/");
    const requestParts = requestPath.split("/");
    const params: Record<string, string> = {};
    
    if (routeParts.length !== requestParts.length) {
      return {};
    }
    
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        params[routeParts[i].slice(1)] = requestParts[i];
      } else if (routeParts[i] !== requestParts[i]) {
        return {};
      }
    }
    
    return params;
  }
  
  private async parseBody(req: IncomingMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", () => {
        try {
          if (body) {
            resolve(JSON.parse(body));
          } else {
            resolve(undefined);
          }
        } catch (e) {
          reject(e);
        }
      });
      req.on("error", reject);
    });
  }
  
  // ============================================================================
  // 2.4 MVC - Controllers and Response Helpers
  // ============================================================================
  
  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = req.url ?? "/";
    const { path, query } = this.parseUrl(url);
    const method = req.method as HttpMethodType;
    
    // Parse query and body
    (req as any).query = query;
    (req as any).body = await this.parseBody(req);
    
    // Apply global middleware
    for (const mw of this.middleware) {
      await mw(req, res, async () => {});
      if (res.writableEnded) return;
    }
    
    // Find and execute route handler
    // First try exact match, then parameterized routes
    const exactKey = this.getRouteKey(method, path);
    if (this.routes.has(exactKey)) {
      const handler = this.routes.get(exactKey)!;
      await handler(req, res, {});
      return;
    }
    
    // Try parameterized routes
    for (const [routeKey, handler] of this.routes) {
      const [routeMethod, routePath] = routeKey.split(":");
      if (routeMethod === method) {
        const params = this.parseParams(routePath, path);
        if (Object.keys(params).length > 0) {
          (req as any).params = params;
          await handler(req, res, params);
          return;
        }
      }
    }
    
    // 404
    this.sendJson(res, 404, {
      success: false,
      error: { code: "NOT_FOUND", message: `Cannot ${method} ${path}` }
    });
  }
  
  // Response helpers
  sendJson(res: ServerResponse, status: number, data: unknown): void {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  }
  
  send(res: ServerResponse, status: number, data: string): void {
    res.writeHead(status, { "Content-Type": "text/plain" });
    res.end(data);
  }
  
  redirect(res: ServerResponse, url: string, status: number = 302): void {
    res.writeHead(status, { Location: url });
    res.end();
  }
  
  // ============================================================================
  // SERVER LIFECYCLE
  // ============================================================================
  
  listen(port: number, callback?: () => void): void {
    const server = createServer((req, res) => {
      this.handleRequest(req, res).catch(err => {
        console.error("Request error:", err);
        this.sendJson(res, 500, {
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Internal server error" }
        });
      });
    });
    
    server.listen(port, callback);
  }
  
  close(callback?: () => void): void {
    // Server cleanup would go here
    callback?.();
  }
}

// ============================================================================
// 2.5 RESTful API EXAMPLE - Task Management API
// ============================================================================

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

class TaskController {
  private tasks: Map<string, Task> = new Map();
  private idCounter = 1;
  
  async list(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const tasks = Array.from(this.tasks.values());
    
    // Pagination
    const query = (req as any).query;
    const page = parseInt(query.page ?? "1", 10);
    const limit = parseInt(query.limit ?? "10", 10);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    const paginated = tasks.slice(start, end);
    
    this.sendJson(res, 200, {
      success: true,
      data: paginated,
      meta: {
        pagination: {
          page,
          limit,
          total: tasks.length,
          totalPages: Math.ceil(tasks.length / limit)
        }
      }
    });
  }
  
  async get(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const { id } = (req as any).params;
    const task = this.tasks.get(id);
    
    if (!task) {
      this.sendJson(res, 404, {
        success: false,
        error: { code: "NOT_FOUND", message: "Task not found" }
      });
      return;
    }
    
    this.sendJson(res, 200, { success: true, data: task });
  }
  
  async create(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = (req as any).body as { title: string; description: string };
    
    if (!body.title) {
      this.sendJson(res, 400, {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Title is required" }
      });
      return;
    }
    
    const task: Task = {
      id: String(this.idCounter++),
      title: body.title,
      description: body.description ?? "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tasks.set(task.id, task);
    
    this.sendJson(res, 201, {
      success: true,
      data: task
    });
  }
  
  async update(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const { id } = (req as any).params;
    const body = (req as any).body as Partial<Task>;
    
    const task = this.tasks.get(id);
    if (!task) {
      this.sendJson(res, 404, {
        success: false,
        error: { code: "NOT_FOUND", message: "Task not found" }
      });
      return;
    }
    
    const updated: Task = {
      ...task,
      ...body,
      id,
      updatedAt: new Date()
    };
    
    this.tasks.set(id, updated);
    
    this.sendJson(res, 200, { success: true, data: updated });
  }
  
  async delete(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const { id } = (req as any).params;
    
    if (!this.tasks.has(id)) {
      this.sendJson(res, 404, {
        success: false,
        error: { code: "NOT_FOUND", message: "Task not found" }
      });
      return;
    }
    
    this.tasks.delete(id);
    res.writeHead(204);
    res.end();
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

function createApp(): HttpServer {
  const app = new HttpServer();
  const taskController = new TaskController();
  
  // Middleware examples
  app.use(async (req, res, next) => {
    const start = Date.now();
    console.log(`${req.method} ${req.url}`);
    await next();
    const duration = Date.now() - start;
    console.log(`Request completed in ${duration}ms`);
  });
  
  // Request ID middleware
  app.use(async (req, res, next) => {
    const id = crypto.randomUUID();
    (res as any).setHeader("X-Request-ID", id);
    await next();
  });
  
  // CORS middleware
  app.use(async (req, res, next) => {
    (res as any).setHeader("Access-Control-Allow-Origin", "*");
    (res as any).setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    (res as any).setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    
    await next();
  });
  
  // Routes
  app.get("/tasks", (req, res) => taskController.list(req, res));
  app.get("/tasks/:id", (req, res) => taskController.get(req, res));
  app.post("/tasks", (req, res) => taskController.create(req, res));
  app.patch("/tasks/:id", (req, res) => taskController.update(req, res));
  app.delete("/tasks/:id", (req, res) => taskController.delete(req, res));
  
  return app;
}

// ============================================================================
// EXERCISES
// ============================================================================

/**
 * Exercise 2.1: Add authentication middleware to the server
 */
function addAuthMiddleware(app: HttpServer, secret: string): void {
  app.use(async (req, res, next) => {
    const authHeader = (req as any).headers?.authorization;
    
    if (!authHeader?.startsWith("Bearer ")) {
      (app as any).sendJson(res, 401, {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Missing or invalid authorization header" }
      });
      return;
    }
    
    const token = authHeader.slice(7);
    try {
      // Verify JWT token (simplified)
      const payload = JSON.parse(atob(token.split(".")[1]));
      (req as any).user = payload;
      await next();
    } catch {
      (app as any).sendJson(res, 401, {
        success: false,
        error: { code: "INVALID_TOKEN", message: "Invalid token" }
      });
    }
  });
}

/**
 * Exercise 2.2: Add rate limiting middleware
 */
function rateLimit(app: HttpServer, maxRequests: number, windowMs: number): void {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  app.use(async (req, res, next) => {
    const ip = (req.socket.remoteAddress ?? "unknown");
    const now = Date.now();
    
    let record = requests.get(ip);
    
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      requests.set(ip, record);
    } else {
      record.count++;
    }
    
    (res as any).setHeader("X-RateLimit-Limit", maxRequests);
    (res as any).setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count));
    
    if (record.count > maxRequests) {
      (app as any).sendJson(res, 429, {
        success: false,
        error: { code: "TOO_MANY_REQUESTS", message: "Rate limit exceeded" }
      });
      return;
    }
    
    await next();
  });
}

// ============================================================================
// TESTS
// ============================================================================

describe("Module 2: Server-Side Programming", () => {
  let app: HttpServer;
  
  beforeEach(() => {
    app = createApp();
  });
  
  test("HTTP methods are defined", () => {
    expect(HttpMethod.GET).toBe("GET");
    expect(HttpMethod.POST).toBe("POST");
    expect(HttpMethod.DELETE).toBe("DELETE");
  });
  
  test("URL parsing extracts query parameters", () => {
    const server = new HttpServer();
    const result = (server as any).parseUrl("/api/users?page=2&limit=10");
    expect(result.path).toBe("/api/users");
    expect(result.query.page).toBe("2");
    expect(result.query.limit).toBe("10");
  });
  
  test("Route parameter parsing", () => {
    const server = new HttpServer();
    const params = server.parseParams("/users/:id", "/users/123");
    expect(params.id).toBe("123");
  });
  
  test("Parameter parsing returns empty for non-matching routes", () => {
    const server = new HttpServer();
    const params = server.parseParams("/users/:id", "/posts/123");
    expect(Object.keys(params).length).toBe(0);
  });
});

export { 
  HttpServer, 
  HttpMethod, 
  TaskController, 
  createApp,
  addAuthMiddleware,
  rateLimit
};
