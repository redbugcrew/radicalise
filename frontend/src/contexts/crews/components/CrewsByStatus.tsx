import { type CrewInvolvement, CrewStatus } from "../../../api/Api"
import type { PeopleObjectMap } from "../../../store/people"
import { filterCrewsByStatus, type CrewWithStatus } from "../../../store/crews"
import CrewsList from "./CrewsList"
import { Tabs } from "@mantine/core"
import { useState } from "react"

interface CrewsByStatusProps {
  crews: CrewWithStatus[]
  involvements: CrewInvolvement[]
  people: PeopleObjectMap
  highlightPersonId?: number
}

export default function CrewsByStatus({ crews, involvements, people, highlightPersonId }: CrewsByStatusProps) {
  const states: CrewStatus[] = ["Available" as CrewStatus, "Archived" as CrewStatus]
  const [activeState, setActiveState] = useState<CrewStatus>("Available" as CrewStatus)

  const setActiveTab = (state: string | null) => {
    if (state) {
      setActiveState(state as CrewStatus)
    } else {
      setActiveState("Available" as CrewStatus)
    }
  }

  const crewsByStatus = states.reduce(
    (acc, state) => {
      acc[state] = filterCrewsByStatus(crews, state)
      return acc
    },
    {} as Record<CrewStatus, CrewWithStatus[]>,
  )

  return (
    <Tabs value={activeState} onChange={setActiveTab}>
      <Tabs.List>
        {states.map(
          (state) =>
            crewsByStatus[state].length > 0 && (
              <Tabs.Tab key={state} value={state.toString()}>
                {state}
              </Tabs.Tab>
            ),
        )}
      </Tabs.List>

      {states.map((state) => (
        <Tabs.Panel value={state} key={state} pt="md">
          <CrewsList crews={crewsByStatus[state]} involvements={involvements} people={people} highlightPersonId={highlightPersonId} />
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}
