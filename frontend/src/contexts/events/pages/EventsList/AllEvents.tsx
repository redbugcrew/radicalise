import { useAppSelector } from "../../../../store";
import EventsTable from "../../components/EventsTable";

export default function AllEvents() {
  const events = useAppSelector((state) => state.events);

  return <EventsTable events={events} />;
}
