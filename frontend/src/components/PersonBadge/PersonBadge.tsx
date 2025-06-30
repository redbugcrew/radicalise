import { Avatar, Group, Text } from "@mantine/core";
import type { Person } from "../../api/Api";
import classes from "./PersonBadge.module.css";

export const avatarUrl = (id: number) => {
  let number = (id % 10) + 1;
  if (number === 5) number = 2;
  return `https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-${number}.png`;
};

export default function PersonBadge({ person }: { person: Person | null }) {
  if (!person) {
    return null;
  }

  return (
    <Group gap="xs" className={classes.PersonBadge}>
      <Avatar size={30} src={avatarUrl(person.id)} radius={30} />
      <Text fz="sm" fw={500}>
        {person.display_name}
      </Text>
    </Group>
  );
}
