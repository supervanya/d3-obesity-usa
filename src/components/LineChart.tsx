import { useEffect, useRef } from "react";
import { drawLineChart } from "../charts/lineChart";

interface LineChartProps {
  state: string;
  category: string;
}

export default function LineChart({ state, category }: LineChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    drawLineChart(hostRef.current, state, category);
  }, [state, category]);

  return <div ref={hostRef} />;
}
