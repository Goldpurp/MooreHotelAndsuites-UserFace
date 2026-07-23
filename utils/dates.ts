const dateInputPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayInputValue(): string {
  return toDateInputValue(new Date());
}

export function addDaysToInput(value: string, days: number): string {
  const match = dateInputPattern.exec(value);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
    : new Date();
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function differenceInNights(checkIn: string, checkOut: string): number {
  const start = dateInputPattern.exec(checkIn);
  const end = dateInputPattern.exec(checkOut);
  if (!start || !end) return 0;

  const startUtc = Date.UTC(Number(start[1]), Number(start[2]) - 1, Number(start[3]));
  const endUtc = Date.UTC(Number(end[1]), Number(end[2]) - 1, Number(end[3]));
  return Math.max(0, Math.round((endUtc - startUtc) / 86_400_000));
}
