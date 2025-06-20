import { useEffect, useState } from "react";
import { Api, type Interval } from "../api/Api";
import { useAppSelector } from "../store";
import PeopleByInvolvementStatus from "./PeopleByInvolvementStatus";
import type { InvolvementsState } from "../store/involvements";

interface PeopleForIntervalProps {
  interval: Interval;
}

export default function PeopleForInterval({ interval }: PeopleForIntervalProps) {
  const currentInterval = useAppSelector((state) => state.intervals.currentInterval);
  const currentInvolvements: InvolvementsState = useAppSelector((state) => state.involvements);

  const [involvements, setInvolvements] = useState<InvolvementsState | null>(null);

  useEffect(() => {
    if (currentInterval && currentInterval.id == interval.id) {
      setInvolvements(currentInvolvements);
    } else {
      const api = new Api({
        baseURL: "http://localhost:8000",
      });

      api.api
        .getInvolvements(interval.id)
        .then((response) => {
          setInvolvements(response.data);
        })
        .catch((error) => {
          console.error("Error fetching involvements:", error);
          setInvolvements(null);
        });
    }
  }, [interval.id, currentInterval, currentInvolvements]);

  return involvements && <PeopleByInvolvementStatus key={interval.id} involvements={involvements.collective_involvements} crewEnrolments={involvements.crew_involvements} tableKey={interval.id} />;
}
