import { Group, Text } from "@mantine/core";
import type { Person } from "../../../api/Api";
import classes from "./PersonBadge.module.css";
import Avatar from "../Avatar";
import Anchor from "../../Anchor";

export interface PersonBadgeProps {
  person: Person | null;
  me?: boolean;
  highlight?: boolean;
  variant?: "default" | "transparent";
  textOverride?: string;
  noText?: boolean;
  link?: boolean;
}

export default function PersonBadge({ person, me, highlight, textOverride, noText, variant = "default", link = false }: PersonBadgeProps) {
  if (!person) {
    return null;
  }

  const badgeClasses = [];
  if (variant === "default") badgeClasses.push(classes.default);
  if (me) badgeClasses.push(classes.me);
  if (highlight) badgeClasses.push(classes.highlighted);

  const wrapElement = (children: React.ReactNode) => {
    if (link) {
      return <Anchor href={`/people/${person.id}`}>{children}</Anchor>;
    } else {
      return children;
    }
  };

  return wrapElement(
    <Group gap="xs" className={badgeClasses.join(" ")} wrap="nowrap">
      <Avatar avatarId={person.avatar_id ?? person.id} />
      {!noText && (
        <Text fz="sm" fw={500} span>
          {textOverride ?? person.display_name}
        </Text>
      )}
    </Group>,
  );
}
