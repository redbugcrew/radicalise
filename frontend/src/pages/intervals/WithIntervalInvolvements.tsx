import { useEffect, useState } from "react";
import { type Interval, type IntervalInvolvementData } from "../../api/Api";
import { useAppSelector } from "../../store";
import type { InvolvementsState } from "../../store/involvements";
import { getApi } from "../../api";

interface WithIntervalInvolvementsChildProps {
  interval: Interval;
  involvements: IntervalInvolvementData | null;
  key: string;
}

interface WithIntervalInvolvementsProps {
  interval: Interval;
  children: (props: WithIntervalInvolvementsChildProps) => React.ReactNode;
}

export default function WithIntervalInvolvements({ interval, children }: WithIntervalInvolvementsProps) {
  const currentInterval = useAppSelector((state) => state.intervals.currentInterval);
  const involvementState: InvolvementsState = useAppSelector((state) => state.involvements);
  const [cacheKey, setCacheKey] = useState<number>(0);

  const [involvements, setInvolvements] = useState<IntervalInvolvementData | null>(null);

  const incrementCacheKey = () => {
    setCacheKey((prevKey) => prevKey + 1);
  };

  const tableKey = `${interval.id}-${cacheKey}`;

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

  return children({ interval, involvements, key: tableKey });
}
