// Helpers de dates basés sur l'UTC pour éviter toute dérive de fuseau.
// La « semaine » est ancrée sur le lundi à minuit UTC (référence ISO).

export function toUTCDate(input: Date | string): Date {
  const d = new Date(input);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Lundi (00:00 UTC) de la semaine contenant `input`. */
export function weekStartUTC(input: Date | string): Date {
  const date = toUTCDate(input);
  const day = date.getUTCDay(); // 0 = dimanche … 6 = samedi
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

export function addDaysUTC(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

export function addWeeksUTC(d: Date, n: number): Date {
  return addDaysUTC(d, n * 7);
}

/** Liste de lundis, de `weeksBack` semaines en arrière à `weeksFwd` en avant. */
export function weekSeries(anchor: Date, weeksBack: number, weeksFwd: number): Date[] {
  const start = weekStartUTC(anchor);
  const out: Date[] = [];
  for (let i = -weeksBack; i <= weeksFwd; i++) out.push(addWeeksUTC(start, i));
  return out;
}

export function sameWeek(a: Date | string, b: Date | string): boolean {
  return weekStartUTC(a).getTime() === weekStartUTC(b).getTime();
}

export function weekKey(d: Date | string): string {
  return weekStartUTC(d).toISOString().slice(0, 10);
}

/** Nombre de jours ouvrables (lun–ven) entre deux dates, bornes incluses. */
export function businessDaysBetween(start: Date | string, end: Date | string): number {
  let s = toUTCDate(start);
  const e = toUTCDate(end);
  if (s > e) return 0;
  let count = 0;
  while (s <= e) {
    const day = s.getUTCDay();
    if (day !== 0 && day !== 6) count++;
    s = addDaysUTC(s, 1);
  }
  return count;
}

/** Chevauchement en jours ouvrables entre [aStart,aEnd] et [bStart,bEnd]. */
export function businessDaysOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): number {
  const start = aStart > bStart ? aStart : bStart;
  const end = aEnd < bEnd ? aEnd : bEnd;
  if (start > end) return 0;
  return businessDaysBetween(start, end);
}

const MONTHS_FR = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juill.", "août", "sept.", "oct.", "nov.", "déc.",
];

/** Libellé court d'une semaine, ex. « 16 juin ». */
export function weekLabel(d: Date | string): string {
  const w = weekStartUTC(d);
  return `${w.getUTCDate()} ${MONTHS_FR[w.getUTCMonth()]}`;
}

export function monthLabel(d: Date | string): string {
  const w = toUTCDate(d);
  return `${MONTHS_FR[w.getUTCMonth()]} ${w.getUTCFullYear()}`;
}

/** Trimestre (1–4) d'une date. */
export function quarterOf(d: Date | string): number {
  return Math.floor(toUTCDate(d).getUTCMonth() / 3) + 1;
}

export function quarterLabel(d: Date | string): string {
  const date = toUTCDate(d);
  return `T${quarterOf(date)} ${date.getUTCFullYear()}`;
}
