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
