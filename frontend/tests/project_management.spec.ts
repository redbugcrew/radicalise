import { test, expect } from "@playwright/test"
import { dbSeeds } from "./seeds/connection"
import { LoginPage } from "./pages/LoginPage"

test.describe("Project Management", () => {
  let seeds: ReturnType<typeof dbSeeds>

  test.beforeEach(async () => {
    seeds = dbSeeds()
    seeds.projects.seedProject("foobar")
    seeds.users.seedUser("andi", "foobar")
  })

  test.afterEach(() => {
    if (seeds?.db) seeds.db.close()
  })

  test("existing user should be able to create a new project", async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login("andi@example.com", "password123")

    await expect(page).toHaveURL("/project/foobar/dashboard")

    // Ensure the header has loaded the project info before interacting with the switcher
    await expect(page.getByText("Foo Bar Project")).toBeVisible()

    // Open the project switcher
    await page.getByTestId("project-switcher-button").click()

    // Click the "Create new project" link
    await page.getByTestId("create-project-link").click()

    // Verify navigation
    await expect(page).toHaveURL("/projects/new")
    await expect(page.getByRole("heading", { level: 1, name: "New Project" })).toBeVisible()

    // Generate a random slug to avoid "already taken" errors on repeat runs
    const randomSlug = `test-project-${Math.random().toString(36).substring(2, 9)}`

    // Fill out the project form
    await page.getByRole("textbox", { name: "Name", exact: true }).fill("Test Project")
    await page.getByLabel("Noun name").fill("The Test Project")
    await page.getByLabel("URL name").fill(randomSlug)
    await page.getByLabel("Description").fill("This is a test project description")

    // Submit the form
    await page.getByRole("button", { name: "Submit" }).click()

    // Verify navigation to the new project's dashboard
    await expect(page).toHaveURL(`/project/${randomSlug}/dashboard`)
    await expect(page.getByText("Test Project")).toBeVisible()

    // // Verify success - we expect the action result to show success or redirect
    // // Since NewProject.tsx uses actionSuccess(), it likely shows a success message
    // await expect(page.getByText("Success")).toBeVisible()
  })
})
