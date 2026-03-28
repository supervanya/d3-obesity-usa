import * as d3 from "d3";
import type { ObesityRecord } from "./types.ts";

interface LineDataPoint {
  year: Date;
  obesity: number;
}

let cachedData = null;

function loadData() {
  if (!cachedData) {
    cachedData = d3.csv("data/obesity_data.csv");
  }
  return cachedData;
}

function getGraphsForState(state, groupName, data) {
  const groupedData = groupAllData(data);
  const stateData = groupedData.find((stateData) => stateData.key === state);
  const stateGroupData = stateData["values"].find((stateData) => stateData.key === groupName);
  return stateGroupData.values;
}

function groupAllData(data) {
  const groupedData = d3
    .nest<ObesityRecord>()
    .key(function (d) {
      return d.locationdesc;
    })
    .key(function (d) {
      return d.category;
    })
    .key(function (d) {
      return d.category_value;
    })
    .entries(data);
  return groupedData;
}

function drawLineChart(state, groupName) {
  const margin = {
      top: 60,
      right: 250,
      bottom: 30,
      left: 50,
    },
    width = 550 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

  // date parser to turn '2008' -> 'Tue Jan 01 2008 00:00:00 GMT-0500 (Eastern Standard Time)'
  const parseDate = d3.timeParse("%Y");

  const x = d3.scaleTime().range([0, width]);

  const y = d3.scaleLinear().range([height, 0]);

  // this is the color scale. More info: https://github.com/d3/d3-scale-chromatic
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const xAxis = d3.axisBottom(x as any);

  const yAxis = d3.axisLeft(y as any);

  // this is a function to generate a line from coordinates
  const line = d3
    .line<LineDataPoint>()
    .x((d) => x(d.year))
    .y((d) => y(d.obesity));
  /**
   * If you'd like to add interpolation(smoothing)
   * you can use the following methods:
   *    .curve(d3.curveBasis)
   *    .curve(d3.curveCatmullRomOpen)
   */

  // this is the unique id for selected chart, for example: "Michigan_Age_Group"
  const chartId = state + groupName.replace(" ", "_");

  // crating the svg element that the line chart will attach to
  const svg = d3
    .select("body")
    .append("div")
    .attr("id", chartId)
    .attr("class", "line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // reading the CSV (cached after first load)
  loadData()
    .catch((error) => {
      const lineChartDiv = document.getElementById(chartId);
      if (lineChartDiv) {
        lineChartDiv.innerHTML = `<p style="color: #b00; padding: 16px;">Failed to load line chart data: ${error.message}</p>`;
      }
    })
    .then((_data) => {
      if (!_data) return;
      const stateData = getGraphsForState(state, groupName, _data);

    const groupData = {};
    stateData.forEach((category) => {
      const values = category.values.map((value) => value.avg_data_value);
      const key = category.key;
      groupData[key] = values;
    });

    let categories = d3.keys(groupData);
    if (groupName === "Age Group") {
      categories = categories.sort((a, b) => +b.charAt(0) - +a.charAt(0));
    } else {
      categories = categories.sort();
    }
    color.domain(categories);

    const yearsInt = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];
    const years = yearsInt.map((year) => parseDate(year.toString()));

    const breakoutGroups = color.domain().map(function (name) {
      return {
        name: name,
        values: years.map(function (year, i) {
          return {
            year: year,
            obesity: +groupData[name][i],
          };
        }),
      };
    });

    x.domain([years[0], years[years.length - 1]]);
    y.domain([
      d3.min(breakoutGroups, function (c) {
        return d3.min(c.values, function (v) {
          return v.obesity;
        });
      }),
      d3.max(breakoutGroups, function (c) {
        return d3.max(c.values, function (v) {
          return v.obesity;
        });
      }),
    ]);

    // Draw header.
    const header = svg
      .append("g")
      .attr("class", "bar-header")
      .attr("transform", `translate(0,${-margin.top * 0.6})`)
      .append("text");

    header.append("tspan").text(`Obesity Prevalence in ${state}, by ${groupName}`);

    header
      .append("tspan")
      .attr("x", 0)
      .attr("dy", "1.5em")
      .style("font-size", "0.8em")
      .style("fill", "#555")
      .text(`United States, ${yearsInt[0]}-${yearsInt[yearsInt.length - 1]}`);

    const legend = svg.selectAll("g.legend").data(breakoutGroups).enter().append("g").attr("class", "legend");

    legend
      .append("rect")
      .attr("x", width + margin.right - 110 - 20)
      .attr("y", function (d, i) {
        return i * 20;
      })
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", function (d) {
        return color(d.name);
      });

    legend
      .append("text")
      .attr("x", width + margin.right - 110 - 8)
      .attr("y", function (d, i) {
        return i * 20 + 9;
      })
      .text(function (d) {
        return d.name;
      });

    svg
      .append("g")
      .attr("class", "x-l axis-l")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "y-l axis-l")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Obesity Prevalence (%)");

    const city = svg.selectAll(".city").data(breakoutGroups).enter().append("g").attr("class", "city");

    const lineClass = `${chartId}mouse-line line`;

    city
      .append("path")
      .attr("class", lineClass)
      .attr("d", function (d) {
        return line(d.values);
      })
      .style("stroke", function (d) {
        return color(d.name);
      });

    city
      .append("text")
      .datum(function (d) {
        return {
          name: d.name,
          value: d.values[d.values.length - 1],
        };
      })
      .attr("transform", function (d) {
        let xPos = x(d.value.year);
        let yPos = y(d.value.obesity);
        if (isNaN(yPos)) {
          xPos = -10000;
          yPos = -10000;
        }
        return "translate(" + xPos + "," + yPos + ")";
      })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function (d) {
        return d.name;
      });

    const mouseG = svg.append("g").attr("class", "mouse-over-effects");

    mouseG
      .append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    const lines = document.getElementsByClassName(lineClass);

    const mousePerLine = mouseG
      .selectAll(".mouse-per-line")
      .data(breakoutGroups)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine
      .append("circle")
      .attr("r", 7)
      .style("stroke", function (d) {
        return color(d.name);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text").attr("transform", "translate(10,3)");

    mouseG
      .append("svg:rect") // append a rect to catch mouse movements on canvas
      .attr("width", width) // can't catch mouse events on a g element
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseout", function () {
        // on mouse out hide line, circles and text
        svg.select(`.mouse-line`).style(`opacity`, `0`);
        svg.selectAll(`.mouse-per-line circle`).style(`opacity`, `0`);
        svg.selectAll(`.mouse-per-line text`).style("opacity", "0");
      })
      .on("mouseover", function () {
        // on mouse in show line, circles and text
        svg.select(`.mouse-line`).style(`opacity`, `1`);
        svg.selectAll(`.mouse-per-line circle`).style(`opacity`, `1`);
        svg.selectAll(`.mouse-per-line text`).style("opacity", "1");
      })
      .on("mousemove", function () {
        // mouse moving over canvas
        const mouse = d3.mouse(this as SVGRectElement);
        svg.select(`.mouse-line`).attr("d", function () {
          let d = "M" + mouse[0] + "," + height;
          d += " " + mouse[0] + "," + 0;
          return d;
        });

        svg.selectAll(`.mouse-per-line`).attr("transform", function (d: any, i) {
          const xDate = x.invert(mouse[0]),
            bisect = d3.bisector(function (d: any) {
              return d.year;
            }).right;
          bisect(d.values, xDate);

          let beginning = 0,
            end = (lines[i] as SVGPathElement).getTotalLength();
          let pos: SVGPoint;

          while (true) {
            const target = Math.floor((beginning + end) / 2);
            pos = (lines[i] as SVGPathElement).getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== mouse[0]) {
              break;
            }
            if (pos.x > mouse[0]) end = target;
            else if (pos.x < mouse[0]) beginning = target;
            else break; //position found
          }

          d3.select(this)
            .select("text")
            .text(y.invert(pos.y).toFixed(2) + "%");

          return "translate(" + mouse[0] + "," + pos.y + ")";
        });
      });
  });
}

export default drawLineChart;
