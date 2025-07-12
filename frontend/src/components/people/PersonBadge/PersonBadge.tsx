import { Avatar, Group, Text } from "@mantine/core";
import type { Person } from "../../../api/Api";
import classes from "./PersonBadge.module.css";

export const avatarUrl = (id: number) => {
  let number = (id % 10) + 1;
  if (number === 5) number = 2;
  return `https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-${number}.png`;
};

interface PersonBadgeProps {
  person: Person | null;
  me?: boolean;
  highlight?: boolean;
  variant?: "default" | "transparent";
}

export default function PersonBadge({ person, me, highlight, variant = "default" }: PersonBadgeProps) {
  if (!person) {
    return null;
  }

  const groupClasses = [];
  if (variant === "default") groupClasses.push(classes.default);
  if (me) groupClasses.push(classes.me);
  if (highlight) groupClasses.push(classes.highlighted);

  return (
    <Group gap="xs" className={groupClasses.join(" ")}>
      <Avatar size={30} src={avatarUrl(person.id)} radius={30} />
      <Text fz="sm" fw={500}>
        {person.display_name}
      </Text>
    </Group>
  );
}
