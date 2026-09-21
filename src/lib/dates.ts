/**
 * Date parsing for the `dates` field on experience entries, e.g. "Sept 2022 - Present".
 *
 * `new Date("Sept 2022")` happens to work in V8, but it is not specified
 * behaviour -- and a typo would produce `Invalid Date`, whose `getTime()` is
 * `NaN`. A `NaN` comparator silently scrambles the sort order rather than
 * failing, so we parse explicitly and throw instead.
 */

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

/** The month names accepted in a `dates` field, for docs and error messages. */
export const ACCEPTED_MONTHS = Object.keys(MONTHS);

/**
 * Parses the start of a range like "Sept 2022 - Present" into a timestamp.
 *
 * @throws if the month or year cannot be understood, so a malformed entry fails
 * the build rather than quietly reordering the resume.
 */
export function startedAt(range: string): number {
  const start = range.split("-")[0]?.trim() ?? "";
  const match = /^([A-Za-z]+)\s+(\d{4})$/.exec(start);

  if (!match) {
    throw new Error(
      `Could not parse the start of date range "${range}". Expected "<Month> <YYYY>", as in "Sept 2022 - Present".`,
    );
  }

  const [, monthName, year] = match;
  const month = MONTHS[monthName.toLowerCase()];

  if (month === undefined) {
    throw new Error(`Unknown month "${monthName}" in date range "${range}".`);
  }

  return Date.UTC(Number(year), month);
}
