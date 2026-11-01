import { Page, expect } from "@playwright/test"

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/auth/login")
    await expect(this.page.getByText("Welcome back!")).toBeVisible()
  }

  async login(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email)
    await this.page.getByRole("textbox", { name: "Password" }).fill(password)
    await this.page.getByRole("button", { name: "Sign in" }).click()
  }
}
