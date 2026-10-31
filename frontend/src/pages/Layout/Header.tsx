import { AppShell, Burger, Group, Menu } from "@mantine/core"
import { Link, useNavigate } from "react-router-dom"
import { Anchor, PersonBadge } from "../../components"
import { useAppSelector } from "../../store"
import { currentProjectPath, useCurrentProjectSlug, ProjectSwitcher } from "../../contexts/projects"
import { getApi } from "../../api"

interface HeaderProps {
  onToggle: () => void
  opened: boolean
}

export default function Header({ onToggle, opened }: HeaderProps) {
  const project = useAppSelector((state) => state.project)
  const person_id = useAppSelector((state) => state.me?.person_id)
  const person = useAppSelector((state) => state.people[person_id || -1])
  const projectSlug = useCurrentProjectSlug()
  const navigate = useNavigate()

  const onLogout = () => {
    getApi()
      .api.logOut()
      .then(() => {
        navigate("/")
      })
      .catch((error) => {
        console.error("Failed to log out:", error)
      })
  }

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Group>
          <Burger opened={opened} onClick={onToggle} hiddenFrom="sm" size="sm" />
          <Anchor href="/">{project ? project.name : "Radicalise!"}</Anchor>
          <ProjectSwitcher value={project} canCreateNew />
        </Group>
        {person && (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <div>
                <PersonBadge person={person} variant="transparent" noText />
              </div>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item component={Link} to={currentProjectPath(`/people/${person.id}`, projectSlug)}>
                Profile
              </Menu.Item>
              <Menu.Item onClick={onLogout}>Logout</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </AppShell.Header>
  )
}
