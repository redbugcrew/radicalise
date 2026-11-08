import { Badge } from "@mantine/core"
import { Anchor } from "../../../components"
import type { CrewStatus } from "../../../api/Api"

interface CrewStatusBadgeProps {
  status?: CrewStatus
  active?: boolean
  href?: string
}

type CombinedStatus = "Available" | "Active" | "Inactive" | "Archived" | "Unknown"

function combinedStatus(status?: CrewStatus, active?: boolean): CombinedStatus {
  switch (status) {
    case "Available":
      return active === true ? "Active" : "Available"
    case "Archived":
      return "Archived"
    default:
      return "Unknown"
  }
}

const colours: Record<CombinedStatus, string> = {
  Available: "blue",
  Active: "green",
  Inactive: "orange",
  Archived: "gray",
  Unknown: "gray",
}

function statusColour(status: CombinedStatus) {
  return colours[status]
}

export default function CrewStatusBadge({ status, active, href }: CrewStatusBadgeProps) {
  const combined = combinedStatus(status, active)
  const colour = statusColour(combined)

  const badge = <Badge color={colour}>{combined}</Badge>
  if (href) {
    return <Anchor href={href}>{badge}</Anchor>
  }
  return badge
}
