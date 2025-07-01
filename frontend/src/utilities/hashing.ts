import { InvolvementStatus } from "../api/Api";

export type HashById<T> = Map<number, T[]>;
export type HashByStatus<T> = Map<InvolvementStatus, T[]>;

export function hashByPerson<T extends { person_id: number }>(records: T[] | undefined): HashById<T> {
  return hashByNumber(records, "person_id");
}

export function hashByStatus<T extends { status: InvolvementStatus }>(records: T[]): HashByStatus<T> {
  const map = new Map<InvolvementStatus, T[]>();
  records.forEach((record) => {
    const status = InvolvementStatus[record.status as keyof typeof InvolvementStatus];
    if (!map.has(status)) {
      map.set(status, []);
    }
    map.get(status)?.push(record);
  });
  return map;
}

export function hashByNumber<T>(records: T[] | undefined | null, key: keyof T): HashById<T> {
  const map = new Map<number, T[]>();

  if (!records) return map;

  records.forEach((record) => {
    const keyValue = record[key as keyof T] as unknown as number;

    if (!map.has(keyValue)) {
      map.set(keyValue, []);
    }
    map.get(keyValue)?.push(record);
  });
  return map;
}
