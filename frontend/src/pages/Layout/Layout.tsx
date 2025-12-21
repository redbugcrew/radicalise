import { Anchor, AppShell, Burger, Container, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBrandGithub, IconCalendar, IconHome2, IconSettings, IconUsers, IconUsersGroup } from "@tabler/icons-react";
import { Outlet } from "react-router-dom";
import { NavLink, PersonBadge } from "../../components";
import { handleOwnedAppEvent, useAppSelector } from "../../store";
import packageJson from "../../../package.json";
import useWebSocket from "react-use-websocket";

import classes from "./Layout.module.css";
import { getSocketUrl } from "../../api";

export default function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const collective = useAppSelector((state) => state.collective);
  const person_id = useAppSelector((state) => state.me?.person_id);
  const person = useAppSelector((state) => state.people[person_id || -1]);

  const {} = useWebSocket(getSocketUrl(), {
    share: true,
    onOpen: (event) => {
      console.log("WebSocket connection opened", event);
    },
    onClose: () => {
      console.log("WebSocket connection closed");
    },
    onMessage: (event) => {
      console.log("WebSocket message received", event);
      if (person_id !== undefined) handleOwnedAppEvent(person_id, JSON.parse(event.data));
    },
    heartbeat: false,
  });

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
          <NavLink label={<PersonBadge person={person} variant="transparent" />} href={`/people/${person.id}`} onClick={toggle} />
        </AppShell.Section>
        <AppShell.Section className={classes.menu_section}>
          <NavLink label="Dashboard" href="dashboard" leftSection={<IconHome2 size={18} />} onClick={toggle} />
          <NavLink label="People" href="people" leftSection={<IconUsers size={18} />} onClick={toggle} />
          <NavLink label="Crews" href="crews" leftSection={<IconUsersGroup size={18} />} onClick={toggle} />
          {collective?.feature_eoi && <NavLink label="Entry" href="entry_pathways" leftSection={<IconUsers size={18} />} onClick={toggle} />}
          <NavLink label="Intervals" href="intervals" leftSection={<IconCalendar size={18} />} onClick={toggle} />
        </AppShell.Section>

        <AppShell.Section className={classes.footer_section}>
          <NavLink c="dimmed" label={"v" + packageJson.version} href={packageJson.homepage + "/releases/tag/v" + packageJson.version} leftSection={<IconBrandGithub size={18} />} onClick={toggle} />
          <NavLink c="dimmed" label="Collecive settings" href="/collective/edit" leftSection={<IconSettings size={18} />} onClick={toggle} />
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <Container p={0}>{collective && <Outlet />}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
