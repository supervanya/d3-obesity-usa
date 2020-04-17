// import data from './us_stats.js';
import { parseRow, createStatePacks } from "./helpers.js";

// const csv_data = d3.csv("observable_data_states.csv", parseRow);
const geoPath = d3.geoPath();

const width = 800;
const height = 600;
const NODE = { MIN_RADIUS: 10, MAX_RADIUS: 40, PADDING: 2 };


const createBaseMap = (stateBoundaries, nation) => {
  const svg = d3
    .select("#d3-cartogram")
    .attr("viewBox", `0 0 960 ${height}`)
    .style("width", "100%")
    .style("height", "auto");

  svg
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

  return svg.node();
};

const applySimulation = (nodes) => {
  const simulation = d3.forceSimulation(nodes)
    .force("cx", d3.forceX().x(d => width / 2).strength(0.02))
    .force("cy", d3.forceY().y(d => height / 2).strength(0.02))
    .force("x", d3.forceX().x(d => d.x).strength(0.3))
    .force("y", d3.forceY().y(d => d.y).strength(0.3))
    .force("charge", d3.forceManyBody().strength(-1))
    .force("collide", d3.forceCollide().radius(d => d.r + NODE.PADDING).strength(1))
    .stop()

  while (simulation.alpha() > 0.01) {
    simulation
      .tick()
  }

  return simulation.nodes();
}

(async () => {
  const us = await d3.json("https://unpkg.com/us-atlas@2/us/10m.json");
  const combined_data = await d3.json("./scatter_cartogram.json");
  console.log(combined_data);

  const stateBoundaries = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
  const nation = topojson.mesh(us, us.objects.nation);
  const states = topojson.feature(us, us.objects.states);

  const year_selector = (year) => 0

  // creating the general outline of the US with states
  const baseMap = createBaseMap(stateBoundaries, nation);
  const radius = d3.scaleSqrt()
    .domain(d3.extent(Object.values(combined_data), d => d.obese[year_selector(2008)]))
    .range([NODE.MIN_RADIUS, NODE.MAX_RADIUS])

  states.features.forEach((feature) => {
    const [x, y] = geoPath.centroid(feature);
    const { name } = feature.properties
    const combined = combined_data[name]
    const year = year_selector(2008)
    const r = radius(combined.obese[year])
    feature.properties = { ...feature.properties, ...combined_data[name], x, y, r };
  });
  console.log(states)

  const data = states.features.map((d) => d.properties)
  // const dataByState = d3.group(data, d => d.state)
  // const statesPacked = createStatePacks(dataByState, radius, csv_data);
  // let values = [...new Map(statesPacked).values()];
  const values = applySimulation(data)

  d3.select(baseMap)
    .append("g")
    .classed("centroids", true)
    .selectAll("circle")
    .data(values)
    .join("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", (d) => d.r)
    .attr("fill", "rgba(63, 191, 108, 0.3)")
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .on('mouseover', function (d, i) {
      d3.select(this).transition()
        .duration(250)
        .style("transform", 'translate(0px, -5px)')
        .attr('fill', 'rgba(63, 191, 108, 0.9)')

    })
    .on('mouseout', function (d, i) {
      d3.select(this).transition()
        .duration(250)
        .style("transform", 'translate(0px, 0px)')
        .attr('fill', 'rgba(63, 191, 108, 0.3)')
    })
})();
