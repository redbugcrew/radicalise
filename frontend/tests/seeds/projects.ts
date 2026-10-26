import { CircleDbHelper } from "./circles"

const PROJECT_SEEDS: Record<string, { name: string; nounName: string; description: string }> = {
  foobar: {
    name: "Foo Bar Project",
    nounName: "Foo Bar",
    description: "A test project for E2E",
  },
}

export class ProjectDbHelper {
  private db: any

  constructor(db: any) {
    this.db = db
  }

  seedProject(slug: string) {
    const seed = PROJECT_SEEDS[slug]
    if (!seed) {
      throw new Error(`No seed data found for project slug: ${slug}`)
    }

    // 1. Identify project ID to clean up children
    const project = this.db.prepare("SELECT id FROM projects WHERE slug = ?").get(slug) as { id: number }

    if (project) {
      const projectId = project.id
      // We MUST delete child records before deleting the project to avoid FK failures.
      // Since circles can have 'inside_circle_id' referencing other circles,
      // we might need to clear the FKs or just delete all circles for the project.

      // First, nullify inside_circle_id for all circles in this project to avoid recursive FK issues
      this.db.prepare("UPDATE circles SET inside_circle_id = NULL WHERE project_id = ?").run(projectId)

      this.db.prepare("DELETE FROM people WHERE project_id = ?").run(projectId)
      this.db.prepare("DELETE FROM intervals WHERE project_id = ?").run(projectId)
      this.db.prepare("DELETE FROM crews WHERE project_id = ?").run(projectId)
      this.db.prepare("DELETE FROM circles WHERE project_id = ?").run(projectId)
    }

    // 2. Now safe to delete the project
    this.db.prepare("DELETE FROM projects WHERE slug = ?").run(slug)

    // 3. Insert project
    const id = slug === "foobar" ? 1 : null
    if (id) {
      this.db
        .prepare("INSERT INTO projects (id, name, description, noun_name, slug) VALUES (?, ?, ?, ?, ?)")
        .run(id, seed.name, seed.description, seed.nounName, slug)
    } else {
      this.db
        .prepare("INSERT INTO projects (name, description, noun_name, slug) VALUES (?, ?, ?, ?)")
        .run(seed.name, seed.description, seed.nounName, slug)
    }

    // 4. Automatically seed circles for this project
    const circleHelper = new CircleDbHelper(this.db)
    circleHelper.seedCirclesForProject(slug)
  }

  deleteProject(slug: string) {
    this.db.prepare("DELETE FROM projects WHERE slug = ?").run(slug)
  }
}
