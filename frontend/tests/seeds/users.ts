import { getDbConnection } from "./connection"

const USER_SEEDS: Record<string, { email: string; passwordHash: string; displayName: string }> = {
  andi: {
    email: "andi@example.com",
    passwordHash: "$argon2id$v=19$m=19456,t=2,p=1$wraPSMy/1I1q/uPKl5pO/A$iHydrb09UzwLQISYVP2drdU+r9Ztj/HycEevJHul9vc", // "password123"
    displayName: "Andi",
  },
}

export class UserDbHelper {
  private db: any

  constructor(db: any) {
    this.db = db
  }

  seedUser(username: string, projectSlug: string = "foobar") {
    const seed = USER_SEEDS[username]
    if (!seed) {
      throw new Error(`No seed data found for user: ${username}`)
    }

    this.db.prepare("DELETE FROM users WHERE email = ?").run(seed.email)
    const existingUser = this.db.prepare("SELECT id FROM users WHERE email = ?").get(seed.email) as { id: number }
    if (existingUser) {
      this.db.prepare("DELETE FROM people WHERE user_id = ?").run(existingUser.id)
    }

    const userStmt = this.db.prepare("INSERT INTO users (email, hashed_password) VALUES (?, ?)")
    const userResult = userStmt.run(seed.email, seed.passwordHash)
    const userId = userResult.lastInsertRowid

    const project = this.db.prepare("SELECT id FROM projects WHERE slug = ?").get(projectSlug) as { id: number }
    if (!project) {
      throw new Error(`Project ${projectSlug} must be seeded before seeding a user.`)
    }

    this.db.prepare("INSERT INTO people (display_name, user_id, project_id) VALUES (?, ?, ?)").run(seed.displayName, userId, project.id)
  }
}
