import { useEffect, useState } from "react";
import * as d3 from "d3";
import Nav from "./components/Nav";
import Cartogram from "./components/Cartogram";
import Aside from "./components/Aside";
import { chartsInfo, MIN_YEAR } from "./constants";
import type { CombinedData, CorrelationKey } from "./types";

export type ViewMode = "cartogram" | { axis: CorrelationKey };

const chartTitles: Record<CorrelationKey, string> = {
  smokes: "Smoking (%)",
  poverty: "Poverty (%)",
  healthcare: "Lack of Health Care (%)",
  age: "Median Age",
  income: "Median Household Income",
};

export default function App() {
  const [combinedData, setCombinedData] = useState<CombinedData | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  const [year, setYear] = useState<number>(MIN_YEAR);
  const [view, setView] = useState<ViewMode>("cartogram");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [lineCategory, setLineCategory] = useState<string>("Age Group");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = (await d3.json("data/scatter_cartogram.json")) as CombinedData;
        if (!cancelled) setCombinedData(data);
      } catch (error) {
        if (!cancelled) setDataError((error as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isScatter = view !== "cartogram";
  const chartTitle = isScatter
    ? "Correlations Discovered Between Obesity And Poverty, Age, Income, Healthcare And Smoking."
    : "Obesity Cartogram";
  const chartDescription = isScatter
    ? chartsInfo[(view as { axis: CorrelationKey }).axis]
    : "Obesity trend across the States in the US is rising";

  return (
    <>
      <Nav
        activeAxis={isScatter ? (view as { axis: CorrelationKey }).axis : null}
        onSelectAxis={(axis) => setView({ axis })}
        onBackToMap={() => setView("cartogram")}
        axisLabels={chartTitles}
      />

      <Cartogram
        combinedData={combinedData}
        dataError={dataError}
        year={year}
        onYearChange={setYear}
        view={view}
        chartTitle={chartTitle}
        chartDescription={chartDescription}
        onStateClick={(stateName) => setSelectedState(stateName)}
      />

      <Aside
        selectedState={selectedState}
        lineCategory={lineCategory}
        onLineCategoryChange={setLineCategory}
      />
    </>
  );
}
