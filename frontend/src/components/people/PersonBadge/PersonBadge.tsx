import { Group, Text } from "@mantine/core"
import type { Person } from "../../../api/Api"
import classes from "./PersonBadge.module.css"
import Avatar from "../Avatar"
import Anchor from "../../Anchor"
import { currentProjectPath, useCurrentProjectSlug } from "../../../contexts/projects"

export interface PersonBadgeProps {
  person: Person | null
  me?: boolean
  highlight?: boolean
  variant?: "default" | "transparent"
  textOverride?: string
  noText?: boolean
  link?: boolean
  allowNull?: boolean
}

export default function PersonBadge({
  person,
  me,
  highlight,
  textOverride,
  noText,
  variant = "default",
  link = false,
  allowNull = false,
}: PersonBadgeProps) {
  const projectSlug = useCurrentProjectSlug()

  if (!person && !allowNull) {
    return null
  }

  const badgeClasses = []
  if (variant === "default") badgeClasses.push(classes.default)
  if (me) badgeClasses.push(classes.me)
  if (highlight) badgeClasses.push(classes.highlighted)

  const wrapElement = (children: React.ReactNode) => {
    if (link && person) {
      return <Anchor href={currentProjectPath(`/people/${person.id}`, projectSlug)}>{children}</Anchor>
    } else {
      return children
    }
  }

  const text = textOverride ?? person?.display_name

  return wrapElement(
    <Group gap="xs" className={badgeClasses.join(" ")} wrap="nowrap">
      <Avatar avatarId={person?.avatar_id ?? person?.id} alt={text} />

      {!noText && (
        <Text fz="sm" fw={500} span>
          {text}
        </Text>
      )}
    </Group>,
  )
}
