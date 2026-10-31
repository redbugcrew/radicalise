import { AppShell, Container } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Outlet } from "react-router-dom"
import Header from "./Header"

export default function BlankLayout() {
  const [opened, { toggle }] = useDisclosure()

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header onToggle={toggle} opened={opened} />
      <AppShell.Main>
        <Container p={0}>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
