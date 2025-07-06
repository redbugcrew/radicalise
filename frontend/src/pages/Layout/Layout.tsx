import { Anchor, AppShell, Avatar, Burger, Container, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBrandGithub, IconCalendar, IconHome2, IconUsers, IconUsersGroup } from "@tabler/icons-react";
import { Outlet } from "react-router-dom";
import { NavLink, PersonBadge } from "../../components";
import { useAppSelector } from "../../store";
import packageJson from "../../../package.json";

import classes from "./Layout.module.css";

export default function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const collective = useAppSelector((state) => state.collective);
  const person_id = useAppSelector((state) => state.me?.person_id);
  const person = useAppSelector((state) => state.people[person_id || -1]);

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Anchor href="/">{collective ? collective.name : "Radicalise!"}</Anchor>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p={0}>
        <AppShell.Section className={classes.user_section}>
          <PersonBadge person={person} variant="transparent" />
        </AppShell.Section>
        <AppShell.Section className={classes.menu_section}>
          <NavLink label="Dashboard" href="dashboard" leftSection={<IconHome2 size={18} />} onClick={toggle} />
          <NavLink label="People" href="people" leftSection={<IconUsers size={18} />} onClick={toggle} />
          <NavLink label="Crews" href="crews" leftSection={<IconUsersGroup size={18} />} onClick={toggle} />
          <NavLink label="Intervals" href="intervals" leftSection={<IconCalendar size={18} />} onClick={toggle} />
        </AppShell.Section>

        <AppShell.Section className={classes.footer_section}>
          <NavLink c="dimmed" label={"v" + packageJson.version} href={packageJson.homepage + "/releases/tag/v" + packageJson.version} leftSection={<IconBrandGithub size={18} />} onClick={toggle} />
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <Container p={0}>{collective && <Outlet />}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
