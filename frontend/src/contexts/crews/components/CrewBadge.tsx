import { Badge, type MantineColor } from "@mantine/core"

const crewColours: MantineColor[] = [
  "blue",
  "cyan",
  "pink",
  "green",
  "red",
  "grape",
  "violet",
  "indigo",
  "teal",
  "lime",
  "yellow",
  "orange",
]

interface Crew {
  id: number
  name: string
}

interface CrewBadgeProps {
  crew: Crew
}

function getCrewColour(id: number): MantineColor {
  const index = id % crewColours.length
  return crewColours[index]
}

export default function CrewBadge({ crew }: CrewBadgeProps) {
  return (
    <Badge key={crew.id} color={getCrewColour(crew.id)} variant="light" mr={5}>
      {crew.name}
    </Badge>
  )
}
