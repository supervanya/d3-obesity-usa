const geoPath = d3.geoPath()
const height = 600
const us = d3.json("https://unpkg.com/us-atlas@2/us/10m.json")
let stateBoundaries
let nation

us.then((data) => {
    stateBoundaries = topojson.mesh(data, data.objects.states, (a, b) => a !== b)
    nation = topojson.mesh(data, data.objects.nation)
})

console.log('geoPath', geoPath)
console.log(nation, stateBoundaries)


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
    .attr("d", geoPath);

svg.append("path")
    .classed("nation-boundary", true)
    .datum(nation)
    .attr("fill", "none")
    .attr("stroke", "gray")
    .attr("stroke-linejoin", "round")
    .attr("d", geoPath);