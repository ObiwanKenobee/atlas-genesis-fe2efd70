/**
 * Module 3: Databases and Storage
 * 
 * PostgreSQL, Redis caching, TypeORM entities, and query patterns
 */

// ============================================================================
// 3.1 POSTGRESQL - Connection and Query Building
// ============================================================================

import { Pool, PoolClient } from "pg";

// Database configuration
interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
}

class Database {
  private pool: Pool;
  
  constructor(config: DbConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.max ?? 10,
      idleTimeoutMillis: config.idleTimeoutMillis ?? 30000
    });
    
    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });
  }
  
  async query<T>(text: string, params?: unknown[]): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows as T[];
  }
  
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }
  
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// ============================================================================
// 3.2 SQL SCHEMA DEFINITIONS
// ============================================================================

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    category_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
`;

// ============================================================================
// 3.3 TYPEORM ENTITIES
// ============================================================================

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  EntityRepository,
  Repository
} from "typeorm";

@Entity("users")
@Index("idx_users_email", ["email"])
@Index("idx_users_role", ["role"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  
  @Column({ unique: true })
  email!: string;
  
  @Column({ unique: true })
  username!: string;
  
  @Column({ name: "password_hash" })
  passwordHash!: string;
  
  @Column({
    type: "varchar",
    length: 20,
    default: "user"
  })
  role!: "admin" | "user" | "moderator";
  
  @Column({ name: "is_active", default: true })
  isActive!: boolean;
  
  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
  
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
  
  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];
}

@Entity("orders")
@Index("idx_orders_user_id", ["userId"])
@Index("idx_orders_status", ["status"])
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;
  
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user!: User;
  
  @Column({
    type: "varchar",
    length: 50,
    default: "pending"
  })
  status!: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  
  @Column({ name: "total_amount", type: "decimal", precision: 10, scale: 2 })
  totalAmount!: number;
  
  @Column({ name: "shipping_address", type: "jsonb" })
  shippingAddress!: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  @Column({ nullable: true })
  notes?: string;
  
  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
  
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}

@Entity("products")
@Index("idx_products_sku", ["sku"])
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
  
  @Column()
  name!: string;
  
  @Column({ type: "text", nullable: true })
  description?: string;
  
  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;
  
  @Column({ unique: true })
  sku!: string;
  
  @Column({ name: "stock_quantity", default: 0 })
  stockQuantity!: number;
  
  @Column({ name: "category_id", type: "uuid", nullable: true })
  categoryId?: string;
  
  @Column({ name: "is_active", default: true })
  isActive!: boolean;
  
  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
  
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}

@EntityRepository(Order)
class OrderRepository extends Repository<Order> {
  async findByUserWithItems(userId: string): Promise<Order[]> {
    return this.find({
      where: { userId },
      relations: [],
      order: { createdAt: "DESC" }
    });
  }
  
  async findPendingOrders(): Promise<Order[]> {
    return this.createQueryBuilder("order")
      .where("order.status = :status", { status: "pending" })
      .orderBy("order.createdAt", "ASC")
      .getMany();
  }
  
  async getOrderStatistics(startDate: Date, endDate: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    const result = await this.createQueryBuilder("order")
      .select("COUNT(*)", "totalOrders")
      .addSelect("SUM(order.totalAmount)", "totalRevenue")
      .where("order.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate
      })
      .getRawOne();
    
    return {
      totalOrders: parseInt(result.totalOrders) || 0,
      totalRevenue: parseFloat(result.totalRevenue) || 0,
      averageOrderValue: parseFloat(result.totalRevenue) / parseInt(result.totalOrders) || 0
    };
  }
}

// ============================================================================
// 3.4 REDIS CACHING
// ============================================================================

import { createClient, RedisClientType } from "redis";

class CacheService {
  private client: RedisClientType;
  private defaultTtl: number;
  
  constructor(defaultTtlSeconds: number = 3600) {
    this.client = createClient({
      url: process.env.REDIS_URL ?? "redis://localhost:6379"
    });
    
    this.client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });
    
    this.defaultTtl = defaultTtlSeconds;
  }
  
  async connect(): Promise<void> {
    await this.client.connect();
  }
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }
  
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    const ttl = ttlSeconds ?? this.defaultTtl;
    
    if (ttl > 0) {
      await this.client.setEx(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }
  
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
  
  async deletePattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
  
  async checkRateLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    
    await this.client.zRemRangeByScore(key, "-inf", windowStart.toString());
    
    const count = await this.client.zCard(key);
    
    if (count >= maxRequests) {
      const oldest = await this.client.zRange(key, 0, 0);
      const resetAt = oldest.length > 0 
        ? parseInt(oldest[0].split(":")[1] || "0") + windowSeconds * 1000
        : now + windowSeconds * 1000;
      
      return { allowed: false, remaining: 0, resetAt };
    }
    
    await this.client.zAdd(key, { score: now, value: `${now}:${Math.random()}` });
    await this.client.expire(key, windowSeconds);
    
    return {
      allowed: true,
      remaining: maxRequests - count - 1,
      resetAt: now + windowSeconds * 1000
    };
  }
  
  async close(): Promise<void> {
    await this.client.quit();
  }
}

// ============================================================================
// EXERCISES
// ============================================================================

/**
 * Exercise 3.1: Implement User Repository with caching
 */
class CachedUserRepository {
  private db: Database;
  private cache: CacheService;
  
  constructor(db: Database, cache: CacheService) {
    this.db = db;
    this.cache = cache;
  }
  
  async findById(id: string): Promise<User | null> {
    // Try cache first
    const cached = await this.cache.get<User>(`user:${id}`);
    if (cached) return cached;
    
    // Query database
    const users = await this.db.query<User>(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    
    const user = users[0] ?? null;
    
    // Cache result
    if (user) {
      await this.cache.set(`user:${id}`, user, 3600);
    }
    
    return user;
  }
  
  async findByEmail(email: string): Promise<User | null> {
    const cached = await this.cache.get<User>(`user:email:${email}`);
    if (cached) return cached;
    
    const users = await this.db.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    
    const user = users[0] ?? null;
    
    if (user) {
      await this.cache.set(`user:email:${email}`, user, 3600);
    }
    
    return user;
  }
  
  async create(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const result = await this.db.query<User>(
      `INSERT INTO users (email, username, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userData.email, userData.username, userData.passwordHash, userData.role, userData.isActive]
    );
    
    // Invalidate relevant caches
    await this.cache.deletePattern("user:*");
    
    return result[0];
  }
  
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const setClause: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      if (key !== "id" && key !== "createdAt") {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    setClause.push(`updated_at = NOW()`);
    values.push(id);
    
    const result = await this.db.query<User>(
      `UPDATE users SET ${setClause.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    // Invalidate caches
    await this.cache.delete(`user:${id}`);
    await this.cache.deletePattern("user:*");
    
    return result[0] ?? null;
  }
}

/**
 * Exercise 3.2: Implement transaction for order creation
 */
async function createOrder(
  db: Database,
  userId: string,
  items: { productId: string; quantity: number }[],
  shippingAddress: Order["shippingAddress"]
): Promise<Order> {
  return db.transaction(async (client) => {
    // Get products with lock
    const productsResult = await client.query(
      `SELECT * FROM products WHERE id = ANY($1) FOR UPDATE`,
      [items.map(i => i.productId)]
    );
    
    const products = productsResult.rows;
    
    // Calculate total and check stock
    let totalAmount = 0;
    for (const item of items) {
      const product = products.find((p: { id: string }) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
      totalAmount += parseFloat(product.price) * item.quantity;
      
      // Decrement stock
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }
    
    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [userId, totalAmount, JSON.stringify(shippingAddress)]
    );
    
    const order = orderResult.rows[0];
    
    // Create order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.productId, item.quantity, 
         products.find((p: { id: string }) => p.id === item.productId)?.price]
      );
    }
    
    return order;
  });
}

// ============================================================================
// TESTS
// ============================================================================

describe("Module 3: Databases and Storage", () => {
  describe("User Entity", () => {
    test("User has all required properties", () => {
      const user: User = {
        id: "123",
        email: "test@example.com",
        username: "testuser",
        passwordHash: "hash",
        role: "user",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      expect(user.email).toBe("test@example.com");
      expect(user.role).toBe("user");
      expect(user.isActive).toBe(true);
    });
    
    test("User role can only be valid values", () => {
      const roles: ("admin" | "user" | "moderator")[] = ["admin", "user", "moderator"];
      roles.forEach(role => {
        const user: User = {
          id: "123",
          email: "test@example.com",
          username: "testuser",
          passwordHash: "hash",
          role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        expect(user.role).toBe(role);
      });
    });
  });
  
  describe("Cache Service", () => {
    test("Cache key formatting", () => {
      const key = `user:${"123"}`;
      expect(key).toBe("user:123");
    });
    
    test("TTL calculation", () => {
      const ttl = 3600;
      expect(ttl).toBe(3600);
    });
  });
});

export { 
  Database, 
  User, 
  Order, 
  Product,
  OrderRepository,
  CacheService,
  CachedUserRepository,
  createOrder,
  schema
};
