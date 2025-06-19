import { useEffect, useState } from "react";
import { Api, type Interval, type Involvement } from "../api/Api";
import { useAppSelector } from "../store";
import PeopleByInvolvementStatus from "./PeopleByInvolvementStatus";

interface PeopleForIntervalProps {
  interval: Interval;
}

export default function PeopleForInterval({ interval }: PeopleForIntervalProps) {
  const currentInterval = useAppSelector((state) => state.intervals.currentInterval);
  const currentCollectiveInvolvements = useAppSelector((state) => state.involvements.collective_involvements);

  const [involvements, setInvolvements] = useState<Involvement[]>([]);

  useEffect(() => {
    if (currentInterval && currentInterval.id == interval.id) {
      setInvolvements(currentCollectiveInvolvements);
    } else {
      const api = new Api({
        baseURL: "http://localhost:8000",
      });

      api.collective
        .getInvolvements(interval.id)
        .then((response) => {
          // Assuming the API returns an array of involvements
          setInvolvements(response.data);
        })
        .catch((error) => {
          console.error("Error fetching involvements:", error);
          setInvolvements([]);
        });
    }
  }, [interval]);

  return <PeopleByInvolvementStatus key={interval.id} involvements={involvements} />;
}
