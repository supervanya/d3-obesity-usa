export interface ScatterData {
  state: string;
  abbr: string;
  poverty: string;
  age: string;
  income: string;
  healthcare: string;
  obesity: string;
  smokes: string;
}

export interface StateData {
  abbreviation: string;
  obese: number[];
  scatter: ScatterData;
}

export type CombinedData = Record<string, StateData>;

export interface ObesityRecord {
  category_value: string;
  category: string;
  location: string;
  locationdesc: string;
  year: string;
  avg_data_value: string;
}

export type CorrelationKey = "poverty" | "smokes" | "healthcare" | "age" | "income";
