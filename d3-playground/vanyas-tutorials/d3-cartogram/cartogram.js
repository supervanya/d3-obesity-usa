// import data from './us_stats.js';
import { parseRow, createStatePacks } from './helpers.js'
const csv_data = d3.csv("./observable_data_states.csv", parseRow)
const us_atlas = d3.json("https://unpkg.com/us-atlas@2/us/10m.json")
const geoPath = d3.geoPath()

const height = 600
const NODE = ({ MIN_RADIUS: 2.5, MAX_RADIUS: 20, PADDING: 2 });

// const radius = d3.scaleSqrt()
//     .domain(d3.extent(csv_data, d => d.total_households))
//     .range([NODE.MIN_RADIUS, NODE.MAX_RADIUS])

const getStatePopulation = state_name => {
    // const states_array = Object.values(data)
    return data.state_name.land
}

const createBaseMap = (stateBoundaries, nation) => {
    const svg = d3.select('#d3-cartogram')
        .attr("viewBox", `0 0 960 ${height}`)
        .style("width", "100%")
        .style("height", "auto")

    svg.append("path")
        .classed("state-boundaries", true)
        .datum(stateBoundaries)
        .attr("fill", "none")
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d", d3.geoPath());

    svg.append("path")
        .classed("nation-boundary", true)
        .datum(nation)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-linejoin", "round")
        .attr("d", d3.geoPath());

    return svg.node()
}

(async () => {
    const us = await us_atlas

    const stateBoundaries = topojson.mesh(us, us.objects.states, (a, b) => a !== b)
    const nation = topojson.mesh(us, us.objects.nation)
    const states = topojson.feature(us, us.objects.states);
    states.features.forEach(feature => {
        console.log(feature)

        // const [x, y] = geoPath.centroid(feature)
        // feature.properties = { ...feature.properties, x, y };
    });
    // states.features.forEach(feature => {
    //     const [x, y] = geoPath.centroid(feature)
    //     feature.properties = { ...feature.properties, x, y };
    // });

    // creating the general outline of the US with states
    const baseMap = createBaseMap(stateBoundaries, nation)

    // adding the centroids 
    d3.select(baseMap)
        .append("g")
        .classed("centroids", true)
        .selectAll("circle")
        .data(states.features.map(d => d.properties))
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => NODE.MAX_RADIUS)
        .attr("fill", "blue");

    // let statesPacked
    // const data = await csv_data
    // const dataByState = d3.group(data, d => d.state)
    // statesPacked = createStatePacks(dataByState);

})()
