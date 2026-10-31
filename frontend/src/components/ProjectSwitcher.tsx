import { Menu, ActionIcon } from "@mantine/core"
import type { Project } from "../api/Api"
import { IconChevronDown } from "@tabler/icons-react"
import { Link } from "react-router-dom"
import { MyProjectsContext } from "../pages"

interface ProjectSwitcherProps {
  value?: Project | null
}

export default function ProjectSwitcher({ value }: ProjectSwitcherProps) {
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
          </Menu.Dropdown>
        </Menu>
      )}
    </MyProjectsContext.Consumer>
  )
}
