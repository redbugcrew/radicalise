import { AppShell, Burger, Group, Menu } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { Anchor, PersonBadge } from "../../components"
import { useAppSelector } from "../../store"
import { currentProjectPath, useCurrentProjectSlug } from "../LoadProjectState"
import { getApi } from "../../api"

export default function Layout() {
  const [opened, { toggle }] = useDisclosure()
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
    <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Anchor href="/">{project ? project.name : "Radicalise!"}</Anchor>
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
      <Outlet />
    </AppShell>
  )
}
