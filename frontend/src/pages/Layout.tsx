import { AppShell, Burger, Container, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHome2, IconUsers } from "@tabler/icons-react";
import { Link, Outlet } from "react-router-dom";
import { NavLink } from "../components";
import { useAppSelector } from "../store";

export default function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const collective = useAppSelector((state) => state.collective);

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Link to="/">{collective ? collective.name : "Radicalise!"}</Link>
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
