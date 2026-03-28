import * as d3 from "d3";

export const MIN_YEAR = 1995;
export const MAX_YEAR = 2016;

export const NODE = { MIN_RADIUS: 4, MAX_RADIUS: 20, PADDING: 2 };

export const margin = { top: 80, right: 40, bottom: 40, left: 60 };
export const width = 990 - margin.right - margin.left;
export const height = 750 - margin.top - margin.bottom;

export const yearToIndex = (year: number) => MAX_YEAR - year;

export const colorScale = d3.scaleSequential(d3.interpolateReds).domain([10, 40]);

export const chartsInfo: Record<string, string> = {
  income: "Interesting insight: Wealthier states tend to have less obesity.",
  smokes: "Interesting insight: Smoking has a positive correlation obesity.",
  age: "Interesting insight: Obesity rate is mostly found in the age group of 35 to 40 years.",
  poverty:
    "Interesting insight: Positive correlation between Obesity and Poverty. Southern states tend to have the highest rates of obesity, poverty.",
  healthcare:
    "Interesting insight: States with lack of health coverage tend to have more obesity.Texas being an outlier as it has the highest % lack in healthcare.",
};
