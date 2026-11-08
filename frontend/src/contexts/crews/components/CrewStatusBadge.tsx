import { Badge } from "@mantine/core"
import { Anchor } from "../../../components"

interface CrewStatusBadgeProps {
  active: boolean
  href?: string
}

export default function CrewStatusBadge({ active, href }: CrewStatusBadgeProps) {
  const badge = <Badge color={active ? "green" : "orange"}>{active ? "Active" : "Inactive"}</Badge>
  if (href) {
    return <Anchor href={href}>{badge}</Anchor>
  }
  return badge
}
