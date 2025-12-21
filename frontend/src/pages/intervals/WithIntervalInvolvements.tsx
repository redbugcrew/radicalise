import { useEffect, useState } from "react";
import { type Interval, type IntervalInvolvementData } from "../../api/Api";
import { useAppSelector } from "../../store";
import type { InvolvementsState } from "../../store/involvements";
import { getApi } from "../../api";
import { useLocation } from "react-router-dom";

interface WithIntervalInvolvementsChildProps {
  interval: Interval;
  involvements: IntervalInvolvementData | null;
  key: string;
  isCurrentInterval: boolean;
}

interface WithIntervalInvolvementsProps {
  interval: Interval;
  children: (props: WithIntervalInvolvementsChildProps) => React.ReactNode;
}

const useHashIntervalId = (): number | null => {
  const location = useLocation();
  const hash = location.hash;
  if (hash.startsWith("#interval")) {
    const idStr = hash.replace("#interval", "");
    const id = parseInt(idStr, 10);
    if (!isNaN(id)) {
      return id;
    }
  }
  return null;
};

export const useSelectedInterval = (): Interval | null => {
  const pathIntervalId = useHashIntervalId();
  const currentInterval = useAppSelector((state) => state.intervals.currentInterval);
  const allIntervals = useAppSelector((state) => state.intervals.allIntervals);
  const selectedInterval: Interval | null = pathIntervalId == null ? currentInterval : allIntervals.find((i) => i.id === pathIntervalId) || null;
  return selectedInterval;
};

export default function WithIntervalInvolvements({ children }: WithIntervalInvolvementsProps) {
  const pathIntervalId = useHashIntervalId();
  const currentInterval = useAppSelector((state) => state.intervals.currentInterval);
  const selectedInterval = useSelectedInterval();

  const involvementState: InvolvementsState = useAppSelector((state) => state.involvements);
  const [cacheKey, setCacheKey] = useState<number>(0);

  const [involvements, setInvolvements] = useState<IntervalInvolvementData | null>(null);

  console.log("path interval id:", pathIntervalId);
  console.log("selected interval:", selectedInterval);

  if (!selectedInterval) return null;

  const incrementCacheKey = () => {
    setCacheKey((prevKey) => prevKey + 1);
  };

  const tableKey = `${selectedInterval.id}-${cacheKey}`;

  useEffect(() => {
    if (involvementState.current_interval?.interval_id === selectedInterval.id) {
      console.log("using current interval");
      setInvolvements(involvementState.current_interval || null);
    } else if (involvementState.next_interval?.interval_id === selectedInterval.id) {
      console.log("using next interval");
      setInvolvements(involvementState.next_interval || null);
    } else {
      console.log("fetching interval involvements from API");
      const api = getApi();

      api.api
        .getInvolvements(selectedInterval.id)
        .then((response) => {
          setInvolvements(response.data);
        })
        .catch((error) => {
          console.error("Error fetching involvements:", error);
          setInvolvements(null);
        });
    }
    incrementCacheKey();
  }, [pathIntervalId, currentInterval, involvementState]);

  return children({ interval: selectedInterval, involvements, key: tableKey, isCurrentInterval: selectedInterval.id === currentInterval?.id });
}
