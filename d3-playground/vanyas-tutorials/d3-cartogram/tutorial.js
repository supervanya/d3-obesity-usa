// URL: https://observablehq.com/@clhenrick/dorling-cartogram-circle-packs
// Title: Dorling Cartogram Circle Packs
// Author: Chris Henrick (@clhenrick)
// Version: 409
// Runtime version: 1

const m0 = {
    id: "c421a57a3d22c60e@409",
    variables: [
        {
            inputs: ["md"],
            value: (function (md) {
                return (
                    md`# Dorling Cartogram Circle Packs

A take on the [Dorling Cartogram](http://mbostock.github.io/protovis/ex/cartogram.html) where each state is a circle pack of its counties. Some potential improvements could be adding state abbreviation labels and transitioning the layout from a Dorling to a small multiples grid ordered either by state name or a quantitative value such as the median broadband subscription rate for the counties in a state.

Continue reading below for the steps taken to create this visualization.
`
                )
            })
        },
        {
            inputs: ["map5"],
            value: (function (map5) {
                return (
                    map5.cloneNode(true)
                )
            })
        },
        {
            name: "legend",
            inputs: ["d3", "DOM", "color"],
            value: (function (d3, DOM, color) {
                const margin = ({ top: 20, left: 10, right: 10, bottom: 15 })
                const width = 500 - margin.left - margin.right;
                const height = 60 - margin.top - margin.bottom;
                const svg = d3.select(DOM.svg(width + margin.left + margin.right, height + margin.top + margin.bottom))
                    .style("max-width", "100%").style("height", "auto");
                const format = d3.format(".1f");
                const xScale = d3.scaleLinear()
                    .range([margin.left, width - margin.right])
                    .domain(d3.extent(color.domain()));

                svg.selectAll("rect")
                    .data(color.range().map(d => color.invertExtent(d)))
                    .enter()
                    .append("rect")
                    .attr("height", 8)
                    .attr("y", margin.top)
                    .attr("x", d => xScale(d[0]))
                    .attr("width", d => xScale(d[1]) - xScale(d[0]))
                    .attr("fill", d => color(d[0]));

                svg.append("text")
                    .attr("class", "caption")
                    .attr("x", xScale.range()[0])
                    .attr("y", 12)
                    .attr("fill", "#000")
                    .attr("text-anchor", "start")
                    .attr("font-weight", "bold")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 12)
                    .text(`Proportion of households with broaband internet subscription`);

                svg.append("g")
                    .attr("transform", `translate(0, ${margin.top})`)
                    .call(d3.axisBottom(xScale)
                        .tickSize(13)
                        .tickFormat(format)
                        .tickValues(color.range().slice(1).map(d => color.invertExtent(d)[0])))
                    .select(".domain")
                    .remove();

                return svg.node()
            }
            )
        },
        {
            inputs: ["md"],
            value: (function (md) {
                return (
                    md`## 1. Basic Map

Start off by creating a basic basemap showing boundaries for the nation and states, rendered from \`us-atlas\` TopoJSON layers. This will provide a starting point to see how the process unfolds.
`
                )
            })
        },
        {
            name: "map1",
            inputs: ["createBaseMap"],
            value: (function (createBaseMap) {
                return (
                    createBaseMap()
                )
            })
        },
        {
            inputs: ["md"],
            value: (function (md) {
                return (
                    md`## 2. Calculate State Centroids

Using d3-geo's geoPath().centroid() method we can get the planar x, y coordinates for the location of each state's center, commonly referred to as a "centroid" in geospatial analysis.
`
                )
            })
        },
        {
            name: "map2",
            inputs: ["createBaseMap", "d3", "states", "NODE"],
            value: (function (createBaseMap, d3, states, NODE) {
                const map = createBaseMap();

                d3.select(map)
                    .append("g")
                    .classed("centroids", true)
                    .selectAll("circle")
                    .data(states.features.map(d => d.properties))
                    .join("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", NODE.MIN_RADIUS)
                    .attr("fill", "blue");

                return map;
            }
            )
        },
        {
            inputs: ["md"],
            value: (function (md) {
                return (
                    md`## 3. Create Packs

Now to create the state packs. This is accomplished by grouping the data by state (see the [\`dataByState\` Map](#dataByState)), then iterating over each group and doing the following:

  1. Use [\`d3.packSiblings\`](https://github.com/d3/d3-hierarchy#packSiblings) to "pack" the state's counties. This assumes each incoming object has an "r" property representing the radius of a circle. \`d3.packSiblings\` assigns each county object "x" and "y" properties representing the circle's position in the pack. Here I'm using the total number of households "with or without internet" to represent radius size, calculated using the [\`radius\` scale function](#radius) below. Optionally as a pre-step, sort the array before passing it to \`d3.packSiblings\` so that circles are more efficiently packed (thanks [Ryan Shackleton](https://observablehq.com/@ryshackleton) for the suggestion!)

  2. Use [\`d3.packEnclose\`](https://github.com/d3/d3-hierarchy#packEnclose) to get the radius of the minimum bounding circle for each state's pack of county circles. We can use this radius for drawing each state pack's outer circle.

  3. Grab the x, y coordinate for each state's centroid from the \`states\` Feature Collection. Centroids were previously calculated when parsing the data from the \`us-atlas\` TopoJSON.

  4. Assign the "nodes", "x", "y", and "r" properties to an Object that is the value of a new ES6 Map, that like the \`dataByStates\` Map is also keyed on "state".
`
                )
            })
        },
        {
            name: "createStatePacks",
            inputs: ["radius", "packSiblings", "packEnclose", "states"],
            value: (function (radius, packSiblings, packEnclose, states) {
                return (
                    (data) => {
                        const statesPacked = new Map();

                        for (let [k, v] of data) {
                            v.sort((a, b) => (b.total_households - a.total_households)); // step 0
                            v = v.map(d => ({ data: d, r: radius(d.total_households) })); // step 1
                            const nodes = packSiblings(v) // step 1
                            const { r } = packEnclose(nodes) // step 2
                            const state = states.features.find(d => d.properties.name === k); // step 3
                            const { x, y } = state.properties; // step 3
                            statesPacked.set(k, { nodes, r, x, y }); // step 4
                        }

                        return statesPacked;
                    }
                )
            })
        },
        {
            inputs: ["md"],
            value: (function (md) {
                return (
                    md`Below is a rendering of each state pack circle, positioned using its centroid coordinates. Notice the overlap between pack circles which will be addressed in the next step:`
                )
            })
        },
        {
            name: "map3",
            inputs: ["createBaseMap", "d3", "createStatePacks", "dataByState"],
            value: (function (createBaseMap, d3, createStatePacks, dataByState) {
                const map = createBaseMap();
                const svg = d3.select(map);
                const statesPacked = createStatePacks(dataByState);

                d3.select(map)
                    .append("g")
                    .classed("centroids", true)
                    .selectAll("circle")
                    .data([...statesPacked])
                    .join("circle")
                    .attr("cx", ([k, d]) => d.x)
                    .attr("cy", ([k, d]) => d.y)
                    .attr("r", ([k, d]) => d.r)
                    .attr("fill", "none")
                    .attr("stroke", "blue")
                    .attr("stroke-width", 1);

                return map;
            }
            )
        },
        {
            inputs: ["md"],
            value: (function (md) {
                return (
                    md`## 4. Apply Collision Detection to State Packs

Using [d3.forceSimulation](https://github.com/d3/d3-force#forceSimulation), we can create a [Dorling Cartogram](http://mbostock.github.io/protovis/ex/cartogram.html) where each state pack position is adjusted using collision detection to prevent overlap between packs. This results in some shift from the pack circle's original centroid position, but does a fairly good job at keeping adjacency between states.
`
                )
            })
        },
        {
            name: "applySimulation",
            inputs: ["d3", "width", "height", "NODE"],
            value: (function (d3, width, height, NODE) {
                return (
                    (nodes) => {
                        const simulation = d3.forceSimulation(nodes)
                            .force("cx", d3.forceX().x(d => width / 2).strength(0.02))
                            .force("cy", d3.forceY().y(d => height / 2).strength(0.02))
                            .force("x", d3.forceX().x(d => d.x).strength(0.3))
                            .force("y", d3.forceY().y(d => d.y).strength(0.3))
                            .force("charge", d3.forceManyBody().strength(-1))
                            .force("collide", d3.forceCollide().radius(d => d.r + NODE.PADDING).strength(1))
                            .stop()

                        while (simulation.alpha() > 0.01) {
                            simulation.tick();
                        }

                        return simulation.nodes();
                    }
                )
            })
        },
        {
            name: "map4",
            inputs: ["createBaseMap", "createStatePacks", "dataByState", "applySimulation", "d3"],
            value: (function (createBaseMap, createStatePacks, dataByState, applySimulation, d3) {
                const map = createBaseMap();
                const statesPacked = createStatePacks(dataByState);
                let values = [...new Map(statesPacked).values()];
                values = applySimulation(values)

                d3.select(map)
                    .append("g")
                    .classed("centroids", true)
                    .selectAll("circle")
                    .data(values)
                    .join("circle")
                    .attr("cx", (d) => d.x)
                    .attr("cy", (d) => d.y)
                    .attr("r", (d) => d.r)
                    .attr("fill", "none")
                    .attr("stroke", "blue")
                    .attr("stroke-width", 1)

                return map;
            }
            )
        },
        {
            inputs: ["md"],
            value: (function (md) {
                return (
                    md`## 5. Draw County Nodes within State Packs

Now that the positions of the state packs have been updated to prevent overlap, their child county nodes may be drawn within. To accomplish this, each pack is rendered inside an SVG "g" element and has a CSS "transform: translate(x, y)" applied to it. This allows for positioning the inner county circles using their own x, y coordinates that were derived using \`d3.packSiblings\` earlier.
`
                )
            })
        },
        {
            name: "map5",
            inputs: ["createBaseMap", "d3", "createStatePacks", "dataByState", "applySimulation", "color", "withBroadbandPct"],
            value: (function (createBaseMap, d3, createStatePacks, dataByState, applySimulation, color, withBroadbandPct) {
                const map = createBaseMap()
                const svg = d3.select(map);
                const statesPacked = createStatePacks(dataByState);
                let values = [...new Map(statesPacked).values()];
                values = applySimulation(values)

                svg.select(".state-boundaries")
                    .attr("stroke", "#fff");

                const statePacks = svg
                    .append("g")
                    .classed("state-packs", true)
                    .selectAll(".state-pack")
                    .data(values)
                    .enter()
                    .append("g")
                    .classed("state-pack", true)
                    .attr("transform", d => `translate(${d.x}, ${d.y})`);

                statePacks
                    .append("circle")
                    .attr("r", d => d.r)
                    .attr("fill", "#e2e2e2")
                    .attr("stroke", "#333");

                const counties = statePacks
                    .selectAll(".county-centroid")
                    .data(d => d.nodes)
                    .enter()
                    .append("circle")
                    .classed("county-centroid", true)
                    .attr("r", d => d.r)
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("fill", d => color(withBroadbandPct(d.data)))

                counties.append("title")
                    .text(d => `${d.data.county}, ${d.data.state}\nTotal Households: ${d.data.total_households.toLocaleString()}\nWith broadband subscription: ${d3.format(".2f")(withBroadbandPct(d.data) * 100)}%`)

                return map;
            }
            )
        },
        {
            inputs: ["md"],
            value: (function (md) {
                return (
                    md` ---
## Helpers & Settings`
                )
            })
        },
        {
            name: "height",
            value: (function () {
                return (
                    625
                )
            })
        },
        {
            name: "NODE",
            value: (function () {
                return (
                    { MIN_RADIUS: 2.5, MAX_RADIUS: 20, PADDING: 2 }
                )
            })
        },
        {
            name: "packSiblings",
            inputs: ["d3"],
            value: (function (d3) {
                return (
                    (values) => d3.packSiblings(values)
                )
            })
        },
        {
            name: "packEnclose",
            inputs: ["d3"],
            value: (function (d3) {
                return (
                    (nodes) => d3.packEnclose(nodes)
                )
            })
        },
        {
            name: "scheme",
            inputs: ["d3"],
            value: (function (d3) {
                return (
                    d3.schemeGnBu
                )
            })
        },
        {
            name: "color",
            inputs: ["d3", "scheme"],
            value: (function (d3, scheme) {
                return (
                    d3.scaleQuantize()
                        .domain([0, 1])
                        .range(scheme[9])
                )
            })
        },
        {
            name: "radius",
            inputs: ["d3", "data", "NODE"],
            value: (function (d3, data, NODE) {
                return (
                    d3.scaleSqrt()
                        .domain(d3.extent(data, d => d.total_households))
                        .range([NODE.MIN_RADIUS, NODE.MAX_RADIUS])
                )
            })
        },
        {
            name: "geoPath",
            inputs: ["d3"],
            value: (function (d3) {
                return (
                    d3.geoPath()
                )
            })
        },
        {
            name: "createBaseMap",
            inputs: ["d3", "height", "stateBoundaries", "geoPath", "nation"],
            value: (function (d3, height, stateBoundaries, geoPath, nation) {
                return (
                    () => {
                        const svg = d3.create("svg")
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

                        return svg.node();
                    }
                )
            })
        },
        {
            name: "withBroadbandPct",
            value: (function () {
                return (
                    d => {
                        return d.with_broadband_subscription / d.total_households;
                    }
                )
            })
        },
        {
            inputs: ["html"],
            value: (function (html) {
                return (
                    html`<style>
svg .county-centroid:hover {
  fill: #333;
}
</style>`
                )
            })
        },
        {
            inputs: ["md"],
            value: (function (md) {
                return (
                    md`## Data Parsing and Transformations

Broadband internet subscription data source: [U.S. Census American Community Survey 2013 – 2017 5 year estimates](https://www.census.gov/newsroom/press-releases/2018/2013-2017-acs-5year.html). The data comes from the table [\`B28002\`](https://api.census.gov/data/2017/acs/acs5/groups/B28002.html) and uses "household" as the unit of measure. Only households that are occupied are included in this data; vacant houses, group quarters, nursing homes, jails are excluded.
`
                )
            })
        },
        {
            name: "dataByState",
            inputs: ["d3", "data"],
            value: (function (d3, data) {
                return (
                    d3.group(data, d => d.state)
                )
            })
        },
        {
            name: "data",
            inputs: ["d3", "parseRow"],
            value: (function (d3, parseRow) {
                return (
                    d3.csv("https://gist.githubusercontent.com/clhenrick/5fe3463586ee196820ac74a62fd0445a/raw/09422f3803f59e5530836b1614774c5a7a9381f3/acs5_2017_internet_access_joined_rural_pct_names.csv", parseRow)
                )
            })
        },
        {
            name: "parseRow",
            value: (function () {
                return (
                    (row) => {
                        for (let key in row) {
                            if (key === "name") {
                                const [county, state] = row.name.split(", ");
                                row.state = state;
                                row.county = county;
                                delete row.name;
                            } else if (key !== "geoid") {
                                row[key] = Number(row[key]);
                            }
                        }
                        return row;
                    }
                )
            })
        },
        {
            name: "nation",
            inputs: ["topojson", "us"],
            value: (function (topojson, us) {
                return (
                    topojson.mesh(us, us.objects.nation)
                )
            })
        },
        {
            name: "states",
            inputs: ["topojson", "us", "geoPath"],
            value: (function (topojson, us, geoPath) {
                const states = topojson.feature(us, us.objects.states);
                states.features.forEach(feature => {
                    const [x, y] = geoPath.centroid(feature)
                    feature.properties = { ...feature.properties, x, y };
                });
                return states;
            }
            )
        },
        {
            name: "stateBoundaries",
            inputs: ["topojson", "us"],
            value: (function (topojson, us) {
                return (
                    topojson.mesh(us, us.objects.states, (a, b) => a !== b)
                )
            })
        },
        {
            name: "counties",
            inputs: ["topojson", "us"],
            value: (function (topojson, us) {
                return (
                    topojson.feature(us, us.objects.counties)
                )
            })
        },
        {
            name: "us",
            inputs: ["d3"],
            value: (function (d3) {
                return (
                    d3.json("https://unpkg.com/us-atlas@2/us/10m.json")
                )
            })
        },
        {
            inputs: ["md"],
            value: (function (md) {
                return (
                    md`## Dependencies`
                )
            })
        },
        {
            name: "topojson",
            inputs: ["require"],
            value: (function (require) {
                return (
                    require("topojson-client@3")
                )
            })
        },
        {
            name: "d3",
            inputs: ["require"],
            value: (function (require) {
                return (
                    require("d3@5", "d3-array@2")
                )
            })
        }
    ]
};

const notebook = {
    id: "c421a57a3d22c60e@409",
    modules: [m0]
};

export default notebook;