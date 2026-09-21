import { describe, it, expect } from "vitest";
import { startedAt } from "../dates";

describe("startedAt", () => {
  it("parses the start of a range", () => {
    expect(startedAt("Sept 2022 - Present")).toBe(Date.UTC(2022, 8));
  });

  it.each([
    ["Jan 2021 - Feb 2021", Date.UTC(2021, 0)],
    ["January 2021 - Feb 2021", Date.UTC(2021, 0)],
    ["Sep 2019 - Sept 2020", Date.UTC(2019, 8)],
    ["September 2019 - Sept 2020", Date.UTC(2019, 8)],
    ["December 2017 - July 2018", Date.UTC(2017, 11)],
  ])("parses %s", (range, expected) => {
    expect(startedAt(range)).toBe(expected);
  });

  it("is case insensitive", () => {
    expect(startedAt("SEPT 2022 - Present")).toBe(
      startedAt("sept 2022 - Present"),
    );
  });

  it("tolerates surrounding whitespace", () => {
    expect(startedAt("  Sept 2022  -  Present  ")).toBe(Date.UTC(2022, 8));
  });

  it("orders ranges correctly when sorted", () => {
    const ranges = [
      "June 2014 - April 2016",
      "Sept 2022 - Present",
      "Dec 2017 - July 2018",
    ];
    const newestFirst = [...ranges].sort((a, b) => startedAt(b) - startedAt(a));
    expect(newestFirst).toEqual([
      "Sept 2022 - Present",
      "Dec 2017 - July 2018",
      "June 2014 - April 2016",
    ]);
  });

  // A NaN comparator silently scrambles the sort, so these must throw.
  it.each([
    "Sebtember 2022 - Present",
    "2022 - Present",
    "Sept - Present",
    "Sept 22 - Present",
    "",
    "Present",
  ])("throws on unparseable input %j", (range) => {
    expect(() => startedAt(range)).toThrow();
  });

  it("names the offending range in the error", () => {
    expect(() => startedAt("Smarch 2022 - Present")).toThrow(
      /Smarch 2022 - Present/,
    );
  });
});
