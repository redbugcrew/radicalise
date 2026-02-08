import { Stack, Group, Title, ActionIcon, Tabs } from "@mantine/core";
import { IconLayoutList, IconPlus, IconTable } from "@tabler/icons-react";
import { Anchor } from "../../../../components";
import { Outlet, useNavigate, useParams } from "react-router-dom";

export default function Events() {
  const tabIconSize = 18;

  const navigate = useNavigate();
  const { tabValue } = useParams();

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
      <Tabs value={tabValue} onChange={(value) => navigate(tabPath(value))}>
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

const tabPath = (tabValue: string | null) => {
  if (!tabValue) tabValue = "upcoming";

  switch (tabValue) {
    case "all":
      return "/events/all";
    default:
      return "/events";
  }
};
