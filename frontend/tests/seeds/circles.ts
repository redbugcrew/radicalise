import { getDbConnection } from './connection';

const CIRCLE_SEEDS: Record<string, Record<string, { name: string; slug: string }>> = {
  foobar: {
    peeps: {
      name: 'Peeps',
      slug: 'peeps',
    },
  },
};

export class CircleDbHelper {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  seedCirclesForProject(projectSlug: string) {
    const project = this.db.prepare('SELECT id FROM projects WHERE slug = ?').get(projectSlug) as { id: number };
    if (!project) {
      throw new Error(`Project ${projectSlug} must be seeded before seeding circles.`);
    }

    const circles = CIRCLE_SEEDS[projectSlug];
    if (!circles) return;

    for (const slug in circles) {
      const circle = circles[slug];
      // Clean up existing circle with same slug in this project
      this.db.prepare('DELETE FROM circles WHERE project_id = ? AND slug = ?').run(project.id, slug);
      
      // Insert circle
      this.db.prepare('INSERT INTO circles (project_id, name, slug) VALUES (?, ?, ?)')
        .run(project.id, circle.name, circle.slug);
    }
  }
}
