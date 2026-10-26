import Database from "better-sqlite3"
import path from "path"
import { fileURLToPath } from "url"
import { ProjectDbHelper } from "./projects"
import { UserDbHelper } from "./users"
import { CircleDbHelper } from "./circles"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Resolves the database path.
 * We try to use an environment variable first, otherwise we fallback to
 * a path relative to this file.
 */
function resolveDbPath() {
  if (process.env.TEST_DATABASE_URL) {
    const envPath = process.env.TEST_DATABASE_URL;
    if (envPath.startsWith('/')) {
      return envPath;
    }
    return path.resolve(process.cwd(), envPath);
  }

  return path.resolve(__dirname, "../../../backend/data/test/test_radicalise.sqlite")
}

const DB_PATH = resolveDbPath()

export const getDbConnection = () => new Database(DB_PATH)

export function dbSeeds() {
  const db = getDbConnection()
  return {
    db,
    projects: new ProjectDbHelper(db),
    users: new UserDbHelper(db),
    circles: new CircleDbHelper(db),
  }
}
