import { Group, Text } from "@mantine/core";
import type { Person } from "../../../api/Api";
import classes from "./PersonBadge.module.css";
import Avatar from "../Avatar";

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
      <Avatar avatarId={person.avatar_id ?? person.id} />
      <Text fz="sm" fw={500}>
        {person.display_name}
      </Text>
    </Group>
  );
}
