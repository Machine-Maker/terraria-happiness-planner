export function formatAsPercent(num: number, includeSign: boolean = false): string {
  return num.toLocaleString(undefined, { style: "percent", signDisplay: includeSign ? "exceptZero" : "auto" });
}

export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}
