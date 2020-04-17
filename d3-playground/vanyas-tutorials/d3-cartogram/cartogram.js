const geoPath = d3.geoPath()
const height = 600
const us = d3.json("https://unpkg.com/us-atlas@2/us/10m.json")
let stateBoundaries, nation, states
const NODE = ({ MIN_RADIUS: 2.5, MAX_RADIUS: 20, PADDING: 2 });

const createBaseMap = () => {
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

us.then((us) => {
    stateBoundaries = topojson.mesh(us, us.objects.states, (a, b) => a !== b)
    nation = topojson.mesh(us, us.objects.nation)
    const states = topojson.feature(us, us.objects.states);
    states.features.forEach(feature => {
        const [x, y] = geoPath.centroid(feature)
        feature.properties = { ...feature.properties, x, y };
    });

    const baseMap = createBaseMap()

    d3.select(baseMap)
        .append("g")
        .classed("centroids", true)
        .selectAll("circle")
        .data(states.features.map(d => d.properties))
        .join("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", NODE.MIN_RADIUS)
        .attr("fill", "blue");

})