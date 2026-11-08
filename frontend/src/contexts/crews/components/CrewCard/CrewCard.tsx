import { Card, Group, Stack, Title, Text, Badge, ActionIcon } from "@mantine/core"
import type { CrewInvolvement, Person } from "../../../../api/Api"
import PersonBadge from "../../../../components/people/PersonBadge/PersonBadge"
import type { PeopleObjectMap } from "../../../../store/people"
import styles from "./CrewCard.module.css"
import Anchor from "../../../../components/Anchor"
import type { CrewWithLinks } from "../../../../store/crews"
import LinksStack from "../../../../components/links/LinksDisplay/LinksStack"
import { currentProjectPath, useCurrentProjectSlug } from "../../../projects"
import { IconEdit } from "@tabler/icons-react"

interface CrewCardProps {
  crew: CrewWithLinks
  involvements: CrewInvolvement[]
  people: PeopleObjectMap
  highlightPersonId?: number
}

interface PersonAndInvolvement {
  person: Person
  involvement: CrewInvolvement
}

function sortByConvenorThenName(a: PersonAndInvolvement, b: PersonAndInvolvement): number {
  if (a.involvement.convenor && !b.involvement.convenor) {
    return -1
  } else if (!a.involvement.convenor && b.involvement.convenor) {
    return 1
  } else {
    return a.person.display_name.localeCompare(b.person.display_name)
  }
}

export default function CrewCard({ crew, involvements, people, highlightPersonId }: CrewCardProps) {
  const projectSlug = useCurrentProjectSlug()
  const crewPeople: PersonAndInvolvement[] = involvements
    .map((involvement) => ({ involvement, person: people[involvement.person_id] }))
    .filter(({ person }) => person)
    .sort(sortByConvenorThenName)

  const hasPeople = crewPeople.length > 0
  const hasConvenor = crewPeople.some(({ involvement }) => involvement.convenor)
  const active = hasPeople && hasConvenor

  const cardStyles = [styles.card]
  if (!active) cardStyles.push(styles.empty)

  return (
    <Card className={cardStyles.join(" ")}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Stack gap={0}>
            <Title order={2} size="h4">
              {crew.name}
            </Title>
            <Text>{crew.description}</Text>
          </Stack>
          <Stack align="flex-end">
            <Anchor href={currentProjectPath(`/crews/${crew.id}/edit`, projectSlug)}>
              <ActionIcon variant="outline" aria-label={`Edit ${crew.name}`} size="lg">
                <IconEdit style={{ width: "70%", height: "70%" }} stroke={2} />
              </ActionIcon>
            </Anchor>
            {!active && <Badge color="orange">Inactive</Badge>}
            {active && <Badge color="green">Active</Badge>}
          </Stack>
        </Group>
        <Group>
          {crewPeople.map(({ person, involvement }) => {
            const convenor = involvement?.convenor

            return <PersonBadge key={person.id} person={person} me={person.id === highlightPersonId} highlight={convenor} />
          })}
        </Group>
        <LinksStack links={crew.links} />
      </Stack>
    </Card>
  )
}
