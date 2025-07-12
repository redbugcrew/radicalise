import { useEffect, useState } from "react";
import { type Interval, type IntervalInvolvementData } from "../api/Api";
import { useAppSelector } from "../store";
import PeopleByInvolvementStatus from "./PeopleByInvolvementStatus";
import type { InvolvementsState } from "../store/involvements";
import { getApi } from "../api";

interface PeopleForIntervalProps {
  interval: Interval;
}

export default function PeopleForInterval({ interval }: PeopleForIntervalProps) {
  const currentInterval = useAppSelector((state) => state.intervals.currentInterval);
  const involvementState: InvolvementsState = useAppSelector((state) => state.involvements);
  const [cacheKey, setCacheKey] = useState<number>(0);

  const [involvements, setInvolvements] = useState<IntervalInvolvementData | null>(null);

  const incrementCacheKey = () => {
    setCacheKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    if (involvementState.current_interval?.interval_id === interval.id) {
      setInvolvements(involvementState.current_interval || null);
    } else if (involvementState.next_interval?.interval_id === interval.id) {
      setInvolvements(involvementState.next_interval || null);
    } else {
      const api = getApi();

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
    incrementCacheKey();
  }, [interval.id, currentInterval, involvementState]);

  return involvements && <PeopleByInvolvementStatus involvements={involvements.collective_involvements} crewEnrolments={involvements.crew_involvements} tableKey={`${interval.id}-${cacheKey}`} />;
}
