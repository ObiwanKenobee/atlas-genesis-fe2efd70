/**
 * Atlas Humanitarian Platform - Multi-Database Service Factory
 * 
 * Provides unified access to:
 * - PostgreSQL (Relational data)
 * - MongoDB (Document storage)
 * - Redis (Caching)
 * - Elasticsearch (Search)
 * - Neo4j (Graph data)
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { Db, Collection, MongoClient } from 'mongodb';
import { Redis, Cluster } from 'ioredis';
import { Client } from '@elastic/elasticsearch';
import { Driver, Session } from 'neo4j-driver';

// ============================================================================
// Configuration
// ============================================================================

export interface DatabaseConfig {
    postgres: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
        pool: {
            min: number;
            max: number;
            idleTimeout: number;
            connectionTimeout: number;
        };
    };
    mongodb: {
        uri: string;
        database: string;
        options: {
            maxPoolSize: number;
            minPoolSize: number;
            connectTimeout: number;
            socketTimeout: number;
        };
    };
    redis: {
        host: string;
        port: number;
        password?: string;
        db: number;
        cluster?: {
            enabled: boolean;
            nodes: { host: string; port: number }[];
        };
    };
    elasticsearch: {
        node: string;
        auth?: { username: string; password: string };
        options: {
            maxRetries: number;
            requestTimeout: number;
        };
    };
    neo4j: {
        uri: string;
        user: string;
        password: string;
    };
}

// ============================================================================
// PostgreSQL Service
// ============================================================================

export class PostgreSQLService {
    private pool: Pool;
    private connected: boolean = false;

    constructor(config: DatabaseConfig['postgres']) {
        this.pool = new Pool({
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            min: config.pool.min,
            max: config.pool.max,
            idleTimeoutMillis: config.pool.idleTimeout,
            connectionTimeoutMillis: config.pool.connectionTimeout,
        });

        this.pool.on('error', (err) => {
            console.error('PostgreSQL pool error:', err);
        });
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        
        try {
            const client = await this.pool.connect();
            client.release();
            this.connected = true;
            console.log('PostgreSQL connected successfully');
        } catch (error) {
            console.error('PostgreSQL connection failed:', error);
            throw error;
        }
    }

    async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
        return this.pool.query<T>(text, params);
    }

    async getClient(): Promise<PoolClient> {
        return this.pool.connect();
    }

    async transaction<T>(
        callback: (client: PoolClient) => Promise<T>
    ): Promise<T> {
        const client = await this.getClient();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async close(): Promise<void> {
        await this.pool.end();
        this.connected = false;
    }

    getPool(): Pool {
        return this.pool;
    }
}

// ============================================================================
// MongoDB Service
// ============================================================================

export class MongoDBService {
    private client: MongoClient;
    private db: Db;
    private connected: boolean = false;

    constructor(config: DatabaseConfig['mongodb']) {
        this.client = new MongoClient(config.uri, {
            maxPoolSize: config.options.maxPoolSize,
            minPoolSize: config.options.minPoolSize,
            connectTimeoutMS: config.options.connectTimeout,
            socketTimeoutMS: config.options.socketTimeout,
        });
        this.db = this.client.db(config.database);
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        
        try {
            await this.client.connect();
            this.connected = true;
            console.log('MongoDB connected successfully');
        } catch (error) {
            console.error('MongoDB connection failed:', error);
            throw error;
        }
    }

    getCollection<T extends Document>(name: string): Collection<T> {
        return this.db.collection<T>(name);
    }

    collection(name: string): Collection {
        return this.db.collection(name);
    }

    async listCollections(): Promise<string[]> {
        const collections = await this.db.listCollections().toArray();
        return collections.map(c => c.name);
    }

    async createCollection(name: string, validator?: object): Promise<void> {
        const options: any = {};
        if (validator) {
            options.validator = validator;
        }
        await this.db.createCollection(name, options);
    }

    async createIndex(
        collectionName: string,
        keys: object | string[],
        options?: object
    ): Promise<string> {
        const collection = this.collection(collectionName);
        return collection.createIndex(keys as any, options);
    }

    async close(): Promise<void> {
        await this.client.close();
        this.connected = false;
    }

    getDb(): Db {
        return this.db;
    }

    getClient(): MongoClient {
        return this.client;
    }
}

// ============================================================================
// Redis Service
// ============================================================================

export class RedisService {
    private redis: Redis;
    private cluster: Cluster | null = null;

    constructor(config: DatabaseConfig['redis']) {
        const options: any = {
            host: config.host,
            port: config.port,
            password: config.password,
            db: config.db,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        };

        if (config.cluster?.enabled) {
            this.cluster = new Cluster(
                config.cluster.nodes,
                {
                    redisOptions: options,
                    scaleReads: 'slave',
                }
            );
            this.redis = this.cluster as any;
        } else {
            this.redis = new Redis(options);
        }

        this.redis.on('error', (err) => {
            console.error('Redis error:', err);
        });
    }

    async connect(): Promise<void> {
        await this.redis.connect();
        console.log('Redis connected successfully');
    }

    // String operations
    async get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redis.setex(key, ttl, value);
        } else {
            await this.redis.set(key, value);
        }
    }

    async setJSON(key: string, value: any, ttl?: number): Promise<void> {
        const json = JSON.stringify(value);
        await this.set(key, json, ttl);
    }

    async getJSON<T>(key: string): Promise<T | null> {
        const value = await this.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }

    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    // Hash operations
    async hGet(key: string, field: string): Promise<string | null> {
        return this.redis.hget(key, field);
    }

    async hSet(key: string, field: string, value: string): Promise<void> {
        await this.redis.hset(key, field, value);
    }

    async hGetAll(key: string): Promise<Record<string, string>> {
        return this.redis.hgetall(key);
    }

    // Set operations
    async sAdd(key: string, ...members: string[]): Promise<number> {
        return this.redis.sadd(key, ...members);
    }

    async sMembers(key: string): Promise<string[]> {
        return this.redis.smembers(key);
    }

    async sIsMember(key: string, member: string): Promise<boolean> {
        return this.redis.sismember(key, member) === 1;
    }

    // Sorted set operations
    async zAdd(key: string, score: number, member: string): Promise<number> {
        return this.redis.zadd(key, score, member);
    }

    async zRange(
        key: string,
        start: number,
        stop: number,
        withScores?: 'WITHSCORES'
    ): Promise<string[]> {
        if (withScores) {
            const result = await this.redis.zrange(key, start, stop, 'WITHSCORES');
            return result;
        }
        return this.redis.zrange(key, start, stop);
    }

    // TTL operations
    async expire(key: string, seconds: number): Promise<number> {
        return this.redis.expire(key, seconds);
    }

    async ttl(key: string): Promise<number> {
        return this.redis.ttl(key);
    }

    // Connection
    async ping(): Promise<string> {
        return this.redis.ping();
    }

    async close(): Promise<void> {
        await this.redis.quit();
    }

    getRedis(): Redis {
        return this.redis;
    }
}

// ============================================================================
// Elasticsearch Service
// ============================================================================

export class ElasticsearchService {
    private client: Client;
    private connected: boolean = false;

    constructor(config: DatabaseConfig['elasticsearch']) {
        this.client = new Client({
            node: config.node,
            auth: config.auth,
            maxRetries: config.options.maxRetries,
            requestTimeout: config.options.requestTimeout,
        });
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        
        try {
            await this.client.ping();
            this.connected = true;
            console.log('Elasticsearch connected successfully');
        } catch (error) {
            console.error('Elasticsearch connection failed:', error);
            throw error;
        }
    }

    async createIndex(
        index: string,
        settings: object,
        mappings: object
    ): Promise<void> {
        await this.client.indices.create({
            index,
            body: { settings, mappings },
        });
    }

    async deleteIndex(index: string): Promise<void> {
        try {
            await this.client.indices.delete({ index });
        } catch (error: any) {
            if (error.meta?.statusCode !== 404) {
                throw error;
            }
        }
    }

    async indexDocument(
        index: string,
        id: string,
        document: object,
        refresh?: boolean
    ): Promise<void> {
        await this.client.index({
            index,
            id,
            document,
            refresh: refresh ? 'wait_for' : false,
        });
    }

    async bulkIndex(index: string, documents: { id: string; document: object }[]): Promise<void> {
        if (documents.length === 0) return;

        const operations = documents.flatMap(doc => [
            { index: { _index: index, _id: doc.id } },
            doc.document,
        ]);

        await this.client.bulk({ body: operations, refresh: true });
    }

    async search<T = any>(
        index: string,
        query: object,
        options?: { from?: number; size?: number; sort?: object[] }
    ): Promise<{ hits: T[]; total: number }> {
        const response = await this.client.search<T>({
            index,
            body: {
                query,
                from: options?.from || 0,
                size: options?.size || 10,
                sort: options?.sort,
            },
        });

        const hits = response.hits.hits.map(h => h._source as T);
        const total = typeof response.hits.total === 'number'
            ? response.hits.total
            : response.hits.total?.value || 0;

        return { hits, total };
    }

    async deleteByQuery(index: string, query: object): Promise<number> {
        const response = await this.client.deleteByQuery({
            index,
            body: { query },
        });
        return response.deleted;
    }

    async getDocument(index: string, id: string): Promise<any> {
        try {
            const response = await this.client.get({ index, id });
            return response._source;
        } catch (error: any) {
            if (error.meta?.statusCode === 404) {
                return null;
            }
            throw error;
        }
    }

    async updateDocument(index: string, id: string, updates: object): Promise<void> {
        await this.client.update({
            index,
            id,
            doc: updates,
            refresh: true,
        });
    }

    async close(): Promise<void> {
        await this.client.close();
        this.connected = false;
    }

    getClient(): Client {
        return this.client;
    }
}

// ============================================================================
// Neo4j Graph Service
// ============================================================================

export class Neo4jGraphService {
    private driver: Driver;
    private connected: boolean = false;

    constructor(config: DatabaseConfig['neo4j']) {
        this.driver = neo4j.driver(
            config.uri,
            neo4j.auth.basic(config.user, config.password)
        );
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        
        try {
            await this.driver.verifyConnectivity();
            this.connected = true;
            console.log('Neo4j connected successfully');
        } catch (error) {
            console.error('Neo4j connection failed:', error);
            throw error;
        }
    }

    async createNode(label: string, properties: Record<string, any>): Promise<any> {
        const session = this.driver.session();
        try {
            const result = await session.run(
                `CREATE (n:${label} $props) RETURN n`,
                { props: properties }
            );
            return result.records[0]?.get('n')?.properties;
        } finally {
            await session.close();
        }
    }

    async createRelationship(
        fromLabel: string,
        fromId: string,
        toLabel: string,
        toId: string,
        relationshipType: string,
        properties?: Record<string, any>
    ): Promise<void> {
        const session = this.driver.session();
        try {
            await session.run(
                `
                MATCH (from:${fromLabel} {id: $fromId})
                MATCH (to:${toLabel} {id: $toId})
                CREATE (from)-[r:${relationshipType}]->(to)
                SET r = $props
                RETURN r
                `,
                { fromId, toId, props: properties || {} }
            );
        } finally {
            await session.close();
        }
    }

    async findPath(
        startLabel: string,
        startId: string,
        endLabel: string,
        endId: string,
        maxHops: number = 5
    ): Promise<any[]> {
        const session = this.driver.session();
        try {
            const result = await session.run(
                `
                MATCH path = (start:${startLabel} {id: $startId})-[*1..${maxHops}]-(end:${endLabel} {id: $endId})
                RETURN path, length(path) as hops
                ORDER BY hops ASC
                LIMIT 1
                `,
                { startId, endId }
            );

            if (result.records.length === 0) return [];

            const path = result.records[0].get('path');
            return this.parsePath(path);
        } finally {
            await session.close();
        }
    }

    async runCypher(cypher: string, params?: Record<string, any>): Promise<any> {
        const session = this.driver.session();
        try {
            const result = await session.run(cypher, params);
            return result;
        } finally {
            await session.close();
        }
    }

    private parsePath(path: any): any[] {
        // Parse Neo4j path object into array of nodes and relationships
        const nodes = path.segments?.map((segment: any) => ({
            start: segment.start.properties,
            end: segment.end.properties,
            relationship: segment.relationship?.properties
        })) || [];
        return nodes;
    }

    async close(): Promise<void> {
        await this.driver.close();
        this.connected = false;
    }

    getDriver(): Driver {
        return this.driver;
    }
}

// ============================================================================
// Database Factory
// ============================================================================

export class DatabaseFactory {
    private postgres: PostgreSQLService | null = null;
    private mongo: MongoDBService | null = null;
    private redis: RedisService | null = null;
    private elastic: ElasticsearchService | null = null;
    private neo4j: Neo4jGraphService | null = null;

    async initialize(config: DatabaseConfig): Promise<void> {
        // Initialize PostgreSQL
        this.postgres = new PostgreSQLService(config.postgres);
        await this.postgres.connect();

        // Initialize MongoDB
        this.mongo = new MongoDBService(config.mongodb);
        await this.mongo.connect();

        // Initialize Redis
        this.redis = new RedisService(config.redis);
        await this.redis.connect();

        // Initialize Elasticsearch
        this.elastic = new ElasticsearchService(config.elasticsearch);
        await this.elastic.connect();

        // Initialize Neo4j
        this.neo4j = new Neo4jGraphService(config.neo4j);
        await this.neo4j.connect();

        console.log('All database services initialized');
    }

    getPostgres(): PostgreSQLService {
        if (!this.postgres) {
            throw new Error('PostgreSQL not initialized');
        }
        return this.postgres;
    }

    getMongo(): MongoDBService {
        if (!this.mongo) {
            throw new Error('MongoDB not initialized');
        }
        return this.mongo;
    }

    getRedis(): RedisService {
        if (!this.redis) {
            throw new Error('Redis not initialized');
        }
        return this.redis;
    }

    getElastic(): ElasticsearchService {
        if (!this.elastic) {
            throw new Error('Elasticsearch not initialized');
        }
        return this.elastic;
    }

    getNeo4j(): Neo4jGraphService {
        if (!this.neo4j) {
            throw new Error('Neo4j not initialized');
        }
        return this.neo4j;
    }

    async close(): Promise<void> {
        await Promise.all([
            this.postgres?.close(),
            this.mongo?.close(),
            this.redis?.close(),
            this.elastic?.close(),
            this.neo4j?.close(),
        ]);
        console.log('All database connections closed');
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let dbFactory: DatabaseFactory | null = null;

export function getDatabaseFactory(config?: DatabaseConfig): DatabaseFactory {
    if (!dbFactory && config) {
        dbFactory = new DatabaseFactory();
    }
    if (!dbFactory) {
        throw new Error('Database factory not initialized');
    }
    return dbFactory;
}

export async function initializeDatabases(config: DatabaseConfig): Promise<DatabaseFactory> {
    dbFactory = new DatabaseFactory();
    await dbFactory.initialize(config);
    return dbFactory;
}

export async function closeDatabases(): Promise<void> {
    if (dbFactory) {
        await dbFactory.close();
        dbFactory = null;
    }
}
