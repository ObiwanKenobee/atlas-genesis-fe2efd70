/**
 * Knowledge Graph Service
 * Entity Relationship Management for Atlas Humanitarian
 * 
 * Capabilities:
 * - Entity Management (create, update, delete)
 * - Relationship Tracking
 * - Graph Traversal (BFS, DFS, shortest path)
 * - Semantic Search
 * - Entity Resolution
 * - Knowledge Inference
 */

import { v4 as uuidv4 } from 'uuid';
import { TelemetryService } from './observability/telemetry';

// ============================================================================
// Type Definitions
// ============================================================================

export interface KnowledgeGraph {
  id: string;
  name: string;
  description: string;
  entities: Entity[];
  relationships: Relationship[];
  statistics: GraphStatistics;
  createdAt: string;
  updatedAt: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  description?: string;
  properties: EntityProperties;
  embeddings?: number[];
  confidence: number;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export type EntityType = 
  | 'PERSON'
  | 'ORGANIZATION'
  | 'LOCATION'
  | 'PROJECT'
  | 'EVENT'
  | 'RESOURCE'
  | 'IMPACT_METRIC'
  | 'STAKEHOLDER'
  | 'POLICY'
  | 'TECHNOLOGY'
  | 'COMMUNITY'
  | 'NATURAL_RESOURCE'
  | 'INFRASTRUCTURE';

export interface EntityProperties {
  [key: string]: string | number | boolean | string[] | number[] | null;
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  properties: RelationshipProperties;
  confidence: number;
  source?: string;
  createdAt: string;
}

export type RelationshipType = 
  | 'PARTICIPATES_IN'
  | 'LOCATED_IN'
  | 'MANAGES'
  | 'FUNDED_BY'
  | 'PARTNERED_WITH'
  | 'IMPACTS'
  | 'DEPENDS_ON'
  | 'SUPPLIES'
  | 'SERVES'
  | 'CONTAINS'
  | 'AFFECTS'
  | 'PRODUCES'
  | 'CONSUMES'
  | 'COLLABORATES_WITH'
  | 'REQUIRES'
  | 'ENABLES'
  | 'BLOCKS'
  | 'MEASURES'
  | 'REPORTS_TO'
  | 'OWNS';

export interface RelationshipProperties {
  weight?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  description?: string;
  [key: string]: any;
}

export interface GraphStatistics {
  entityCount: number;
  relationshipCount: number;
  entityTypeDistribution: Record<EntityType, number>;
  relationshipTypeDistribution: Record<RelationshipType, number>;
  averageDegree: number;
  connectedComponents: number;
  density: number;
}

export interface SearchQuery {
  query: string;
  entityTypes?: EntityType[];
  relationshipTypes?: RelationshipType[];
  limit?: number;
  offset?: number;
  minConfidence?: number;
}

export interface SearchResult {
  entities: Entity[];
  totalCount: number;
  queryTime: number;
}

export interface PathResult {
  path: Entity[];
  relationships: Relationship[];
  totalWeight: number;
  length: number;
}

export interface TraversalResult {
  visited: Entity[];
  relationships: Relationship[];
  depth: number;
  breadth: number;
}

export interface EntityResolutionResult {
  duplicates: DuplicateGroup[];
  merges: MergedEntity[];
  confidence: number;
}

export interface DuplicateGroup {
  entities: Entity[];
  similarity: number;
  reason: string;
}

export interface MergedEntity {
  originalEntities: string[];
  mergedEntity: Entity;
}

export interface InferenceResult {
  inferredEntity?: Entity;
  inferredRelationships: InferredRelationship[];
  confidence: number;
  reasoning: string;
}

export interface InferredRelationship {
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  confidence: number;
  rule: string;
}

export interface GraphQuery {
  entities?: Partial<Entity>;
  relationships?: {
    sourceType?: EntityType;
    targetType?: EntityType;
    type?: RelationshipType;
    minConfidence?: number;
  };
  traversal?: {
    type: 'bfs' | 'dfs' | 'shortest_path';
    startEntityId: string;
    maxDepth?: number;
    targetEntityId?: string;
  };
  aggregation?: {
    groupBy: string;
    aggregates: { field: string; operation: 'count' | 'sum' | 'avg' | 'min' | 'max' }[];
  };
}

// ============================================================================
// Knowledge Graph Service Class
// ============================================================================

export class KnowledgeGraphService {
  private graphs: Map<string, KnowledgeGraph> = new Map();
  private index: Map<string, Set<string>> = new Map(); // term -> entity IDs
  private telemetry: TelemetryService;

  constructor() {
    this.telemetry = new TelemetryService({
      serviceName: 'knowledge-graph-service',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      enableConsole: true,
      enableFile: false,
      enableExternal: false,
      samplingRate: 1,
      correlationIdHeader: 'X-Correlation-ID',
      piiFilterPatterns: []
    });
  }

  // ============================================================================
  // Graph Management
  // ============================================================================

  /**
   * Create a new knowledge graph
   */
  createGraph(name: string, description: string): KnowledgeGraph {
    const graph: KnowledgeGraph = {
      id: uuidv4(),
      name,
      description,
      entities: [],
      relationships: [],
      statistics: this.calculateStatistics({ entities: [], relationships: [] }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.graphs.set(graph.id, graph);
    this.telemetry.info('Knowledge graph created', { graphId: graph.id, name });
    return graph;
  }

  /**
   * Get a knowledge graph by ID
   */
  getGraph(graphId: string): KnowledgeGraph | undefined {
    return this.graphs.get(graphId);
  }

  /**
   * Delete a knowledge graph
   */
  deleteGraph(graphId: string): boolean {
    const deleted = this.graphs.delete(graphId);
    if (deleted) {
      this.telemetry.info('Knowledge graph deleted', { graphId });
    }
    return deleted;
  }

  /**
   * Get all graphs
   */
  getAllGraphs(): KnowledgeGraph[] {
    return Array.from(this.graphs.values());
  }

  // ============================================================================
  // Entity Management
  // ============================================================================

  /**
   * Add an entity to a graph
   */
  addEntity(graphId: string, entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Entity {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      throw new Error(`Graph ${graphId} not found`);
    }

    const newEntity: Entity = {
      ...entity,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    graph.entities.push(newEntity);
    graph.updatedAt = new Date().toISOString();
    this.updateStatistics(graph);
    this.indexEntity(newEntity);

    this.telemetry.info('Entity added', { graphId, entityId: newEntity.id, type: newEntity.type });
    return newEntity;
  }

  /**
   * Update an entity
   */
  updateEntity(graphId: string, entityId: string, updates: Partial<Entity>): Entity | undefined {
    const graph = this.graphs.get(graphId);
    if (!graph) return undefined;

    const index = graph.entities.findIndex(e => e.id === entityId);
    if (index === -1) return undefined;

    graph.entities[index] = {
      ...graph.entities[index],
      ...updates,
      id: entityId, // Prevent ID change
      updatedAt: new Date().toISOString()
    };

    graph.updatedAt = new Date().toISOString();
    this.reindexEntity(graph.entities[index]);

    return graph.entities[index];
  }

  /**
   * Delete an entity
   */
  deleteEntity(graphId: string, entityId: string): boolean {
    const graph = this.graphs.get(graphId);
    if (!graph) return false;

    const initialLength = graph.entities.length;
    graph.entities = graph.entities.filter(e => e.id !== entityId);
    
    // Remove associated relationships
    graph.relationships = graph.relationships.filter(
      r => r.sourceId !== entityId && r.targetId !== entityId
    );

    if (graph.entities.length !== initialLength) {
      graph.updatedAt = new Date().toISOString();
      this.updateStatistics(graph);
      this.unindexEntity(entityId);
      return true;
    }

    return false;
  }

  /**
   * Get entity by ID
   */
  getEntity(graphId: string, entityId: string): Entity | undefined {
    const graph = this.graphs.get(graphId);
    return graph?.entities.find(e => e.id === entityId);
  }

  /**
   * Get entities by type
   */
  getEntitiesByType(graphId: string, type: EntityType): Entity[] {
    const graph = this.graphs.get(graphId);
    return graph?.entities.filter(e => e.type === type) || [];
  }

  // ============================================================================
  // Relationship Management
  // ============================================================================

  /**
   * Add a relationship between entities
   */
  addRelationship(
    graphId: string,
    sourceId: string,
    targetId: string,
    type: RelationshipType,
    properties?: RelationshipProperties
  ): Relationship | undefined {
    const graph = this.graphs.get(graphId);
    if (!graph) return undefined;

    // Verify entities exist
    const sourceExists = graph.entities.some(e => e.id === sourceId);
    const targetExists = graph.entities.some(e => e.id === targetId);
    if (!sourceExists || !targetExists) {
      throw new Error('Source or target entity not found');
    }

    // Check for duplicate relationship
    const exists = graph.relationships.some(
      r => r.sourceId === sourceId && r.targetId === targetId && r.type === type
    );
    if (exists) {
      throw new Error('Relationship already exists');
    }

    const relationship: Relationship = {
      id: uuidv4(),
      sourceId,
      targetId,
      type,
      properties: properties || {},
      confidence: properties?.weight || 1.0,
      createdAt: new Date().toISOString()
    };

    graph.relationships.push(relationship);
    graph.updatedAt = new Date().toISOString();
    this.updateStatistics(graph);

    this.telemetry.info('Relationship added', { 
      graphId, 
      relationshipId: relationship.id,
      sourceId,
      targetId,
      type 
    });

    return relationship;
  }

  /**
   * Delete a relationship
   */
  deleteRelationship(graphId: string, relationshipId: string): boolean {
    const graph = this.graphs.get(graphId);
    if (!graph) return false;

    const initialLength = graph.relationships.length;
    graph.relationships = graph.relationships.filter(r => r.id !== relationshipId);

    if (graph.relationships.length !== initialLength) {
      graph.updatedAt = new Date().toISOString();
      this.updateStatistics(graph);
      return true;
    }

    return false;
  }

  /**
   * Get relationships for an entity
   */
  getEntityRelationships(graphId: string, entityId: string): Relationship[] {
    const graph = this.graphs.get(graphId);
    if (!graph) return [];

    return graph.relationships.filter(r => r.sourceId === entityId || r.targetId === entityId);
  }

  /**
   * Get neighbors of an entity
   */
  getEntityNeighbors(graphId: string, entityId: string, relationshipType?: RelationshipType): Entity[] {
    const graph = this.graphs.get(graphId);
    if (!graph) return [];

    const relationships = graph.relationships.filter(r => {
      const isConnected = r.sourceId === entityId || r.targetId === entityId;
      const matchesType = relationshipType ? r.type === relationshipType : true;
      return isConnected && matchesType;
    });

    const neighborIds = new Set<string>();
    relationships.forEach(r => {
      if (r.sourceId === entityId) neighborIds.add(r.targetId);
      else neighborIds.add(r.sourceId);
    });

    return graph.entities.filter(e => neighborIds.has(e.id));
  }

  // ============================================================================
  // Graph Traversal
  // ============================================================================

  /**
   * Breadth-First Search traversal
   */
  bfs(graphId: string, startEntityId: string, maxDepth: number = 3): TraversalResult {
    const graph = this.graphs.get(graphId);
    if (!graph) return { visited: [], relationships: [], depth: 0, breadth: 0 };

    const visited = new Set<string>();
    const queue: { entityId: string; depth: number }[] = [];
    const relationships: Relationship[] = [];
    let maxBreadth = 0;

    queue.push({ entityId: startEntityId, depth: 0 });
    visited.add(startEntityId);

    while (queue.length > 0) {
      const { entityId, depth } = queue.shift()!;

      if (depth > maxDepth) continue;
      maxBreadth = Math.max(maxBreadth, queue.length);

      // Get neighbors
      const neighbors = graph.relationships.filter(
        r => (r.sourceId === entityId || r.targetId === entityId) && r.confidence >= 0.5
      );

      neighbors.forEach(r => {
        relationships.push(r);
        const neighborId = r.sourceId === entityId ? r.targetId : r.sourceId;
        
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ entityId: neighborId, depth: depth + 1 });
        }
      });
    }

    const visitedEntities = graph.entities.filter(e => visited.has(e.id));

    return {
      visited: visitedEntities,
      relationships,
      depth: maxDepth,
      breadth: maxBreadth
    };
  }

  /**
   * Depth-First Search traversal
   */
  dfs(graphId: string, startEntityId: string, maxDepth: number = 5): TraversalResult {
    const graph = this.graphs.get(graphId);
    if (!graph) return { visited: [], relationships: [], depth: 0, breadth: 0 };

    const visited = new Set<string>();
    const stack: { entityId: string; depth: number }[] = [];
    const relationships: Relationship[] = [];
    let maxDepthReached = 0;

    stack.push({ entityId: startEntityId, depth: 0 });
    visited.add(startEntityId);

    while (stack.length > 0) {
      const { entityId, depth } = stack.pop()!;
      maxDepthReached = Math.max(maxDepthReached, depth);

      if (depth >= maxDepth) continue;

      const neighbors = graph.relationships.filter(
        r => (r.sourceId === entityId || r.targetId === entityId) && r.confidence >= 0.5
      );

      neighbors.forEach(r => {
        relationships.push(r);
        const neighborId = r.sourceId === entityId ? r.targetId : r.sourceId;
        
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          stack.push({ entityId: neighborId, depth: depth + 1 });
        }
      });
    }

    const visitedEntities = graph.entities.filter(e => visited.has(e.id));

    return {
      visited: visitedEntities,
      relationships,
      depth: maxDepthReached,
      breadth: 0
    };
  }

  /**
   * Find shortest path between two entities
   */
  findShortestPath(graphId: string, startId: string, endId: string): PathResult | null {
    const graph = this.graphs.get(graphId);
    if (!graph) return null;

    const queue: { entityId: string; path: Entity[]; rels: Relationship[] }[] = [];
    const visited = new Set<string>();

    const startEntity = graph.entities.find(e => e.id === startId);
    const endEntity = graph.entities.find(e => e.id === endId);
    if (!startEntity || !endEntity) return null;

    queue.push({ entityId: startId, path: [startEntity], rels: [] });
    visited.add(startId);

    while (queue.length > 0) {
      const { entityId, path, rels } = queue.shift()!;

      if (entityId === endId) {
        return {
          path,
          relationships: rels,
          totalWeight: rels.reduce((sum, r) => sum + (r.properties.weight || 1), 0),
          length: path.length
        };
      }

      const neighbors = graph.relationships.filter(
        r => (r.sourceId === entityId || r.targetId === entityId) && r.confidence >= 0.5
      );

      for (const r of neighbors) {
        const neighborId = r.sourceId === entityId ? r.targetId : r.sourceId;
        
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          const neighborEntity = graph.entities.find(e => e.id === neighborId)!;
          queue.push({
            entityId: neighborId,
            path: [...path, neighborEntity],
            rels: [...rels, r]
          });
        }
      }
    }

    return null; // No path found
  }

  // ============================================================================
  // Search and Discovery
  // ============================================================================

  /**
   * Search entities by query
   */
  search(graphId: string, query: SearchQuery): SearchResult {
    const startTime = Date.now();
    const graph = this.graphs.get(graphId);
    
    if (!graph) {
      return { entities: [], totalCount: 0, queryTime: 0 };
    }

    let results = graph.entities;

    // Filter by entity types
    if (query.entityTypes && query.entityTypes.length > 0) {
      results = results.filter(e => query.entityTypes!.includes(e.type));
    }

    // Filter by minimum confidence
    if (query.minConfidence !== undefined) {
      results = results.filter(e => e.confidence >= query.minConfidence);
    }

    // Text search (simple keyword matching)
    if (query.query) {
      const keywords = query.query.toLowerCase().split(/\s+/);
      results = results.filter(e => {
        const searchableText = [
          e.name,
          e.description,
          ...Object.values(e.properties).map(v => String(v))
        ].join(' ').toLowerCase();
        
        return keywords.some(k => searchableText.includes(k));
      });
    }

    const totalCount = results.length;

    // Pagination
    const offset = query.offset || 0;
    const limit = query.limit || 20;
    results = results.slice(offset, offset + limit);

    return {
      entities: results,
      totalCount,
      queryTime: Date.now() - startTime
    };
  }

  /**
   * Find related entities
   */
  findRelated(graphId: string, entityId: string, maxDistance: number = 2): Entity[] {
    const graph = this.graphs.get(graphId);
    if (!graph) return [];

    const traversal = this.bfs(graphId, entityId, maxDistance);
    return traversal.visited.filter(e => e.id !== entityId);
  }

  // ============================================================================
  // Entity Resolution
  // ============================================================================

  /**
   * Find potential duplicate entities
   */
  findDuplicates(graphId: string): EntityResolutionResult {
    const graph = this.graphs.get(graphId);
    if (!graph) return { duplicates: [], merges: [], confidence: 0 };

    const duplicates: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (const entity of graph.entities) {
      if (processed.has(entity.id)) continue;

      const similar = graph.entities.filter(e => {
        if (e.id === entity.id || processed.has(e.id)) return false;
        if (e.type !== entity.type) return false;
        return this.calculateSimilarity(entity, e) > 0.8;
      });

      if (similar.length > 0) {
        processed.add(entity.id);
        similar.forEach(e => processed.add(e.id));
        
        duplicates.push({
          entities: [entity, ...similar],
          similarity: this.calculateSimilarity(entity, similar[0]),
          reason: 'High textual similarity and same entity type'
        });
      }
    }

    return {
      duplicates,
      merges: [],
      confidence: duplicates.length > 0 ? 0.85 : 0
    };
  }

  /**
   * Merge duplicate entities
   */
  mergeEntities(graphId: string, entityIds: string[]): MergedEntity | undefined {
    const graph = this.graphs.get(graphId);
    if (!graph || entityIds.length < 2) return undefined;

    const entities = graph.entities.filter(e => entityIds.includes(e.id));
    if (entities.length < 2) return undefined;

    // Create merged entity
    const merged: Entity = {
      id: uuidv4(),
      type: entities[0].type,
      name: entities.reduce((longest, e) => e.name.length > longest.length ? e : longest, entities[0]).name,
      properties: {},
      confidence: entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length,
      createdAt: entities[0].createdAt,
      updatedAt: new Date().toISOString()
    };

    // Merge properties (prefer non-null values)
    const propertyKeys = new Set<string>();
    entities.forEach(e => Object.keys(e.properties).forEach(k => propertyKeys.add(k)));
    
    propertyKeys.forEach(key => {
      const values = entities.map(e => e.properties[key]).filter(v => v !== null && v !== undefined);
      merged.properties[key] = values[0]; // Take first non-null value
    });

    // Add all original IDs as reference
    merged.properties.mergedFrom = entityIds;

    // Remove old entities and add merged
    entityIds.forEach(id => this.deleteEntity(graphId, id));
    this.addEntity(graphId, merged);

    return {
      originalEntities: entityIds,
      mergedEntity: merged
    };
  }

  // ============================================================================
  // Inference
  // ============================================================================

  /**
   * Infer new relationships based on existing patterns
   */
  infer(graphId: string, sourceId: string, rules?: string[]): InferenceResult {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      return { inferredRelationships: [], confidence: 0, reasoning: 'Graph not found' };
    }

    const sourceEntity = graph.entities.find(e => e.id === sourceId);
    if (!sourceEntity) {
      return { inferredRelationships: [], confidence: 0, reasoning: 'Entity not found' };
    }

    const inferred: InferredRelationship[] = [];

    // Rule-based inference examples
    const defaultRules = [
      {
        condition: (s: Entity, r: Relationship, t: Entity) => 
          r.type === 'MANAGES' && t.type === 'PROJECT',
        inference: { type: 'IMPACTS' as RelationshipType, weight: 0.7 },
        rule: 'Entity managing a project impacts its outcomes'
      },
      {
        condition: (s: Entity, r: Relationship, t: Entity) => 
          r.type === 'FUNDED_BY' && s.type === 'PROJECT',
        inference: { type: 'DEPENDS_ON' as RelationshipType, weight: 0.8 },
        rule: 'Funding source is depended upon by the project'
      },
      {
        condition: (s: Entity, r: Relationship, t: Entity) => 
          r.type === 'LOCATED_IN' && t.type === 'COMMUNITY',
        inference: { type: 'SERVES' as RelationshipType, weight: 0.6 },
        rule: 'Entity in community location serves that community'
      }
    ];

    const rulesToApply = rules 
      ? defaultRules.filter(r => rules.includes(r.rule))
      : defaultRules;

    const sourceRelationships = graph.relationships.filter(r => r.sourceId === sourceId);

    for (const rel of sourceRelationships) {
      const targetEntity = graph.entities.find(e => e.id === rel.targetId);
      if (!targetEntity) continue;

      for (const rule of rulesToApply) {
        if (rule.condition(sourceEntity, rel, targetEntity)) {
          // Check if relationship already exists
          const exists = inferred.some(
            i => i.sourceId === sourceId && i.targetId === rel.targetId && i.type === rule.inference.type
          );
          
          if (!exists) {
            inferred.push({
              sourceId,
              targetId: rel.targetId,
              type: rule.inference.type,
              confidence: rule.inference.weight,
              rule: rule.rule
            });
          }
        }
      }
    }

    return {
      inferredRelationships: inferred,
      confidence: inferred.length > 0 ? 0.7 : 0,
      reasoning: `Inferred ${inferred.length} potential relationships using ${rulesToApply.length} rules`
    };
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get graph statistics
   */
  getStatistics(graphId: string): GraphStatistics | undefined {
    const graph = this.graphs.get(graphId);
    return graph?.statistics;
  }

  /**
   * Calculate entity similarity
   */
  private calculateSimilarity(e1: Entity, e2: Entity): number {
    if (e1.type !== e2.type) return 0;

    // Name similarity (simple)
    const name1 = e1.name.toLowerCase();
    const name2 = e2.name.toLowerCase();
    const nameSimilarity = name1 === name2 ? 1 : name1.includes(name2) || name2.includes(name1) ? 0.8 : 0;

    // Property overlap
    const keys1 = new Set(Object.keys(e1.properties));
    const keys2 = new Set(Object.keys(e2.properties));
    const overlap = [...keys1].filter(k => keys2.has(k)).length / Math.max(keys1.size, keys2.size, 1);

    return (nameSimilarity * 0.7) + (overlap * 0.3);
  }

  /**
   * Update graph statistics
   */
  private updateStatistics(graph: KnowledgeGraph): void {
    graph.statistics = this.calculateStatistics(graph);
  }

  /**
   * Calculate statistics for a graph
   */
  private calculateStatistics(graph: { entities: Entity[]; relationships: Relationship[] }): GraphStatistics {
    const entityTypeCount: Record<EntityType, number> = {} as any;
    const relationshipTypeCount: Record<RelationshipType, number> = {} as any;

    graph.entities.forEach(e => {
      entityTypeCount[e.type] = (entityTypeCount[e.type] || 0) + 1;
    });

    graph.relationships.forEach(r => {
      relationshipTypeCount[r.type] = (relationshipTypeCount[r.type] || 0) + 1;
    });

    // Calculate density
    const maxRelationships = graph.entities.length * (graph.entities.length - 1) / 2;
    const density = maxRelationships > 0 ? graph.relationships.length / maxRelationships : 0;

    // Count connected components (simplified)
    const visited = new Set<string>();
    let connectedComponents = 0;

    for (const entity of graph.entities) {
      if (!visited.has(entity.id)) {
        connectedComponents++;
        this.markComponent(entity.id, graph.relationships, visited);
      }
    }

    // Average degree
    const totalDegree = graph.relationships.reduce((sum, r) => {
      const degree = graph.entities.filter(
        e => e.id === r.sourceId || e.id === r.targetId
      ).length;
      return sum + degree;
    }, 0);
    const averageDegree = graph.entities.length > 0 ? totalDegree / graph.entities.length : 0;

    return {
      entityCount: graph.entities.length,
      relationshipCount: graph.relationships.length,
      entityTypeDistribution: entityTypeCount,
      relationshipTypeDistribution: relationshipTypeCount,
      averageDegree,
      connectedComponents,
      density
    };
  }

  private markComponent(entityId: string, relationships: Relationship[], visited: Set<string>): void {
    const stack = [entityId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = relationships.filter(
        r => r.sourceId === current || r.targetId === current
      );

      neighbors.forEach(r => {
        const neighbor = r.sourceId === current ? r.targetId : r.sourceId;
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      });
    }
  }

  // ============================================================================
  // Indexing
  // ============================================================================

  private indexEntity(entity: Entity): void {
    const terms = [
      entity.name.toLowerCase(),
      entity.type.toLowerCase(),
      ...Object.values(entity.properties).map(v => String(v).toLowerCase())
    ];

    terms.forEach(term => {
      const words = term.split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) {
          if (!this.index.has(word)) {
            this.index.set(word, new Set());
          }
          this.index.get(word)!.add(entity.id);
        }
      });
    });
  }

  private reindexEntity(entity: Entity): void {
    this.unindexEntity(entity.id);
    this.indexEntity(entity);
  }

  private unindexEntity(entityId: string): void {
    this.index.forEach(set => {
      set.delete(entityId);
    });
  }
}

// ============================================================================
// Service Factory
// ============================================================================

let kgServiceInstance: KnowledgeGraphService | null = null;

export function getKnowledgeGraphService(): KnowledgeGraphService {
  if (!kgServiceInstance) {
    kgServiceInstance = new KnowledgeGraphService();
  }
  return kgServiceInstance;
}

export function resetKnowledgeGraphService(): void {
  kgServiceInstance = null;
}
