import { AppShell, Burger, Group, Menu } from "@mantine/core"
import { Link, useNavigate } from "react-router-dom"
import { Anchor, PersonBadge } from "../../components"
import { useAppSelector } from "../../store"
import { currentProjectPath, useCurrentProjectSlug, ProjectSwitcher } from "../../contexts/projects"
import { getApi } from "../../api"
import { useUserPermissions } from "../../contexts/auth/pages/auth_hooks"

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
  const userPermissions = useUserPermissions()

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
          <Anchor href="/" data-test-id="current-project-name">
            {project ? project.name : "Radicalise!"}
          </Anchor>

          <ProjectSwitcher value={project} canCreateNew={userPermissions?.can_create_projects} />
        </Group>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <div>
              <PersonBadge person={person} variant="transparent" noText allowNull textOverride={person?.display_name ?? "Your user"} />
            </div>
          </Menu.Target>

          <Menu.Dropdown>
            {person && (
              <Menu.Item component={Link} to={currentProjectPath(`/people/${person.id}`, projectSlug)}>
                Profile
              </Menu.Item>
            )}

            <Menu.Item onClick={onLogout}>Logout</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </AppShell.Header>
  )
}
