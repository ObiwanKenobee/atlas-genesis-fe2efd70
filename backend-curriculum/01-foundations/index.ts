/**
 * Module 1: Programming Foundations
 * 
 * Core data structures and algorithms for backend development
 */

// ============================================================================
// 1.1 TYPE SYSTEM - Basic Types and Interfaces
// ============================================================================

// Primitive types
type UserId = number;
type Username = string;
type Email = string;
type UserRole = "admin" | "user" | "moderator";

// Complex types using interfaces
interface User {
  id: UserId;
  username: Username;
  email: Email;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  preferences?: {
    theme: "light" | "dark";
    notifications: boolean;
    language: string;
  };
}

// Union and intersection types
type StringOrNumber = string | number;

interface ErrorResponse {
  error: string;
  code: number;
}

interface SuccessResponse<T> {
  data: T;
  message: string;
}

type ApiResponse<T> = ErrorResponse | SuccessResponse<T>;

// Generic utility types
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };

// ============================================================================
// 1.2 CONTROL FLOW - Conditionals, Loops, and Error Handling
// ============================================================================

function processUser(user: User | null): string {
  // Early return pattern
  if (!user) {
    return "No user provided";
  }
  
  // Switch statement
  switch (user.role) {
    case "admin":
      return `Admin: ${user.username}`;
    case "moderator":
      return `Moderator: ${user.username}`;
    case "user":
      return `User: ${user.username}`;
    default:
      return `Unknown: ${user.username}`;
  }
}

// Custom error class
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateUserInput(input: unknown): asserts input is User {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Invalid input", "body", input);
  }
  
  const obj = input as Record<string, unknown>;
  if (typeof obj.id !== "number") {
    throw new ValidationError("ID must be a number", "id", obj.id);
  }
  if (typeof obj.username !== "string") {
    throw new ValidationError("Username must be a string", "username", obj.username);
  }
}

// ============================================================================
// 1.3 FUNCTIONS - Types and Modular Design
// ============================================================================

// Function type signatures
type MathOperation = (a: number, b: number) => number;
type AsyncCallback<T> = (error: Error | null, result?: T) => void;

// Higher-order functions
function createLogger(prefix: string): (message: string) => void {
  return (message: string): void => {
    console.log(`[${prefix}] ${new Date().toISOString()}: ${message}`);
  };
}

// Generic functions
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Function overloading
function formatUser(user: User): string;
function formatUser(user: null): string;
function formatUser(user: User | null): string {
  if (!user) return "No user";
  return `${user.username} (${user.role})`;
}

// ============================================================================
// 1.4 DATA STRUCTURES - Collections, Stacks, Queues
// ============================================================================

// Stack implementation
class Stack<T> {
  private items: T[] = [];
  
  push(item: T): void {
    this.items.push(item);
  }
  
  pop(): T | undefined {
    return this.items.pop();
  }
  
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  
  size(): number {
    return this.items.length;
  }
}

// Queue implementation
class Queue<T> {
  private items: T[] = [];
  
  enqueue(item: T): void {
    this.items.push(item);
  }
  
  dequeue(): T | undefined {
    return this.items.shift();
  }
  
  peek(): T | undefined {
    return this.items[0];
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Priority Queue
interface PriorityItem<T> {
  item: T;
  priority: number;
}

class PriorityQueue<T> {
  private items: PriorityItem<T>[] = [];
  
  enqueue(item: T, priority: number): void {
    this.items.push({ item, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }
  
  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }
}

// LRU Cache
class LRUCache<K, V> {
  private maxSize: number;
  private cache = new Map<K, V>();
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// ============================================================================
// 1.5 ALGORITHMS - Sorting, Searching, Memoization
// ============================================================================

// Binary search
function binarySearch<T>(
  arr: T[],
  target: T,
  compare: (a: T, b: T) => number
): number {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const cmp = compare(arr[mid], target);
    
    if (cmp === 0) return mid;
    if (cmp < 0) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}

// Memoization
function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T
): T {
  const cache = new Map<string, unknown>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Debounce
function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): T {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  }) as T;
}

// ============================================================================
// EXERCISES
// ============================================================================

/**
 * Exercise 1.1: Implement a LinkedList
 */
class LinkedList<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private length: number = 0;
  
  append(value: T): void {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail!.next = node;
      node.prev = this.tail;
      this.tail = node;
    }
    this.length++;
  }
  
  prepend(value: T): void {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.length++;
  }
  
  delete(value: T): void {
    let current = this.head;
    while (current) {
      if (current.value === value) {
        if (current.prev) current.prev.next = current.next;
        if (current.next) current.next.prev = current.prev;
        if (current === this.head) this.head = current.next;
        if (current === this.tail) this.tail = current.prev;
        this.length--;
        return;
      }
      current = current.next;
    }
  }
  
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

class ListNode<T> {
  value: T;
  next: ListNode<T> | null;
  prev: ListNode<T> | null;
  
  constructor(value: T) {
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}

/**
 * Exercise 1.2: Implement a Trie for string search
 */
class Trie {
  private root: TrieNode = new TrieNode();
  
  insert(word: string): void {
    let current = this.root;
    for (const char of word) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isEnd = true;
  }
  
  search(word: string): boolean {
    const node = this.traverse(word);
    return node !== null && node.isEnd;
  }
  
  startsWith(prefix: string): boolean {
    return this.traverse(prefix) !== null;
  }
  
  private traverse(prefix: string): TrieNode | null {
    let current = this.root;
    for (const char of prefix) {
      if (!current.children[char]) {
        return null;
      }
      current = current.children[char];
    }
    return current;
  }
}

class TrieNode {
  children: Record<string, TrieNode> = {};
  isEnd: boolean = false;
}

// ============================================================================
// TESTS
// ============================================================================

describe("Module 1: Programming Foundations", () => {
  describe("Data Structures", () => {
    test("Stack operations", () => {
      const stack = new Stack<number>();
      expect(stack.isEmpty()).toBe(true);
      
      stack.push(1);
      stack.push(2);
      stack.push(3);
      
      expect(stack.size()).toBe(3);
      expect(stack.peek()).toBe(3);
      expect(stack.pop()).toBe(3);
      expect(stack.size()).toBe(2);
    });
    
    test("Queue operations", () => {
      const queue = new Queue<string>();
      expect(queue.isEmpty()).toBe(true);
      
      queue.enqueue("first");
      queue.enqueue("second");
      
      expect(queue.dequeue()).toBe("first");
      expect(queue.peek()).toBe("second");
    });
    
    test("Priority Queue", () => {
      const pq = new PriorityQueue<string>();
      pq.enqueue("low", 3);
      pq.enqueue("high", 1);
      pq.enqueue("medium", 2);
      
      expect(pq.dequeue()).toBe("high");
      expect(pq.dequeue()).toBe("medium");
      expect(pq.dequeue()).toBe("low");
    });
    
    test("LRU Cache", () => {
      const cache = new LRUCache<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3); // Should evict 'a'
      
      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBe(2);
      expect(cache.get("c")).toBe(3);
    });
    
    test("LinkedList", () => {
      const list = new LinkedList<number>();
      list.append(1);
      list.append(2);
      list.prepend(0);
      
      expect(list.toArray()).toEqual([0, 1, 2]);
      
      list.delete(1);
      expect(list.toArray()).toEqual([0, 2]);
    });
    
    test("Trie", () => {
      const trie = new Trie();
      trie.insert("apple");
      trie.insert("app");
      trie.insert("banana");
      
      expect(trie.search("app")).toBe(true);
      expect(trie.search("ap")).toBe(false);
      expect(trie.startsWith("ap")).toBe(true);
      expect(trie.startsWith("ban")).toBe(true);
    });
  });
  
  describe("Algorithms", () => {
    test("Binary Search", () => {
      const arr = [1, 3, 5, 7, 9, 11];
      expect(binarySearch(arr, 5, (a, b) => a - b)).toBe(2);
      expect(binarySearch(arr, 6, (a, b) => a - b)).toBe(-1);
      expect(binarySearch(arr, 1, (a, b) => a - b)).toBe(0);
    });
  });
});

export { 
  User, 
  Stack, 
  Queue, 
  PriorityQueue, 
  LRUCache, 
  LinkedList, 
  Trie,
  binarySearch,
  memoize,
  debounce
};
