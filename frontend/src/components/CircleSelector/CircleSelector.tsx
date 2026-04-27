import { Group } from "@mantine/core";
import type { Circle } from "../../api/Api";

interface CircleSelectorProps {
  circles: Circle[];
  selectedCircleId?: number;
  onChange: (circleId: number) => void;
}

import classes from "./CircleSelector.module.css";

export default function CircleSelector({ circles, selectedCircleId, onChange }: CircleSelectorProps) {
  return (
    <Group justify="flex-start" align="stretch" className={classes.button_group} gap={0}>
      {circles.map((circle, index) => {
        const isSelected = circle.id === selectedCircleId;
        return (
          <a
            key={circle.id}
            className={classes.circle_button}
            aria-selected={isSelected}
            style={{ zIndex: circles.length - index }}
            href="#"
            onClick={() => {
              onChange(circle.id);
              return false;
            }}
          >
            <span className={classes.button_text}>{circle.name}</span>
          </a>
        );
      })}
    </Group>
  );
}
