import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Topology } from "topojson-specification";
import { buildCartogram, type CartogramController } from "../charts/cartogramChart";
import { MAX_YEAR, MIN_YEAR } from "../constants";
import type { CombinedData, CorrelationKey } from "../types";
import type { ViewMode } from "../App";

interface CartogramProps {
  combinedData: CombinedData | null;
  dataError: string | null;
  year: number;
  onYearChange: (year: number) => void;
  view: ViewMode;
  chartTitle: string;
  chartDescription: string;
  onStateClick: (stateName: string) => void;
}

const axisLabels: Record<CorrelationKey, string> = {
  smokes: "Smoking (%)",
  poverty: "Poverty (%)",
  healthcare: "Lack of Health Care (%)",
  age: "Median Age",
  income: "Median Household Income",
};

export default function Cartogram({
  combinedData,
  dataError,
  year,
  onYearChange,
  view,
  chartTitle,
  chartDescription,
  onStateClick,
}: CartogramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const controllerRef = useRef<CartogramController | null>(null);
  const onStateClickRef = useRef(onStateClick);
  onStateClickRef.current = onStateClick;
  const initialYearRef = useRef(year);

  const [topology, setTopology] = useState<Topology | null>(null);
  const [topoError, setTopoError] = useState<string | null>(null);

  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const us = (await d3.json("us-atlas-10m.json")) as Topology;
        if (!cancelled) setTopology(us);
      } catch (error) {
        if (!cancelled) setTopoError((error as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || !combinedData || !topology) return;
    controllerRef.current = buildCartogram({
      svgEl: svgRef.current,
      us: topology,
      combinedData,
      initialYear: initialYearRef.current,
      onStateClick: (name) => onStateClickRef.current(name),
    });
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [combinedData, topology]);

  useEffect(() => {
    controllerRef.current?.updateYear(year);
  }, [year]);

  useEffect(() => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    if (view === "cartogram") {
      ctrl.showCartogram();
    } else {
      ctrl.showScatter(view.axis, axisLabels[view.axis]);
    }
  }, [view]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      onYearChange(Math.min(year + 1, MAX_YEAR));
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, year, onYearChange]);

  useEffect(() => {
    if (playing && year >= MAX_YEAR) setPlaying(false);
  }, [year, playing]);

  const isCartogram = view === "cartogram";
  const error = dataError ?? topoError;

  return (
    <main id="cartogram-container">
      {error && (
        <div
          style={{
            color: "#b00",
            background: "#fee",
            border: "1px solid #b00",
            padding: 16,
            margin: 16,
            borderRadius: 4,
            textAlign: "center",
          }}
        >
          Failed to load visualization data: {error}
        </div>
      )}

      <div id="cartogram_controls_container" style={{ opacity: isCartogram ? 1 : 0 }}>
        <div id="year_scrubber">
          <input
            id="cartogram_year"
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            step={1}
            value={year}
            list="tickmarks"
            onChange={(e) => onYearChange(+e.currentTarget.value)}
          />
          <datalist id="tickmarks">
            <option>1995</option>
            <option>2000</option>
            <option>2005</option>
            <option>2010</option>
            <option>2016</option>
          </datalist>
        </div>
        <div id="cartogram_controls">
          <button id="play-button" onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      <div id="chart-info">
        <h2 id="chart-title">{chartTitle}</h2>
        <p id="chart-description">{chartDescription}</p>
      </div>

      <svg id="cartogram-svg" ref={svgRef}></svg>
    </main>
  );
}
