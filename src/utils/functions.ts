export function classNames(classes: { [key: string]: boolean }): string {
  return Object.keys(classes)
    .filter(name => classes[name])
    .join(" ");
}
