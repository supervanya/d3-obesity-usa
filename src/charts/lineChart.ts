import * as d3 from "d3";

interface LineDataPoint {
  year: Date;
  obesity: number;
}

let cachedData: Promise<any> | null = null;

function loadData() {
  if (!cachedData) {
    cachedData = d3.csv("data/obesity_data.csv") as any;
  }
  return cachedData!;
}

function getGraphsForState(state: string, groupName: string, data: any) {
  const grouped = d3.group(
    data,
    (d: any) => d.locationdesc,
    (d: any) => d.category,
    (d: any) => d.category_value,
  );
  return grouped.get(state)?.get(groupName);
}

export function drawLineChart(container: HTMLElement, state: string, groupName: string) {
  container.innerHTML = "";

  const margin = { top: 60, right: 250, bottom: 30, left: 50 };
  const width = 550 - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;

  const parseDate = d3.timeParse("%Y");
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  const line = d3
    .line<LineDataPoint>()
    .x((d) => x(d.year)!)
    .y((d) => y(d.obesity));

  const chartId = state + groupName.replace(" ", "_");

  const svg = d3
    .select(container)
    .append("div")
    .attr("id", chartId)
    .attr("class", "line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  loadData()
    .catch((error) => {
      const div = container.querySelector(`#${CSS.escape(chartId)}`);
      if (div) {
        (div as HTMLElement).innerHTML = `<p style="color: #b00; padding: 16px;">Failed to load line chart data: ${error.message}</p>`;
      }
    })
    .then((_data) => {
      if (!_data) return;
      const stateData = getGraphsForState(state, groupName, _data);
      if (!stateData) return;

      const groupData: Record<string, string[]> = {};
      stateData.forEach((values: any, key: any) => {
        groupData[key] = values.map((value: any) => value.avg_data_value);
      });

      let categories = Object.keys(groupData);
      if (groupName === "Age Group") {
        categories = categories.sort((a, b) => +b.charAt(0) - +a.charAt(0));
      } else {
        categories = categories.sort();
      }
      color.domain(categories);

      const yearsInt = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];
      const years = yearsInt.map((year) => parseDate(year.toString())!);

      const breakoutGroups = color.domain().map(function (name) {
        return {
          name,
          values: years.map(function (year, i) {
            return { year, obesity: +groupData[name][i] };
          }),
        };
      });

      x.domain([years[0], years[years.length - 1]]);
      y.domain([
        d3.min(breakoutGroups, (c) => d3.min(c.values, (v) => v.obesity))!,
        d3.max(breakoutGroups, (c) => d3.max(c.values, (v) => v.obesity))!,
      ]);

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

      const legend = svg
        .selectAll("g.legend")
        .data(breakoutGroups)
        .enter()
        .append("g")
        .attr("class", "legend");

      legend
        .append("rect")
        .attr("x", width + margin.right - 110 - 20)
        .attr("y", (_d, i) => i * 20)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", (d) => color(d.name));

      legend
        .append("text")
        .attr("x", width + margin.right - 110 - 8)
        .attr("y", (_d, i) => i * 20 + 9)
        .text((d) => d.name);

      svg
        .append("g")
        .attr("class", "x-l axis-l")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis as any);

      svg
        .append("g")
        .attr("class", "y-l axis-l")
        .call(yAxis as any)
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
        .attr("d", (d) => line(d.values))
        .style("stroke", (d) => color(d.name));

      city
        .append("text")
        .datum((d) => ({ name: d.name, value: d.values[d.values.length - 1] }))
        .attr("transform", (d) => {
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
        .text((d) => d.name);

      const mouseG = svg.append("g").attr("class", "mouse-over-effects");

      mouseG
        .append("path")
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

      const lines = container.getElementsByClassName(lineClass) as HTMLCollectionOf<SVGPathElement>;

      const mousePerLine = mouseG
        .selectAll(".mouse-per-line")
        .data(breakoutGroups)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

      mousePerLine
        .append("circle")
        .attr("r", 7)
        .style("stroke", (d) => color(d.name))
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

      mousePerLine.append("text").attr("transform", "translate(10,3)");

      mouseG
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mouseout", () => {
          svg.select(`.mouse-line`).style(`opacity`, `0`);
          svg.selectAll(`.mouse-per-line circle`).style(`opacity`, `0`);
          svg.selectAll(`.mouse-per-line text`).style("opacity", "0");
        })
        .on("mouseover", () => {
          svg.select(`.mouse-line`).style(`opacity`, `1`);
          svg.selectAll(`.mouse-per-line circle`).style(`opacity`, `1`);
          svg.selectAll(`.mouse-per-line text`).style("opacity", "1");
        })
        .on("mousemove", function (event) {
          const mouse = d3.pointer(event);
          svg.select(`.mouse-line`).attr("d", () => `M${mouse[0]},${height} ${mouse[0]},0`);

          svg.selectAll(`.mouse-per-line`).attr("transform", function (this: any, d: any, i) {
            const xDate = x.invert(mouse[0]);
            const bisect = d3.bisector((p: any) => p.year).right;
            bisect(d.values, xDate);

            let beginning = 0;
            let end = lines[i]?.getTotalLength() ?? 0;
            let pos: any;

            while (true) {
              const target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                break;
              }
              if (pos.x > mouse[0]) end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break;
            }

            d3.select(this)
              .select("text")
              .text(y.invert(pos.y).toFixed(2) + "%");

            return `translate(${mouse[0]},${pos.y})`;
          });
        });
    });
}
