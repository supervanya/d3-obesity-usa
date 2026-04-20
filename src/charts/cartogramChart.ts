import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";
import { MAX_YEAR, MIN_YEAR, NODE, colorScale, height, margin, width, yearToIndex } from "../constants";
import type { CombinedData, CorrelationKey, ScatterData } from "../types";

interface CartogramNode extends d3.SimulationNodeDatum {
  name: string;
  abbreviation: string;
  obese: number[];
  scatter: ScatterData;
  r: number;
}

export interface CartogramController {
  updateYear: (year: number) => void;
  showScatter: (axis: CorrelationKey, axisLabel: string) => void;
  showCartogram: () => void;
  destroy: () => void;
}

export interface CartogramOptions {
  svgEl: SVGSVGElement;
  us: Topology;
  combinedData: CombinedData;
  initialYear: number;
  onStateClick: (stateName: string) => void;
}

const applySimulation = (nodes: CartogramNode[]) => {
  const simulation = d3
    .forceSimulation(nodes)
    .force("cx", d3.forceX().x(() => width / 2).strength(0.02))
    .force("cy", d3.forceY().y(() => height / 2).strength(0.02))
    .force("x", d3.forceX().x((d: any) => d.x).strength(0.3))
    .force("y", d3.forceY().y((d: any) => d.y).strength(0.3))
    .force("charge", d3.forceManyBody().strength(-1))
    .force(
      "collide",
      d3
        .forceCollide()
        .radius((d: any) => d.r + NODE.PADDING)
        .strength(1),
    )
    .stop();

  while (simulation.alpha() > 0.01) {
    simulation.tick();
  }

  return simulation.nodes() as CartogramNode[];
};

export function buildCartogram({
  svgEl,
  us,
  combinedData,
  initialYear,
  onStateClick,
}: CartogramOptions): CartogramController {
  const stateBoundaries = topojson.mesh(us, us.objects.states as any, (a: any, b: any) => a !== b);
  const nation = topojson.mesh(us, us.objects.nation as any);
  const states = topojson.feature(us, us.objects.states as any) as any;

  const geoPath = d3.geoPath();
  const svgWidth = width + margin.right + margin.left + 80;
  const svg = d3.select(svgEl).attr("viewBox", `-30 -20 ${svgWidth} ${690}`);
  svg.selectAll("*").remove();

  const tooltip = d3.select("body").selectAll<HTMLDivElement, unknown>(".tooltip").data([null]);
  const tooltipSel = tooltip.enter().append("div").attr("class", "tooltip").merge(tooltip as any);

  svg
    .append("g")
    .append("path")
    .classed("state-boundaries", true)
    .datum(stateBoundaries)
    .attr("fill", "none")
    .attr("stroke", "lightgray")
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", "round")
    .attr("d", geoPath);

  svg
    .append("path")
    .classed("nation-boundary", true)
    .datum(nation)
    .attr("fill", "none")
    .attr("stroke", "gray")
    .attr("stroke-linejoin", "round")
    .attr("d", geoPath);

  // Legend.
  const legendWidth = 20;
  const legendHeight = 200;
  const legendX = width + margin.left - 10;
  const legendY = 80;

  const defs = svg.append("defs");
  const linearGradient = defs
    .append("linearGradient")
    .attr("id", "obesity-gradient")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%");

  const [domainMin, domainMax] = colorScale.domain();
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const value = domainMin + t * (domainMax - domainMin);
    linearGradient.append("stop").attr("offset", `${t * 100}%`).attr("stop-color", colorScale(value));
  }

  const legendGroup = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${legendX}, ${legendY})`);

  legendGroup
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#obesity-gradient)")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 0.5);

  const legendScale = d3.scaleLinear().domain([domainMin, domainMax]).range([legendHeight, 0]);
  const legendAxis = d3.axisRight(legendScale).ticks(5).tickFormat((d) => `${d}%`);
  legendGroup.append("g").attr("transform", `translate(${legendWidth}, 0)`).call(legendAxis as any);
  legendGroup
    .append("text")
    .attr("x", legendWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("font-weight", "bold")
    .text("Obesity %");

  // Bubble data & simulation.
  const yearIdx0 = yearToIndex(initialYear);

  const obesityToRadius = d3
    .scaleSqrt()
    .domain(d3.extent(Object.values(combinedData), (d) => d.obese[yearIdx0]) as [number, number])
    .range([NODE.MIN_RADIUS, NODE.MAX_RADIUS]);

  states.features.forEach((feature: any) => {
    const [x, y] = geoPath.centroid(feature);
    const { name } = feature.properties;
    const combined = combinedData[name];
    const r = obesityToRadius(combined.obese[yearIdx0]);
    feature.properties = { ...feature.properties, ...combinedData[name], x, y, r };
  });

  const data = states.features.map((d: any) => d.properties);
  const values = applySimulation(data);

  const bubbles = svg.append("g").classed("centroids", true);

  let bubbles_group = bubbles.selectAll("g").data(values);

  bubbles_group = bubbles_group
    .join("g")
    .classed("scatterBubbleGroup", true)
    .on("click", (_event, d: any) => onStateClick(d.scatter.state))
    .on("mouseover", (_event, d: any) => {
      const yi = yearToIndex(currentYear);
      tooltipSel
        .style("opacity", "1")
        .html(
          `<div class="tooltip-title">${d.name}</div>` +
            `<div class="tooltip-value">Obesity: ${d.obese[yi]}%</div>` +
            `<div class="tooltip-value">Poverty: ${d.scatter.poverty}%</div>` +
            `<div class="tooltip-value">Income: $${Number(d.scatter.income).toLocaleString()}</div>`,
        );
    })
    .on("mousemove", (event: any) => {
      tooltipSel.style("left", event.pageX + 12 + "px").style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltipSel.style("opacity", "0");
    });

  bubbles_group
    .classed("scatterBubble", true)
    .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`)
    .append("circle")
    .attr("r", (d: any) => obesityToRadius(d.obese[yearIdx0]))
    .attr("fill", (d: any) => colorScale(+d.obese[yearIdx0]))
    .attr("stroke-width", 1);

  bubbles_group.append("text").classed("stateText", true).text((d: any) => d.abbreviation);

  bubbles_group
    .append("text")
    .classed("stateValue", true)
    .attr("y", 20)
    .text((d: any) => `${d.obese[yearIdx0]}%`);

  let currentYear = initialYear;

  function updateYear(year: number) {
    currentYear = year;
    const yi = yearToIndex(year);
    const circles = svg.selectAll(".scatterBubble").selectAll("circle");
    circles.transition().ease(d3.easeElastic).duration(750);
    circles
      .attr("r", (d: any) => obesityToRadius(d.obese[yi]))
      .attr("fill", (d: any) => colorScale(+d.obese[yi]));
    svg.selectAll(".stateValue").text((d: any) => `${d.obese[yi]}%`);
  }

  function addLabel(axis: any, label: string, x: number, y = 0, deg = 0) {
    axis
      .select(".tick:last-of-type text")
      .clone()
      .text(label)
      .attr("x", x)
      .attr("y", y)
      .style("text-anchor", "start")
      .style("font-weight", "bold")
      .style("transform", `rotate(${deg}deg)`)
      .style("fill", "#555");
  }

  function showScatter(axisKey: CorrelationKey, axisLabel: string) {
    svg.selectAll(".x").remove();
    svg.selectAll(".y").remove();

    const scatterData = Object.values(combinedData);
    const xExtent = (d3.extent(scatterData, (d) => +d.scatter[axisKey]) as [number, number]).map((d, i) =>
      i === 0 ? d * 0.9 : d * 1.05,
    ) as [number, number];
    const xScale = d3.scaleLinear().domain(xExtent).range([0, width]);

    const yExtent = (d3.extent(scatterData, (d) => +d.scatter.obesity) as [number, number]).map((d, i) =>
      i === 0 ? d * 0.97 : d * 1.05,
    ) as [number, number];
    const yScale = d3.scaleLinear().domain(yExtent).range([height, 0]);

    const xAxis = d3.axisBottom(xScale).ticks(5).tickSizeOuter(0);
    const xAxisDraw = svg.append("g").attr("class", "x axis");
    xAxisDraw.attr("transform", `translate(0, ${height})`).call(xAxis as any).call((sel) => addLabel(sel, axisLabel, 30, 8));
    xAxisDraw.selectAll("text").attr("dy", "1em");

    const yAxis = d3.axisLeft(yScale).ticks(15).tickSizeOuter(0);
    const yAxisDraw = svg
      .append("g")
      .attr("class", "y axis")
      .call(yAxis as any)
      .call((sel) => addLabel(sel, "Obesity Prevalence (%)", -135, 15, -90));

    xAxisDraw.transition().duration(1000).delay(2500).style("opacity", 1);
    yAxisDraw.transition().duration(1000).delay(2500).style("opacity", 1);

    svg
      .selectAll(".state-boundaries,.nation-boundary")
      .transition()
      .duration(1000)
      .style("transform", "scale(0.1)")
      .transition()
      .delay(200)
      .style("display", "none");

    svg
      .selectAll(".scatterBubble")
      .transition()
      .delay(1000)
      .duration(750)
      .attr("transform", (d: any) => `translate(${d.x}, ${yScale(d.scatter.obesity)})`)
      .transition()
      .attr(
        "transform",
        (d: any) => `translate(${xScale(+d.scatter[axisKey])}, ${yScale(d.scatter.obesity)})`,
      );
  }

  function showCartogram() {
    svg.selectAll(".x").remove();
    svg.selectAll(".y").remove();

    svg
      .selectAll(".state-boundaries,.nation-boundary")
      .style("display", "block")
      .transition()
      .duration(2000)
      .style("transform", "scale(1)")
      .transition();

    svg
      .selectAll(".scatterBubble")
      .transition()
      .duration(750)
      .delay((_d: any, i: number) => i * 15)
      .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`)
      .transition();
  }

  function destroy() {
    svg.selectAll("*").remove();
  }

  return { updateYear, showScatter, showCartogram, destroy };
}

export { MIN_YEAR, MAX_YEAR };
