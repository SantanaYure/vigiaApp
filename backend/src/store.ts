import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
const configuredDbPath=process.env.VIGIA_DB_PATH;
const defaultDbPath=process.env.VERCEL ? "/tmp/vigia.sqlite" : "data/vigia.sqlite";
export const dbPath = resolve(configuredDbPath || defaultDbPath);
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
db.exec(`CREATE TABLE IF NOT EXISTS records (
  kind TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL,
  PRIMARY KEY (kind, id)
);`);
export function all<T>(kind: string): T[] {
  return (db.prepare("SELECT data FROM records WHERE kind=? ORDER BY rowid DESC").all(kind) as {data:string}[]).map(r=>JSON.parse(r.data) as T);
}
export function get<T>(kind: string, id: string): T | undefined {
  const row = db.prepare("SELECT data FROM records WHERE kind=? AND id=?").get(kind,id) as {data:string}|undefined;
  return row ? JSON.parse(row.data) as T : undefined;
}
export function put(kind: string, id: string, data: unknown) {
  db.prepare("INSERT INTO records(kind,id,data) VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data").run(kind,id,JSON.stringify(data));
}
export function transaction(fn: () => void) {
  db.exec("BEGIN IMMEDIATE");
  try { fn(); db.exec("COMMIT"); } catch (e) { db.exec("ROLLBACK"); throw e; }
}
