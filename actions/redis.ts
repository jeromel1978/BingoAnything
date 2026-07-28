"use server";
import { createClient } from "redis";
import { nanoid } from "nanoid";
import { Todo } from "@/components/todo";

// 6‑character ID generator
const generateId = () => nanoid(6);

// Create Redis client (adjust URL as needed)
const client = createClient({
  url: process.env.BINGOANYTHING_REDIS_URL ?? "redis://localhost:6379",
});

client.connect();

export interface ListData {
  data: Todo[];
  name: string;
}
export interface StoredRecord<T> {
  id: string;
  data: ListData;
}

/**
 * Save a record to Redis using a 6‑character NanoID.
 * Optionally set a TTL (in seconds).
 */
export async function saveRecord<T>(
  data: ListData,
  ttlSeconds?: number,
): Promise<StoredRecord<ListData>> {
  const id = generateId();
  const payload = JSON.stringify(data);

  if (ttlSeconds) {
    await client.set(id, payload, { EX: ttlSeconds });
  } else {
    await client.set(id, payload);
  }

  return { id, data };
}

/**
 * Load a record from Redis by ID.
 * Returns null if not found.
 */
export async function loadRecord<ListData>(
  id: string,
): Promise<ListData | null> {
  const raw = await client.get(id);
  if (!raw) return null;
  return JSON.parse(raw) as ListData;
}

/**
 * Delete a record by ID.
 */
export async function deleteRecord(id: string): Promise<boolean> {
  const result = await client.del(id);
  return result > 0;
}
