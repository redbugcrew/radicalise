export function compareStrings<T>(prop: keyof T): (a: T, b: T) => number {
  return (a, b) => {
    if (!a[prop] || !b[prop]) return 0; // Handle cases where property might not exist
    return (a[prop] as string).localeCompare(b[prop] as string);
  };
}
