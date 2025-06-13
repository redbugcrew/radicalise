import { Avatar, Badge, Center, Group, Table, Text, TextInput, UnstyledButton, Stack, keys } from "@mantine/core";
import { Anchor } from "../";
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector } from "@tabler/icons-react";
import { useState } from "react";
import classes from "./PeopleTable.module.css";

interface RowData {
  key: string;
  avatar: string;
  name: string;
  role: string;
}

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort: () => void;
}

const data = [
  {
    key: "1",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png",
    name: "Robert Wolfkisser",
    role: "Engineer",
  },
  {
    key: "2",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-7.png",
    name: "Jill Jailbreaker",
    role: "Engineer",
  },
  {
    key: "3",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png",
    name: "Henry Silkeater",
    role: "Designer",
  },
  {
    key: "4",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png",
    name: "Bill Horsefighter",
    role: "Designer",
  },
  {
    key: "5",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png",
    name: "Jeremy Footviewer",
    role: "Manager",
  },
];

function filterData(data: RowData[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) => keys(data[0]).some((key) => item[key].toLowerCase().includes(query)));
}

function sortData(data: RowData[], payload: { sortBy: keyof RowData | null; reversed: boolean; search: string }) {
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

const jobColors: Record<string, string> = {
  engineer: "blue",
  manager: "cyan",
  designer: "pink",
};

function Th({ children, reversed, sorted, onSort }: ThProps) {
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

export default function PeopleTable() {
  const [search, setSearch] = useState("");
  const [sortedData, setSortedData] = useState(data);
  const [sortBy, setSortBy] = useState<keyof RowData | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof RowData) => {
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
        <Badge color={jobColors[item.role.toLowerCase()]} variant="light">
          {item.role}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack align="stretch">
      <TextInput placeholder="Search by any field" leftSection={<IconSearch size={16} stroke={1.5} />} value={search} onChange={handleSearchChange} />
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Th sorted={sortBy == "name"} reversed={reverseSortDirection} onSort={() => setSorting("name")}>
              Name
            </Th>
            <Th sorted={sortBy == "role"} reversed={reverseSortDirection} onSort={() => setSorting("role")}>
              Role(s)
            </Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Stack>
  );
}
