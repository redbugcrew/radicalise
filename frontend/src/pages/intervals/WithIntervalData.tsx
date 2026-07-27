import { useEffect, useState } from "react";
import { type Interval, type IntervalData } from "../../api/Api";
import { useAppSelector } from "../../store";
import { getApi } from "../../api";
import { useLocation } from "react-router-dom";
import { useCurrentInterval, type CurrentIntervalState } from "../../store/current_interval";

interface WithIntervalDataChildProps {
  interval: Interval;
  intervalData: CurrentIntervalState;
  key: string;
  isCurrentInterval: boolean;
}

interface WithIntervalDataProps {
  interval: Interval | null | undefined;
  children: (props: WithIntervalDataChildProps) => React.ReactNode;
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
  const currentInterval = useCurrentInterval();
  const allIntervals = useAppSelector((state) => state.intervals);
  const selectedInterval: Interval | null = pathIntervalId == null ? currentInterval : allIntervals.find((i) => i.id === pathIntervalId) || null;
  return selectedInterval;
};

export async function fetchIntervalData(intervalId: number): Promise<IntervalData | null> {
  return getApi()
    .api.getIntervalData(intervalId)
    .then((data) => {
      return data.data;
    })
    .catch((error) => {
      console.error("Error fetching interval data:", error);
      return null;
    });
}

export default function WithIntervalData({ interval, children }: WithIntervalDataProps) {
  const currentIntervalData = useAppSelector((state) => state.currentInterval);

  const [cacheKey, setCacheKey] = useState<number>(0);

  const [intervalData, setIntervalData] = useState<CurrentIntervalState | null>(null);

  if (!interval) return null;

  const incrementCacheKey = () => {
    setCacheKey((prevKey) => prevKey + 1);
  };

  const tableKey = `${interval.id}-${cacheKey}`;

  useEffect(() => {
    if (!interval) {
      setIntervalData(null);
    } else if (currentIntervalData?.interval.id === interval.id) {
      setIntervalData(currentIntervalData);
    } else {
      console.log("fetching interval involvements from API");
      const api = getApi();

      api.api
        .getIntervalData(interval.id)
        .then((response) => {
          setIntervalData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching involvements:", error);
          setIntervalData(null);
        });
    }

    incrementCacheKey();
  }, [interval.id, currentIntervalData]);

  return children({ interval: interval, intervalData, key: tableKey, isCurrentInterval: interval.id === currentIntervalData?.interval.id });
}
