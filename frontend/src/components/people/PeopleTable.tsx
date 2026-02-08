import { Badge, Group, Table, Text, TextInput, Stack } from "@mantine/core";
import { Anchor } from "..";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import CapacityScoreIcon from "../CapacityScoreIcon";
import Avatar from "./Avatar";
import { SortableTh, sortData, Th } from "../SortableTable/SortableTable";

interface Crew {
  id: number;
  name: string;
}

export interface PeopleTableRow {
  id: number;
  name: string;
  avatar_id: number;
  capacity_score: number | null;
  dimmed?: boolean;
  counter: number;
  crews: Crew[];
}

function matchesFilter(item: PeopleTableRow, query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return item.name.toLowerCase().includes(lowerQuery) || item.crews.some((crew) => crew.name.toLowerCase().includes(lowerQuery));
}

const crewColours: Record<number, string> = {
  2: "blue",
  3: "cyan",
  4: "pink",
  5: "green",
};

interface PersonLinkWithCapacityProps {
  personId: number;
  personName: string;
  avatarId: number;
  capacityScore: number | null;
  dimmed?: boolean;
  intervalId?: number | null;
}

function PersonLinkWithCapacity({ personId, personName, avatarId, capacityScore, dimmed, intervalId }: PersonLinkWithCapacityProps) {
  let link = `/people/${personId}`;
  if (intervalId) {
    link += `#interval${intervalId}`;
  }

  return (
    <Anchor href={link}>
      <Group gap="sm" wrap="nowrap">
        <Avatar avatarId={avatarId} />
        <Text fz="sm" fw={500} c={dimmed ? "dimmed" : "default"}>
          {personName}
        </Text>
        <CapacityScoreIcon score={capacityScore} />
      </Group>
    </Anchor>
  );
}

export interface SortableRowData {
  name: string;
}

interface PeopleTableProps {
  people: PeopleTableRow[];
  intervalId?: number | null;
}

export default function PeopleTable({ people, intervalId }: PeopleTableProps) {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(people);
  const [sortBy, setSortBy] = useState<keyof SortableRowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof SortableRowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(people, { sortBy: field, reversed, search }, matchesFilter));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(sortData(people, { sortBy, reversed: reverseSortDirection, search: value }, matchesFilter));
  };

  const rows = sortedData.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Group justify="space-between">
          <PersonLinkWithCapacity personId={item.id} personName={item.name} avatarId={item.avatar_id} capacityScore={item.capacity_score} dimmed={item.dimmed} intervalId={intervalId} />
          {item.counter > 0 ? (
            <Text c="dimmed" size="sm">
              {item.counter}
            </Text>
          ) : null}
        </Group>
      </Table.Td>

      <Table.Td>
        {item.crews.map((crew) => (
          <Badge key={crew.id} color={crewColours[crew.id] || "gray"} variant="light" mr={5}>
            {crew.name}
          </Badge>
        ))}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack align="stretch">
      <TextInput placeholder="Search by any field" leftSection={<IconSearch size={16} stroke={1.5} />} value={search} onChange={handleSearchChange} />
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <SortableTh sorted={sortBy == "name"} reversed={reverseSortDirection} onSort={() => setSorting("name")}>
              Name
            </SortableTh>
            <Th>Crew(s)</Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Stack>
  );
}
