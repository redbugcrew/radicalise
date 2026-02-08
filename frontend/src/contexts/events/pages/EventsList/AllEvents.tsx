import { useAppSelector } from "../../../../store";
import EventsList from "../../components/EventsList";

export default function AllEvents() {
  const events = useAppSelector((state) => state.events);

  return <EventsList events={events} />;
}
