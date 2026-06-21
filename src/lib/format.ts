// Formatage localisé fr-CA (Québec).

const LOCALE = "fr-CA";

const nf0 = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });

export const fmtInt = (n: number | null | undefined) => nf0.format(n ?? 0);

export const fmtNum = (n: number | null | undefined, digits = 1) =>
  new Intl.NumberFormat(LOCALE, { maximumFractionDigits: digits }).format(n ?? 0);

/** Heures avec suffixe « h ». */
export const fmtHours = (n: number | null | undefined) => `${nf1.format(n ?? 0)} h`;

/** Pourcentage. */
export const fmtPct = (n: number | null | undefined, digits = 0) =>
  `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: digits }).format(n ?? 0)} %`;

/** Devise CAD, sans décimales par défaut. */
export const fmtCurrency = (n: number | null | undefined, digits = 0) =>
  new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: digits,
  }).format(n ?? 0);

/** Montant compact (ex.: 1,2 M$, 450 k$). */
export const fmtCurrencyCompact = (n: number | null | undefined) => {
  const v = n ?? 0;
  if (Math.abs(v) >= 1_000_000) return `${nf1.format(v / 1_000_000)} M$`;
  if (Math.abs(v) >= 1_000) return `${nf0.format(v / 1_000)} k$`;
  return fmtCurrency(v);
};

export const fmtDate = (d: Date | string | null | undefined) => {
  if (!d) return "—";
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
};

export const fmtDateShort = (d: Date | string | null | undefined) => {
  if (!d) return "—";
  return new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "short" }).format(
    new Date(d),
  );
};

/** Initiales d'un nom complet, pour les avatars. */
export const initials = (first: string, last: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

/** Signe explicite pour les écarts (+/−). */
export const fmtSigned = (n: number, digits = 0) => {
  const v = n ?? 0;
  const s = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: digits }).format(
    Math.abs(v),
  );
  if (v > 0) return `+${s}`;
  if (v < 0) return `−${s}`;
  return s;
};
