import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import path from "path";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "";
const forcePostgres = process.env.USE_POSTGRES === "true";
const usePostgres =
  forcePostgres ||
  (databaseUrl.length > 0 &&
    !databaseUrl.includes("localhost") &&
    !databaseUrl.includes("127.0.0.1"));

const globalForDb = globalThis as typeof globalThis & {
  __fixlensPool?: Pool;
  __fixlensPglite?: PGlite;
  __fixlensDb?: any;
  __fixlensInitPromise?: Promise<void>;
};

let activeDb: any;
let activePool: Pool | undefined;
let activePglite: PGlite | undefined;

if (usePostgres) {
  const connStr = databaseUrl || "postgresql://postgres:postgres@localhost:5432/fixlens";
  activePool =
    globalForDb.__fixlensPool ??
    new Pool({
      connectionString: connStr,
    });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__fixlensPool = activePool;
  }
  activeDb = drizzlePg(activePool, { schema });
} else {
  if (!globalForDb.__fixlensPglite) {
    const dbPath = process.env.PGLITE_DIR || path.join(process.cwd(), ".fixlens-db");
    globalForDb.__fixlensPglite = new PGlite(dbPath);
  }
  activePglite = globalForDb.__fixlensPglite;
  activeDb = drizzlePglite(activePglite, { schema });
}

export const pool = activePool as Pool;
export const pglite = activePglite;
export const db = activeDb;
export const isPglite = !usePostgres;

const TABLE_DDL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    preferred_language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS technicians (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT NOT NULL,
    years_experience INTEGER NOT NULL DEFAULT 1,
    rating INTEGER NOT NULL DEFAULT 45,
    available BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS repair_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    object_label TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    photo_before_url TEXT NOT NULL,
    photo_after_url TEXT,
    damage_summary TEXT NOT NULL DEFAULT '',
    damage_severity TEXT NOT NULL DEFAULT 'moderate',
    damage_box JSONB,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    estimated_time_minutes INTEGER NOT NULL DEFAULT 20,
    estimated_cost_min INTEGER NOT NULL DEFAULT 0,
    estimated_cost_max INTEGER NOT NULL DEFAULT 0,
    safety_level TEXT NOT NULL DEFAULT 'safe',
    safety_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_diy_safe BOOLEAN NOT NULL DEFAULT true,
    is_dangerous BOOLEAN NOT NULL DEFAULT false,
    danger_category TEXT,
    generated_video_url TEXT,
    audio_narration_url_en TEXT,
    audio_narration_url_ta TEXT,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    materials JSONB NOT NULL DEFAULT '[]'::jsonb,
    narration_en TEXT NOT NULL DEFAULT '',
    narration_ta TEXT NOT NULL DEFAULT '',
    video_duration_seconds INTEGER NOT NULL DEFAULT 15,
    status TEXT NOT NULL DEFAULT 'analyzing',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
  );

  CREATE TABLE IF NOT EXISTS saved_repair_guides (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repair_request_id TEXT REFERENCES repair_requests(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'easy',
    estimated_time_minutes INTEGER NOT NULL DEFAULT 15,
    estimated_cost_min INTEGER NOT NULL DEFAULT 0,
    estimated_cost_max INTEGER NOT NULL DEFAULT 0,
    tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    materials JSONB NOT NULL DEFAULT '[]'::jsonb,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    safety_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    video_url TEXT,
    cover_image_url TEXT,
    user_notes TEXT NOT NULL DEFAULT '',
    is_bookmarked BOOLEAN NOT NULL DEFAULT false,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS escalations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repair_request_id TEXT NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    technician_id TEXT REFERENCES technicians(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repair_request_id TEXT REFERENCES repair_requests(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  );
`;

export async function ensureDbInitialized(): Promise<void> {
  if (globalForDb.__fixlensInitPromise) {
    return globalForDb.__fixlensInitPromise;
  }

  globalForDb.__fixlensInitPromise = (async () => {
    try {
      if (activePglite) {
        await activePglite.exec(TABLE_DDL);
      } else if (activePool) {
        await activePool.query(TABLE_DDL);
      }
    } catch (err: any) {
      // In build phase with multi-worker threads, locks may occur on shared dir
      if (process.env.NEXT_PHASE !== "phase-production-build") {
        console.warn("[FixLens DB] Notice during table init:", err?.message || err);
      }
    }
  })();

  return globalForDb.__fixlensInitPromise;
}

if (process.env.NEXT_PHASE !== "phase-production-build") {
  ensureDbInitialized().catch(() => {});
}

