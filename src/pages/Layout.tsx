import { AppShell, Burger, Container, Group, Skeleton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHome2, IconUsers } from "@tabler/icons-react";
import { Link, Outlet } from "react-router-dom";
import NavLink from "../components/NavLink";

export default function Layout() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Link to="/">Radicalise!</Link>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink label="Dashboard" href="dashboard" leftSection={<IconHome2 size={16} />} onClick={toggle} />
        <NavLink label="People" href="people" leftSection={<IconUsers size={16} />} onClick={toggle} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Container p={0}>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
