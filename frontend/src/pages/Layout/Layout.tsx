import { Anchor, AppShell, Burger, Container, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBrandGithub, IconHome2, IconSettings, IconUsers, IconUsersGroup, IconCalendarMonth, IconCalendar, IconCalendarCog, IconCirclesFilled } from "@tabler/icons-react";
import { Outlet } from "react-router-dom";
import { CircleSelector, NavLink, PersonBadge } from "../../components";
import { handleOwnedAppEvent, useAppSelector } from "../../store";
import packageJson from "../../../package.json";
import useWebSocket from "react-use-websocket";

import classes from "./Layout.module.css";
import { getSocketUrl } from "../../api";

export default function Layout() {
  const [opened, { toggle }] = useDisclosure();
  const [selectingCircle, { toggle: toggleCircleSelector }] = useDisclosure();
  const project = useAppSelector((state) => state.project);
  const person_id = useAppSelector((state) => state.me?.person_id);
  const person = useAppSelector((state) => state.people[person_id || -1]);
  const rootCircles = useAppSelector((state) => state.circles || []);

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
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Anchor href="/">{project ? project.name : "Radicalise!"}</Anchor>
          </Group>
          <Anchor href={`/people/${person.id}`} onClick={toggle}>
            <PersonBadge person={person} variant="transparent" noText />
          </Anchor>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p={0}>
        {rootCircles.length > 1 && (
          <AppShell.Section className={classes.circle_section}>
            <NavLink label="Participants" href="#" ta="center" onClick={toggleCircleSelector} visibleFrom={selectingCircle ? "sm" : undefined} />
            {selectingCircle && (
              <div className={classes.circle_selector_container}>
                <CircleSelector circles={rootCircles} selectedCircleId={rootCircles[0].id} onChange={(circleId) => toggleCircleSelector()} />
              </div>
            )}
          </AppShell.Section>
        )}
        <AppShell.Section className={classes.menu_section}>
          <NavLink label="Dashboard" href="dashboard" leftSection={<IconHome2 size={18} />} onClick={toggle} />
          <NavLink label="People" href="people" leftSection={<IconUsers size={18} />} onClick={toggle} />
          <NavLink label="Crews" href="crews" leftSection={<IconUsersGroup size={18} />} onClick={toggle} />
          <NavLink label="Events" href="events" leftSection={<IconCalendar size={18} />} onClick={toggle} />
          {project?.feature_eoi && <NavLink label="Entry" href="entry_pathways" leftSection={<IconUsers size={18} />} onClick={toggle} />}
        </AppShell.Section>
        <AppShell.Section className={classes.settings_section}>
          <h3 className={classes.section_title}>Settings</h3>
          <NavLink label="Intervals" href="intervals" leftSection={<IconCalendarMonth size={18} />} onClick={toggle} />
          <NavLink label="Event Templates" href="events/event_templates" leftSection={<IconCalendarCog size={18} />} onClick={toggle} />
        </AppShell.Section>

        <AppShell.Section className={classes.footer_section}>
          <NavLink c="dimmed" label={"v" + packageJson.version} href={packageJson.homepage + "/releases/tag/v" + packageJson.version} leftSection={<IconBrandGithub size={18} />} onClick={toggle} />
          <NavLink c="dimmed" label="Project settings" href="/project_settings/edit" leftSection={<IconSettings size={18} />} onClick={toggle} />
          <NavLink c="dimmed" label="Circles" href="/project_settings/circles" leftSection={<IconCirclesFilled size={18} />} onClick={toggle} />
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <Container p={0}>{project && <Outlet />}</Container>
      </AppShell.Main>
    </AppShell>
  );
}
