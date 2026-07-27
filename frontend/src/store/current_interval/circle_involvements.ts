import type { CircleInvolvement, CircleInvolvementData } from "../../api/Api";
import type { CircleInvolvementDataMap } from "../involvements";

export function mapCirclesInvolvements(records: CircleInvolvementData[]): CircleInvolvementDataMap {
  return records.reduce<CircleInvolvementDataMap>((acc, circleData) => {
    acc[circleData.circle_id] = circleData;
    return acc;
  }, {});
}

export function circleInvolvementsforPerson(records: CircleInvolvementData[] | null | undefined, personId: number): CircleInvolvement[] {
  const result: CircleInvolvement[] = [];

  if (!records) return result;

  for (const record of records) {
    const involvement = record.circle_involvements.find((inv) => inv.person_id === personId);
    if (involvement) {
      result.push(involvement);
    }
  }

  return result;
}

export function circleInvolvementsforCircleAndPerson(records: CircleInvolvementData[] | null | undefined, circleId: number, personId: number): CircleInvolvement | null {
  if (!records) return null;

  const record = forCircle(records, circleId);
  if (!record) return null;

  const involvement = forPerson(record.circle_involvements, personId);
  return involvement || null;
}

function forCircle(records: CircleInvolvementData[] | null | undefined, circleId: number): CircleInvolvementData | null {
  if (!records) return null;

  const record = records.find((rec) => rec.circle_id === circleId);
  return record || null;
}

function forPerson(records: CircleInvolvement[] | null | undefined, personId: number): CircleInvolvement | null {
  if (!records) return null;

  const record = records.find((rec) => rec.person_id === personId);
  return record || null;
}
