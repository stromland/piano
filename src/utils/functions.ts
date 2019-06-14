export function classNames(classes: { [key: string]: boolean }): string {
  return Object.keys(classes)
    .filter(name => classes[name])
    .join(" ");
}

export function all<T>(
  list: Array<T>,
  predicate: (val: T) => boolean
): boolean {
  return list.reduce(
    (acc: boolean, current) => acc && predicate(current),
    true
  );
}
