"use strict";

import data from './us_stats.js';

const dataArray = Object.values(data)
const maxObese = d3.max(dataArray, d => d.obese[0])
const minObesity = d3.min(dataArray, d => d.obese[0])
const maxLand = d3.max(dataArray, d => d.land)
const maxPop = d3.max(dataArray, d => d3.max(d.pop))
console.log(maxObese, minObesity)
const height = 400
const width = 800

const container = d3.select('#d3-cartogram')
const svg = container.append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr('fill', 'red')
console.log(dataArray)


svg.append('g')
    .selectAll("circle")
    .data(dataArray)
    .enter()
    .append('circle')
    .attr('cx', d => (d.obese[0] - minObesity) * (width / (maxObese - minObesity)))
    .attr('cy', d => (d.pop[0]) * (height / maxPop))
    .attr('r', d => (d.land) * (50 / maxLand))


