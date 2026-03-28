import { describe, it, expect } from "vitest";
import type { ScatterData, StateData, CombinedData, ObesityRecord } from "./types.ts";

describe("type contracts", () => {
  it("ScatterData has all required correlation fields", () => {
    const scatter: ScatterData = {
      state: "Alabama",
      abbr: "AL",
      poverty: "19.3",
      age: "38.6",
      income: "42830",
      healthcare: "13.9",
      obesity: "35.7",
      smokes: "22.1",
    };
    expect(scatter.state).toBe("Alabama");
    expect(scatter.poverty).toBe("19.3");
  });

  it("StateData links scatter data with obesity time series", () => {
    const state: StateData = {
      abbreviation: "AL",
      obese: [20.1, 22.3, 25.0, 28.4, 30.2],
      scatter: {
        state: "Alabama",
        abbr: "AL",
        poverty: "19.3",
        age: "38.6",
        income: "42830",
        healthcare: "13.9",
        obesity: "35.7",
        smokes: "22.1",
      },
    };
    expect(state.abbreviation).toBe("AL");
    expect(state.obese).toHaveLength(5);
    expect(state.scatter.state).toBe("Alabama");
  });

  it("CombinedData is keyed by state name", () => {
    const data: CombinedData = {
      Alabama: {
        abbreviation: "AL",
        obese: [20.1],
        scatter: {
          state: "Alabama",
          abbr: "AL",
          poverty: "19.3",
          age: "38.6",
          income: "42830",
          healthcare: "13.9",
          obesity: "35.7",
          smokes: "22.1",
        },
      },
    };
    expect(data["Alabama"]).toBeDefined();
    expect(data["Alabama"].abbreviation).toBe("AL");
  });

  it("ObesityRecord represents a single CSV row", () => {
    const record: ObesityRecord = {
      category_value: "18 - 24",
      category: "Age Group",
      location: "AL",
      locationdesc: "Alabama",
      year: "2015",
      avg_data_value: "23.5",
    };
    expect(record.category).toBe("Age Group");
    expect(record.year).toBe("2015");
  });
});
