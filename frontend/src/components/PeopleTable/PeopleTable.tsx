import { Avatar, Badge, Center, Group, Table, Text, TextInput, UnstyledButton, Stack } from "@mantine/core";
import { Anchor } from "../";
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector } from "@tabler/icons-react";
import { useState } from "react";
import classes from "./PeopleTable.module.css";
import { avatarUrl } from "../PersonBadge/PersonBadge";
import CapacityScoreIcon from "../CapacityScoreIcon";

interface Crew {
  id: number;
  name: string;
}

interface SortableRowData {
  name: string;
}

export interface PeopleTableRow {
  id: number;
  name: string;
  capacity_score: number | null;
  crews: Crew[];
}

function matchesFilter(item: PeopleTableRow, query: string) {
  const lowerQuery = query.toLowerCase();
  return item.name.toLowerCase().includes(lowerQuery) || item.crews.some((crew) => crew.name.toLowerCase().includes(lowerQuery));
}

function filterData(data: PeopleTableRow[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) => matchesFilter(item, query));
}

function sortData(data: PeopleTableRow[], payload: { sortBy: keyof SortableRowData | null; reversed: boolean; search: string }) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return b[sortBy].localeCompare(a[sortBy]);
      }

      return a[sortBy].localeCompare(b[sortBy]);
    }),
    payload.search
  );
}

const crewColours: Record<number, string> = {
  2: "blue",
  3: "cyan",
  4: "pink",
  5: "green",
};

interface SortableThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort: () => void;
}

function SortableTh({ children, reversed, sorted, onSort }: SortableThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

interface ThProps {
  children: React.ReactNode;
}

function Th({ children }: ThProps) {
  return (
    <Table.Th className={classes.th}>
      <Text fw={500} fz="sm">
        {children}
      </Text>
    </Table.Th>
  );
}

interface PeopleTableProps {
  people: PeopleTableRow[];
}

export default function PeopleTable({ people }: PeopleTableProps) {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(people);
  const [sortBy, setSortBy] = useState<keyof SortableRowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof SortableRowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(people, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(sortData(people, { sortBy, reversed: reverseSortDirection, search: value }));
  };

  const rows = sortedData.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Anchor href={`/people/${item.id}`}>
          <Group gap="sm" wrap="nowrap">
            <Avatar size={30} src={avatarUrl(item.id)} radius={30} />
            <Text fz="sm" fw={500}>
              {item.name}
            </Text>

            <CapacityScoreIcon score={item.capacity_score} />
          </Group>
        </Anchor>
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
