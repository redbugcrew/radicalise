import { Center, Group, Table, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconSelector } from "@tabler/icons-react";
import classes from "./SortableTable.module.css";
import { compareAsc } from "date-fns";

interface SortableThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort: () => void;
}

export function SortableTh({ children, reversed, sorted, onSort }: SortableThProps) {
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

export function Th({ children }: ThProps) {
  return (
    <Table.Th className={classes.th}>
      <Text fw={500} fz="sm">
        {children}
      </Text>
    </Table.Th>
  );
}

export type MatchesFunction<T> = (item: T, query: string) => boolean;

export function filterData<T>(data: T[], search: string, matchesFunction: MatchesFunction<T>): T[] {
  const query = search.toLowerCase().trim();
  return data.filter((item) => matchesFunction(item, query));
}

export type TypeOverrides = "string-date";

export function sortData<T>(data: T[], payload: { sortBy: keyof T | null; reversed: boolean; search: string; type_override?: TypeOverrides | null }, matchesFunction: MatchesFunction<T>) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search, matchesFunction);
  }

  return filterData(
    [...data].sort((a, b) => {
      const valA = a[sortBy] as ComparableType;
      const valB = b[sortBy] as ComparableType;

      let result = compareValues(valA, valB, payload.type_override);

      if (payload.reversed) {
        return -result;
      }

      return result;
    }),
    payload.search,
    matchesFunction,
  );
}

type ComparableType = string | number | boolean | null | undefined;

function compareValues(a: ComparableType, b: ComparableType, type_override?: TypeOverrides | null): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;

  if (typeof a === "string" && typeof b === "string") {
    if (type_override === "string-date") {
      return compareAsc(a, b);
    }

    return a.localeCompare(b);
  }

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  if (typeof a === "boolean" && typeof b === "boolean") {
    return a === b ? 0 : a ? 1 : -1;
  }

  return 0;
}
