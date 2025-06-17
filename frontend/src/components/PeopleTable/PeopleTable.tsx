import { Avatar, Badge, Center, Group, Table, Text, TextInput, UnstyledButton, Stack, keys } from "@mantine/core";
import { Anchor } from "../";
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector } from "@tabler/icons-react";
import { useState } from "react";
import classes from "./PeopleTable.module.css";

interface Group {
  id: number;
  name: string;
}

interface SortableRowData {
  name: string;
}

interface RowData {
  key: string;
  avatar: string;
  name: string;
  groups: Group[];
}

const data = [
  {
    key: "1",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png",
    name: "Robert Wolfkisser",
    groups: [],
  },
  {
    key: "2",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-7.png",
    name: "Jill Jailbreaker",
    groups: [{ id: 5, name: "Retreat Crew" }],
  },
  {
    key: "3",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png",
    name: "Henry Silkeater",
    groups: [],
  },
  {
    key: "4",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png",
    name: "Bill Horsefighter",
    groups: [
      { id: 2, name: "PAS Crew" },
      { id: 3, name: "Solidarity Crew" },
    ],
  },
  {
    key: "5",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png",
    name: "Jeremy Footviewer",
    groups: [
      { id: 5, name: "Retreat Crew" },
      { id: 4, name: "Seedling Crew" },
      { id: 3, name: "Solidarity Crew" },
    ],
  },
];

function matchesFilter(item: RowData, query: string) {
  const lowerQuery = query.toLowerCase();
  return item.name.toLowerCase().includes(lowerQuery) || item.groups.some((group) => group.name.toLowerCase().includes(lowerQuery));
}

function filterData(data: RowData[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) => matchesFilter(item, query));
}

function sortData(data: RowData[], payload: { sortBy: keyof SortableRowData | null; reversed: boolean; search: string }) {
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

const groupColours: Record<number, string> = {
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

export default function PeopleTable() {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState<keyof SortableRowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof SortableRowData) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
  };

  const rows = sortedData.map((item) => (
    <Table.Tr key={item.name}>
      <Table.Td>
        <Anchor href="/people/1">
          <Group gap="sm" wrap="nowrap">
            <Avatar size={30} src={item.avatar} radius={30} />
            <Text fz="sm" fw={500}>
              {item.name}
            </Text>
          </Group>
        </Anchor>
      </Table.Td>

      <Table.Td>
        {item.groups.map((group) => (
          <Badge key={group.id} color={groupColours[group.id] || "gray"} variant="light" mr={5}>
            {group.name}
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
            <Th>Groups(s)</Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Stack>
  );
}
