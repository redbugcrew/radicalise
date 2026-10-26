import { test, expect } from "@playwright/test"
import { dbSeeds } from "./seeds/connection"

test.describe("User accessing project", () => {
  let seeds: ReturnType<typeof dbSeeds>

  test.beforeEach(async () => {
    seeds = dbSeeds()
    seeds.projects.seedProject("foobar")
    seeds.users.seedUser("andi", "foobar")
  })

  test.afterEach(() => {
    if (seeds?.db) seeds.db.close()
  })

  test("should see the login page if not logged in", async ({ page }) => {
    await page.goto("/project/foobar/")
    await expect(page.getByText("Welcome back!")).toBeVisible()
  })

  test("should be able to log in as andi", async ({ page }) => {
    await page.goto("/project/foobar/")
    await expect(page.getByText("Welcome back!")).toBeVisible()

    // Fill in credentials for 'andi' from USER_SEEDS
    await page.getByLabel("Email").fill("andi@example.com")
    await page.getByRole("textbox", { name: "Password" }).fill("password123")
    await page.getByRole("button", { name: "Sign in" }).click()

    // Verify successful login
    await expect(page).toHaveURL("/project/foobar/dashboard")
  })
})
