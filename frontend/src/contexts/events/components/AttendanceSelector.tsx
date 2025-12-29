import { SegmentedControl } from "@mantine/core";

export default function AttendanceSelector() {
  return <SegmentedControl data={["Going", "Uncertain", "Not Going"]} color="blue" />;
}
