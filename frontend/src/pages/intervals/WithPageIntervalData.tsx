import { type Interval } from "../../api/Api";
import { useAppSelector } from "../../store";
import { useLocation } from "react-router-dom";
import { useCurrentInterval, type CurrentIntervalState } from "../../store/current_interval";
import WithIntervalData from "./WithIntervalData";

interface WithIntervalDataChildProps {
  interval: Interval;
  intervalData: CurrentIntervalState;
  key: string;
  isCurrentInterval: boolean;
}

interface WithPageIntervalDataProps {
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

export default function WithPageIntervalData({ children }: WithPageIntervalDataProps) {
  const selectedInterval = useSelectedInterval();

  return <WithIntervalData interval={selectedInterval}>{children}</WithIntervalData>;
}
