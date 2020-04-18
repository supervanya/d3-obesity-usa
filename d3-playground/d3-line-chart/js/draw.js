data = [];

var category_colors = {
    "clothing, beauty, & fashion": "#5B7BE9",
    "computers & internet": "#E0D22E",
    "education": "#2CCEF6",
    "food & drink": "#FB7F23",
    "grab bag": "#D63CA3",
    "health & fitness": "#c38014",
    "home & garden": "#E24062",
    "human relations": "#5BB923",
    "law & government": "#555",
    "media & arts": "#B190D0",
    "pets & animals": "#bcc832",
    "religion & philosophy": "#ee7b9c",
    "science & nature": "#f299b3",
    "shopping": "#01d99f",
    "society & culture": "#177d62",
    "sports, hobbies, & recreation": "#a16c2f",
    "technology": "#a2262a",
    "travel & transportation": "#f29a76",
    "work & money": "#88a8b9",
    "writing & language": "#a46067"
}; // JSON object with colors assigned to each category.

$(document).ready(function () {
    main();
});


function loadData() {
    d3.csv("data/obesity_data.csv", (d) => {
        data = d;
    })
    return groupAllData(data);
}

function getGraphsForState(state){
      groupedData = loadData();
      groupedData.forEach(function(by_state, i) { 
            if (by_state.key == state){
                  stateData = by_state.values;
                  stateData.forEach(function(by_category, i){
                        getGraphForCategory(by_category.key, by_category.values);
                  });
            };
      });
};

function getGraphForCategory(category, categoryData){
      console.log(category, categoryData)
      visualizeMultiLineChart(categoryData)
}

function main() {
      getGraphsForState("Texas");
}


function groupAllData(data) {
      var groupedData = d3.nest()
            .key(function(d) { return d.locationdesc; })
            .key(function(d) { return d.category; })
            .key(function(d) { return d.category_value; })
            .entries(data);
      return groupedData;
}


function visualizeMultiLineChart(dataitems) {
      var margin = {top:20, right: 20, bottom:30, left:60}
      var width = 940 - margin.left - margin.right
      var height = 500 - margin.top - margin.bottom
      var dates = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018]

      var x = d3.scaleUtc()
            .domain(d3.extent(dates))
            .range([margin.left, width - margin.right])

      var y = d3.scaleLinear()
        .domain([0, d3.max(dataitems, (d) => d3.max(d.values))]).nice()
        .range([height - margin.bottom, margin.top]);


      var xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

      
      var yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
                  .attr("x", 3)
                  .attr("text-anchor", "start")
                  .attr("font-weight", "bold")
                  .text(data.y))

      console.log (x, y, xAxis, yAxis)

      line = d3.line()
            .defined(d => !isNaN(d))
            .x((d, i) => x(dates[i]))
            .y(d => y(d))
            

      d3 = require("d3@5", "d3-array@2")

      const svg = d3.create("svg")
            .attr("viewBox", [0, 0, width, height])
            .style("overflow", "visible");
      
      svg.append("g")
            .call(xAxis);
      
      svg.append("g")
            .call(yAxis);
      
      const path = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .selectAll("path")
            .data(data.series)
            .join("path")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => line(d.values));
      

      var svg = d3.select("#chart1").append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      svg.selectAll(".bar")
            .data(dataitems)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("fill", "#E0D22E")
            .attr("x", (d) => x(d.year))
            .attr("width", x.bandwidth())
            .attr("y", (d) => y(d.avg_data_value))
            .attr("height", (d) => height - y(d.avg_data_value));

      // code for Q9 goes here
      svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

      svg.append("g")
            .call(d3.axisLeft(y));
}