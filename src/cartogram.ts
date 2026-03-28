/**
 * SOME TODOs:
 *
 * Style:
 * 1. Make the state names in the center
 * 2. Align chart text left
 * 3. Make it feel like a webpage (grey margins? Sections indication?)
 * 4. Fix font sizing
 * 5. Horizontal Legend
 * 6. Try Red/Blue color scheme
 *
 * Functionality:
 * 1. Tooltips when hovering over the state circles
 * 2. Increase the clickable area of the radio buttons and add hover icon https://uxplanet.org/radio-buttons-ux-design-588e5c0a50dc
 *
 * Critical
 * 1. Sometimes the obesity values on the Y axis are wrong
 * 2. Add exercise data
 */

import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";
import drawLineChart from "./line-chart.ts";
import type { CombinedData, ScatterData } from "./types.ts";

interface CartogramNode extends d3.SimulationNodeDatum {
  name: string;
  abbreviation: string;
  obese: number[];
  scatter: ScatterData;
  r: number;
}

const geoPath = d3.geoPath();

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip");
let combinedData: CombinedData;
let selectedCategory: string | undefined;

const chartsInfo = {
  income: "Interesting insight: Wealthier states tend to have less obesity.",
  smokes: "Interesting insight: Smoking has a positive correlation obesity.",
  age: "Interesting insight: Obesity rate is mostly found in the age group of 35 to 40 years.",
  poverty:
    "Interesting insight: Positive correlation between Obesity and Poverty. Southern states tend to have the highest rates of obesity, poverty.",
  healthcare:
    "Interesting insight: States with lack of health coverage tend to have more obesity.Texas being an outlier as it has the highest % lack in healthcare.",
};

const NODE = { MIN_RADIUS: 4, MAX_RADIUS: 20, PADDING: 2 };

// Dimensions.
const margin = { top: 80, right: 40, bottom: 40, left: 60 };
const width = 990 - margin.right - margin.left;
const height = 750 - margin.top - margin.bottom;

let svg;

const MIN_YEAR = 1995;
const MAX_YEAR = 2016;
let selectedYear = 1995;
let obesityToRadius;
const year_selector = (year) => MAX_YEAR - year;
const colorScale = d3.scaleSequential(d3.interpolateReds).domain([10, 40]);

// creates, appends and returns base outline map of US
const createBaseMap = (stateBoundaries, nation) => {
  const svgWidth = width + margin.right + margin.left + 80;
  svg = d3.select("#cartogram-svg").attr("viewBox", `-30 -20 ${svgWidth} ${690}`);

  svg
    .append("g")
    .append("path")
    .classed("state-boundaries", true)
    .datum(stateBoundaries)
    .attr("fill", "none")
    .attr("stroke", "lightgray")
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", "round")
    .attr("d", d3.geoPath());

  svg
    .append("path")
    .classed("nation-boundary", true)
    .datum(nation)
    .attr("fill", "none")
    .attr("stroke", "gray")
    .attr("stroke-linejoin", "round")
    .attr("d", d3.geoPath());

  // Create SVG gradient legend for obesity color scale
  const legendWidth = 20;
  const legendHeight = 200;
  const legendX = width + margin.left - 10;
  const legendY = 80;

  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient").attr("id", "obesity-gradient").attr("x1", "0%").attr("y1", "100%").attr("x2", "0%").attr("y2", "0%");

  const [domainMin, domainMax] = colorScale.domain();
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const value = domainMin + t * (domainMax - domainMin);
    linearGradient.append("stop").attr("offset", `${t * 100}%`).attr("stop-color", colorScale(value));
  }

  const legendGroup = svg.append("g").attr("class", "legend").attr("transform", `translate(${legendX}, ${legendY})`);

  legendGroup.append("rect").attr("width", legendWidth).attr("height", legendHeight).style("fill", "url(#obesity-gradient)").attr("stroke", "#ccc").attr("stroke-width", 0.5);

  const legendScale = d3.scaleLinear().domain([domainMin, domainMax]).range([legendHeight, 0]);
  const legendAxis = d3.axisRight(legendScale).ticks(5).tickFormat((d) => `${d}%`);
  legendGroup.append("g").attr("transform", `translate(${legendWidth}, 0)`).call(legendAxis);

  legendGroup.append("text").attr("x", legendWidth / 2).attr("y", -10).attr("text-anchor", "middle").style("font-size", "11px").style("font-weight", "bold").text("Obesity %");

  return svg.node();
};

const applySimulation = (nodes: CartogramNode[]) => {
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "cx",
      d3
        .forceX()
        .x(() => width / 2)
        .strength(0.02),
    )
    .force(
      "cy",
      d3
        .forceY()
        .y(() => height / 2)
        .strength(0.02),
    )
    .force(
      "x",
      d3
        .forceX()
        .x((d) => d.x)
        .strength(0.3),
    )
    .force(
      "y",
      d3
        .forceY()
        .y((d) => d.y)
        .strength(0.3),
    )
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

const showError = (message) => {
  const container = document.getElementById("cartogram-container");
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = "color: #b00; background: #fee; border: 1px solid #b00; padding: 16px; margin: 16px; border-radius: 4px; text-align: center;";
  errorDiv.textContent = `Failed to load visualization data: ${message}`;
  container.prepend(errorDiv);
};

const drawCartogram = async () => {
  let us: Topology;
  try {
    us = (await d3.json("us-atlas-10m.json")) as Topology;
    combinedData = (await d3.json("data/scatter_cartogram.json")) as CombinedData;
  } catch (error) {
    showError((error as Error).message);
    return;
  }
  const stateBoundaries = topojson.mesh(us, us.objects.states as any, (a: any, b: any) => a !== b);
  const nation = topojson.mesh(us, us.objects.nation as any);
  const states = topojson.feature(us, us.objects.states as any) as any;

  const year = year_selector(selectedYear);

  // creating the general outline of the US with states
  const baseMap = createBaseMap(stateBoundaries, nation);

  // this is a scale for converting obesity % to a radius
  obesityToRadius = d3
    .scaleSqrt()
    .domain(d3.extent(Object.values(combinedData), (d) => d.obese[year]))
    .range([NODE.MIN_RADIUS, NODE.MAX_RADIUS]);

  states.features.forEach((feature) => {
    const [x, y] = geoPath.centroid(feature);
    const { name } = feature.properties;
    const combined = combinedData[name];
    const r = obesityToRadius(combined.obese[year]);
    feature.properties = { ...feature.properties, ...combinedData[name], x, y, r };
  });

  const data = states.features.map((d) => d.properties);
  // const dataByState = d3.group(data, d => d.state)
  // const statesPacked = createStatePacks(dataByState, radius, csv_data);
  // let values = [...new Map(statesPacked).values()];
  const values = applySimulation(data);

  const bubbles = d3.select(baseMap).append("g").classed("centroids", true);

  let bubbles_group = bubbles.selectAll("g").data(values);

  bubbles_group = bubbles_group
    .join("g")
    .classed("scatterBubbleGroup", true)
    .on("click", (_event, d) => click(d))
    .on("mouseover", (event, d) => {
      const yi = year_selector(selectedYear);
      tooltip
        .style("opacity", "1")
        .html(
          `<div class="tooltip-title">${d.name}</div>` +
          `<div class="tooltip-value">Obesity: ${d.obese[yi]}%</div>` +
          `<div class="tooltip-value">Poverty: ${d.scatter.poverty}%</div>` +
          `<div class="tooltip-value">Income: $${Number(d.scatter.income).toLocaleString()}</div>`,
        );
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", event.pageX + 12 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", "0");
    });

  bubbles_group
    .classed("scatterBubble", true)
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
    .append("circle")
    .attr("r", (d) => obesityToRadius(d.obese[year]))
    .attr("fill", (d) => colorScale(+d.obese[year]))
    .attr("stroke-width", 1);

  // adding the State Abbreviation to the bubbles
  bubbles_group
    .append("text")
    .classed("stateText", true)
    .text((d) => d.abbreviation);

  // adding the Value (obesity % at first) annotation to the bubbles
  bubbles_group
    .append("text")
    .classed("stateValue", true)
    .attr("y", 20)
    .text((d) => `${d.obese[year]}%`);

  function redrawLineChart(stateName, category) {
    d3.select(".line-chart").remove();
    drawLineChart(stateName, category);
    d3.select("#line-heading")
      .text("How do different factors correlate with Obesity for " + stateName + "?")
      .style("display", "block");
    d3.select("#lineChart-radioInputs").style("display", "block");
  }

  function click(d) {
    const state = d.scatter.state;
    if (!selectedCategory) {
      redrawLineChart(state, "Age Group");
    } else {
      redrawLineChart(state, selectedCategory);
    }
    const buttons_container = d3.select("#lineChart-radioInputs").style("display", "block");
    const radios = buttons_container.selectAll("input");
    radios.on("change", (event) => {
      selectedCategory = event.currentTarget.value;
      redrawLineChart(state, event.currentTarget.value);
    });
  }

  let moving = false;
  let currentValue = MIN_YEAR;
  const targetValue = MAX_YEAR;
  let timer;

  function step() {
    const yearslider = d3.select("#cartogram_year");
    currentValue = +yearslider.attr("value");
    updateYear(currentValue);
    //update(x.invert(currentValue));
    currentValue = +currentValue + 1;
    yearslider.attr("value", currentValue);
    if (+currentValue > +targetValue) {
      moving = false;
      currentValue = 0;
      clearInterval(timer);
      playButton.text("Play");
      console.log("Slider moving: " + moving);
    }
  }

  const playButton = d3.select("#play-button").on("click", (event) => {
    const button = d3.select(event.currentTarget);
    if (button.text() == "Pause") {
      moving = false;
      clearInterval(timer);
      timer = 0;
      button.text("Play");
    } else {
      moving = true;
      timer = setInterval(step, 1000);
      button.text("Pause");
    }
    console.log("Slider moving: " + moving);
  });
};

const updateScatter = (caller) => {
  console.log(caller);
  const id = caller.id;
  const chosenXAxis = id;
  const axisLabel = caller.text;

  d3.select("#cartogram_controls_container").style("opacity", "0");
  d3.selectAll(".x").remove();

  d3.selectAll(".scatter-x-axis").classed("selected-axis", false);
  d3.select(`#${chosenXAxis}`).classed("selected-axis", true);

  d3.select(`#chart-title`).text(
    "Correlations Discovered Between Obesity And Poverty, Age, Income, Healthcare And Smoking.",
  );
  d3.select(`#chart-description`).text("Interesting insight:");

  d3.select(`#chart-description`).text(chartsInfo[id]);

  const scatterData = Object.values(combinedData);

  function addLabel(axis, label, x, y = 0, deg = 0) {
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

  // Scales.
  const xExtent = d3.extent(scatterData, (d) => +d.scatter[chosenXAxis]).map((d, i) => (i === 0 ? d * 0.9 : d * 1.05));

  const xScale = d3.scaleLinear().domain(xExtent).range([0, width]);

  const yExtent = d3.extent(scatterData, (d) => +d.scatter.obesity).map((d, i) => (i === 0 ? d * 0.97 : d * 1.05));

  const yScale = d3.scaleLinear().domain(yExtent).range([height, 0]);

  // Draw x axis.
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(5)
    .tickSizeOuter(0);

  const xAxisDraw = svg.append("g").attr("class", "x axis");

  xAxisDraw.attr("transform", `translate(0, ${height})`).call(xAxis).call(addLabel, axisLabel, 30, 8);

  xAxisDraw.selectAll("text").attr("dy", "1em");

  // Draw y axis.
  const yAxis = d3.axisLeft(yScale).ticks(15).tickSizeOuter(0);

  const yAxisDraw = svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .call(addLabel, "Obesity Prevalence (%)", -135, 15, -90);

  // show the axis
  xAxisDraw.transition().duration(1000).delay(2500).style("opacity", 1);

  // show the axis
  yAxisDraw.transition().duration(1000).delay(2500).style("opacity", 1);

  // hide the state outline
  d3.selectAll(".state-boundaries,.nation-boundary")
    .transition()
    .duration(1000)
    .style("transform", "scale(0.1)")
    .transition()
    .delay(200)
    .style("display", "none");

  // move the bubbles to the right x and y coordinates
  d3.selectAll(".scatterBubble")
    .transition()
    .delay(1000)
    .duration(750)
    .attr("transform", (d: any) => {
      const x = d.x;
      const y = yScale(d.scatter.obesity);
      return `translate(${x}, ${y})`;
    })
    .transition()
    .attr("transform", (d: any) => {
      const x = xScale(d.scatter[chosenXAxis]);
      const y = yScale(d.scatter.obesity);
      return `translate(${x}, ${y})`;
    });
};

const updateCartogram = () => {
  d3.select("#cartogram_controls_container").style("opacity", "1");
  d3.selectAll(".x").remove();
  d3.selectAll(".y").remove();

  // show the state outline
  d3.selectAll(".state-boundaries,.nation-boundary")
    .style("display", "block")
    .transition()
    .duration(2000)
    .style("transform", "scale(1)")
    .transition();

  // move the bubbles to the right x and y coordinates
  d3.selectAll(".scatterBubble")
    .transition()
    .duration(750)
    .delay((d, i) => i * 15)
    .attr("transform", (d: any) => {
      const x = d.x;
      const y = d.y;
      return `translate(${x}, ${y})`;
    })
    .transition();

  d3.select("#chart-title").text("Obesity Cartogram");

  d3.select("#chart-description").text("Obesity trend across the States in the US is rising");
};

const updateYear = (year) => {
  selectedYear = year;
  console.log(selectedYear);

  const year_index = year_selector(year);
  const bubbles = d3.selectAll(".scatterBubble").selectAll("circle");

  bubbles.transition().ease(d3.easeElastic).duration(750);

  bubbles.attr("r", (d: any) => obesityToRadius(d.obese[year_index])).attr("fill", (d: any) => colorScale(+d.obese[year_index]));

  d3.selectAll(".stateValue").text((d: any) => {
    return `${d.obese[year_index]}%`;
  });
};

drawCartogram();

d3.selectAll(".scatter-x-axis").on("click", (event) => {
  updateScatter(event.currentTarget);
});

d3.select("#backToMap").on("click", () => {
  updateCartogram();
});

d3.select("input[type=range]#cartogram_year").on("input", (event) => {
  const year = event.currentTarget.value;
  updateYear(year);
});
