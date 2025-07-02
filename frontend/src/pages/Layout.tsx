import { AppShell, Burger, Container, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendar, IconHome2, IconUsers, IconUsersGroup } from "@tabler/icons-react";
import { Link, Outlet } from "react-router-dom";
import { NavLink } from "../components";
import { useAppSelector } from "../store";
import packageJson from "../../package.json";

export default function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const collective = useAppSelector((state) => state.collective);

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Link to="/">{collective ? collective.name : "Radicalise!"}</Link>
          <Link to={packageJson.homepage + "/releases/tag/v" + packageJson.version}>v{packageJson.version}</Link>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink label="Dashboard" href="dashboard" leftSection={<IconHome2 size={18} />} onClick={toggle} />
        <NavLink label="People" href="people" leftSection={<IconUsers size={18} />} onClick={toggle} />
        <NavLink label="Crews" href="crews" leftSection={<IconUsersGroup size={18} />} onClick={toggle} />
        <NavLink label="Intervals" href="intervals" leftSection={<IconCalendar size={18} />} onClick={toggle} />
      </AppShell.Navbar>
      <AppShell.Main>
        <Container p={0}>{collective && <Outlet />}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
