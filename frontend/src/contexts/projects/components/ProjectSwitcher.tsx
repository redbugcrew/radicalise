import { Menu, ActionIcon } from "@mantine/core"
import type { Project } from "../../../api/Api"
import { IconChevronDown, IconPlus } from "@tabler/icons-react"
import { Link } from "react-router-dom"
import { MyProjectsContext } from "../pages/LoadMyProjects"

interface ProjectSwitcherProps {
  value?: Project | null
  canCreateNew?: boolean
}

export default function ProjectSwitcher({ value, canCreateNew }: ProjectSwitcherProps) {
  return (
    <MyProjectsContext.Consumer>
      {(myProjects) => (
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon color="dark">
              <IconChevronDown size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            {myProjects.map((project) => (
              <Menu.Item key={project.id} component={Link} to={`/project/${project.slug}`} disabled={value?.id === project.id}>
                {project.name}
              </Menu.Item>
            ))}
            {canCreateNew && (
              <Menu.Item component={Link} to="/projects/new" color="blue" leftSection={<IconPlus size={14} />}>
                Create new project
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      )}
    </MyProjectsContext.Consumer>
  )
}
