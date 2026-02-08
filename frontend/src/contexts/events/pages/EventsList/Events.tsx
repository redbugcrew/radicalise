import { Stack, Group, Title, ActionIcon, Tabs } from "@mantine/core";
import { IconLayoutList, IconPlus, IconTable } from "@tabler/icons-react";
import { Anchor } from "../../../../components";
import { Outlet, useNavigate, useParams } from "react-router-dom";

type TabId = "upcoming" | "all";

export default function Events() {
  const tabIconSize = 18;

  const navigate = useNavigate();
  const { tabValue } = useParams();
  const tab: TabId = (tabValue as TabId) || "upcoming";

  console.log("tab is: ", tab);

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={1}>Events</Title>
        <Anchor href="new">
          <ActionIcon variant="filled" aria-label="Add Event Template" size="lg">
            <IconPlus style={{ width: "70%", height: "70%" }} stroke={2} />
          </ActionIcon>
        </Anchor>
      </Group>
      <Tabs value={tab} onChange={(value) => navigate(tabPath(tabValueFromString(value)))}>
        <Tabs.List>
          <Tabs.Tab value="upcoming" leftSection={<IconLayoutList size={tabIconSize} />}>
            Upcoming
          </Tabs.Tab>
          <Tabs.Tab value="all" leftSection={<IconTable size={tabIconSize} />}>
            All
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Outlet />
    </Stack>
  );
}

function tabValueFromString(value: string | undefined | null): TabId {
  switch (value) {
    case "all":
      return "all";
    case "upcoming":
      return "upcoming";
    default:
      console.warn(`Unknown tab value: ${value}, defaulting to upcoming`);
      return "upcoming";
  }
}

const tabPath = (tabValue: TabId) => {
  switch (tabValue) {
    case "all":
      return "/events/list/all";
    default:
      return "/events";
  }
};
