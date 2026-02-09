import { Center, Group, Table, Text, TextInput, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector } from "@tabler/icons-react";
import classes from "./SortableTable.module.css";
import { compareAsc } from "date-fns";

interface SortableThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  right?: boolean;
  abbreviated?: string;
  onSort: () => void;
}

export function SortableTh({ children, reversed, sorted, onSort, right, abbreviated }: SortableThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  const rightProps = right ? { ta: "right" as const } : {};
  const textProps = { fw: 500, fz: "sm" };

  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify={right ? "flex-end" : "space-between"} wrap="nowrap" gap="xs">
          {abbreviated && (
            <>
              <Text {...textProps} {...rightProps} visibleFrom="sm">
                {children}
              </Text>
              <Text {...textProps} {...rightProps} hiddenFrom="sm">
                {abbreviated}
              </Text>
            </>
          )}
          {!abbreviated && (
            <Text {...textProps} {...rightProps}>
              {children}
            </Text>
          )}
          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

interface ThProps {
  right?: boolean;
  abbreviated?: string;
  children: React.ReactNode;
}

export function Th({ children, right, abbreviated }: ThProps) {
  const textProps = { fw: 500, fz: "sm" };
  const rightProps = right ? { ta: "right" as const } : {};

  return (
    <Table.Th className={classes.th} {...rightProps}>
      {!abbreviated && (
        <Text {...textProps} {...rightProps}>
          {children}
        </Text>
      )}
      {abbreviated && (
        <>
          <Text {...textProps} {...rightProps} visibleFrom="sm">
            {children}
          </Text>
          <Text {...textProps} {...rightProps} hiddenFrom="sm">
            {abbreviated}
          </Text>
        </>
      )}
    </Table.Th>
  );
}

export type MatchesFunction<T> = (item: T, query: string) => boolean;

export function filterData<T>(data: T[], search: string, matchesFunction: MatchesFunction<T>): T[] {
  const query = search.toLowerCase().trim();
  return data.filter((item) => matchesFunction(item, query));
}

export type TypeOverrides = "string-date";

interface sortDataPayload<T> {
  sortBy: keyof T | null;
  reversed: boolean;
  search: string;
  type_override?: TypeOverrides | null;
  compare_override?: ((a: any, b: any) => number) | null;
}

export function sortData<T>(data: T[], payload: sortDataPayload<T>, matchesFunction: MatchesFunction<T>) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search, matchesFunction);
  }

  return filterData(
    [...data].sort((a, b) => {
      const valA = a[sortBy] as ComparableType;
      const valB = b[sortBy] as ComparableType;

      const compareFunc = payload.compare_override ?? compareValues;

      let result = compareFunc(valA, valB, payload.type_override);

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
    return b - a;
  }

  if (typeof a === "boolean" && typeof b === "boolean") {
    return a === b ? 0 : a ? 1 : -1;
  }

  return 0;
}

interface SearchFieldProps {
  value: string;
  placeholder?: string;
  onSearchChange: (value: string) => void;
}

export function SearchField({ value, placeholder, onSearchChange }: SearchFieldProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.currentTarget.value);
  };

  return <TextInput placeholder={placeholder ?? "Search by any field"} leftSection={<IconSearch size={16} stroke={1.5} />} value={value} onChange={handleSearchChange} />;
}
