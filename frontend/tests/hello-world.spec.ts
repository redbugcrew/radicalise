import { test, expect } from "@playwright/test"
import Database from "better-sqlite3"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.resolve(__dirname, "../../backend/data/test/test_radicalise.sqlite")

test.describe("Project Page", () => {
  let db: any

  test.beforeEach(async () => {
    db = new Database(DB_PATH)

    // Ensure clean state for the foobar project
    db.prepare("DELETE FROM projects WHERE slug = ?").run("foobar")

    // Seed the project
    db.prepare("INSERT INTO projects (name, description, noun_name, slug) VALUES (?, ?, ?, ?)").run(
      "Foo Bar Project",
      "A test project for E2E",
      "Foo Bar",
      "foobar",
    )
  })

  test.afterEach(() => {
    if (db) db.close()
  })

  test("should load project by slug", async ({ page }) => {
    await page.goto("/project/foobar/")
    await expect(page.getByText("Radicalise!")).toBeVisible()
  })
})
