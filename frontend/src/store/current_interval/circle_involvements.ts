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

export function circleInvolvementforCircleAndPerson(records: CircleInvolvementData[] | null | undefined, circleId: number, personId: number): CircleInvolvement | null {
  if (!records) return null;

  const record = forCircle(records, circleId);
  if (!record) return null;

  const involvement = forPerson(record.circle_involvements, personId);
  return involvement || null;
}

export function forCircle(records: CircleInvolvementData[] | null | undefined, circleId: number): CircleInvolvementData | null {
  if (!records) return null;

  const record = records.find((rec) => rec.circle_id === circleId);
  return record || null;
}

function forPerson(records: CircleInvolvement[] | null | undefined, personId: number): CircleInvolvement | null {
  if (!records) return null;

  const record = records.find((rec) => rec.person_id === personId);
  return record || null;
}

export function upsertCircleInvolvement(state: CircleInvolvementData, newInvolvement: CircleInvolvement): CircleInvolvementData {
  const existingCircleInvolvements = state.circle_involvements || [];
  const newCircleInvolvements = existingCircleInvolvements.filter((involvement) => involvement.id !== newInvolvement.id).concat(newInvolvement);

  return {
    ...state,
    circle_involvements: newCircleInvolvements,
  };
}

export function updatePersonCircleInvolvements(state: CircleInvolvementData[], newInvolvements: CircleInvolvementData[], personId: number): CircleInvolvementData[] {
  const updatedCircleInvolvements = state.map((circleData) => {
    const existingCircleInvolvements = circleData.circle_involvements.filter((involvement) => involvement.person_id !== personId);
    const newInvolvementForCircle = circleInvolvementforCircleAndPerson(newInvolvements, circleData.circle_id, personId);
    const combinedInvolvements = existingCircleInvolvements.concat(newInvolvementForCircle ? [newInvolvementForCircle] : []);

    return {
      ...circleData,
      circle_involvements: combinedInvolvements,
    };
  });

  return updatedCircleInvolvements;
}

export function upsertCircleData(state: CircleInvolvementData[], newCircleData: CircleInvolvementData): CircleInvolvementData[] {
  const existingCircleData = state.filter((data) => data.circle_id !== newCircleData.circle_id);
  return existingCircleData.concat(newCircleData);
}
