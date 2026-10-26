import { AppShell, Burger, Group } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Outlet } from "react-router-dom"
import { Anchor, PersonBadge } from "../../components"
import { useAppSelector } from "../../store"
import { currentProjectPath, useCurrentProjectSlug } from "../LoadProjectState"

export default function Layout() {
  const [opened, { toggle }] = useDisclosure()
  const project = useAppSelector((state) => state.project)
  const person_id = useAppSelector((state) => state.me?.person_id)
  const person = useAppSelector((state) => state.people[person_id || -1])
  const projectSlug = useCurrentProjectSlug()

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Anchor href="/">{project ? project.name : "Radicalise!"}</Anchor>
          </Group>
          {person && (
            <Anchor href={currentProjectPath(`/people/${person.id}`, projectSlug)} onClick={toggle}>
              <PersonBadge person={person} variant="transparent" noText />
            </Anchor>
          )}
        </Group>
      </AppShell.Header>
      <Outlet />
    </AppShell>
  )
}
