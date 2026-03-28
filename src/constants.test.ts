import { describe, it, expect } from "vitest";
import { MIN_YEAR, MAX_YEAR, NODE, margin, width, height, yearToIndex, colorScale, chartsInfo } from "./constants.ts";

describe("yearToIndex", () => {
  it("returns 0 for MAX_YEAR (most recent data)", () => {
    expect(yearToIndex(MAX_YEAR)).toBe(0);
  });

  it("returns correct index for MIN_YEAR (oldest data)", () => {
    expect(yearToIndex(MIN_YEAR)).toBe(MAX_YEAR - MIN_YEAR);
  });

  it("returns correct index for intermediate years", () => {
    expect(yearToIndex(2010)).toBe(MAX_YEAR - 2010);
  });

  it("index decreases as year increases", () => {
    expect(yearToIndex(2000)).toBeGreaterThan(yearToIndex(2010));
  });
});

describe("colorScale", () => {
  it("returns a color string for values in domain", () => {
    const color = colorScale(25);
    expect(color).toMatch(/^rgb/);
  });

  it("returns different colors for different obesity values", () => {
    const low = colorScale(10);
    const high = colorScale(40);
    expect(low).not.toBe(high);
  });

  it("has domain [10, 40]", () => {
    expect(colorScale.domain()).toEqual([10, 40]);
  });
});

describe("layout constants", () => {
  it("has correct year range", () => {
    expect(MIN_YEAR).toBe(1995);
    expect(MAX_YEAR).toBe(2016);
    expect(MAX_YEAR).toBeGreaterThan(MIN_YEAR);
  });

  it("has positive dimensions", () => {
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  it("dimensions account for margins", () => {
    expect(width).toBe(990 - margin.right - margin.left);
    expect(height).toBe(750 - margin.top - margin.bottom);
  });

  it("node radius range is valid", () => {
    expect(NODE.MIN_RADIUS).toBeLessThan(NODE.MAX_RADIUS);
    expect(NODE.PADDING).toBeGreaterThan(0);
  });
});

describe("chartsInfo", () => {
  it("has entries for all correlation axes", () => {
    expect(chartsInfo).toHaveProperty("income");
    expect(chartsInfo).toHaveProperty("smokes");
    expect(chartsInfo).toHaveProperty("poverty");
    expect(chartsInfo).toHaveProperty("healthcare");
    expect(chartsInfo).toHaveProperty("age");
  });

  it("all values are non-empty strings", () => {
    Object.values(chartsInfo).forEach((text) => {
      expect(typeof text).toBe("string");
      expect(text.length).toBeGreaterThan(0);
    });
  });
});
