import { IconBattery1, IconBattery2, IconBattery4 } from "@tabler/icons-react";

const capacityScoreIcons: Record<string, React.ReactNode> = {
  "-1": <IconBattery1 />,
  "0": <IconBattery2 />,
  "1": <IconBattery4 />,
};

export default function CapacityScoreIcon({ score }: { score: number | string | null | undefined }) {
  if (score === null || score === undefined) return null;

  return capacityScoreIcons[score.toString()] || null;
}
