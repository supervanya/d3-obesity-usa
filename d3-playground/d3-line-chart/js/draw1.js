var data = []; // the variable that holds the data from csv file
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
    loadData();
});


function loadData() {
    //code for Q1 goes here
    d3.csv("data/data.csv", (d) => {
        data = d;
        data.forEach((item) => {
            item.n = parseInt(item.n);
        })
        visualizeBarChart(groupDataByYear());
    })
}

function groupDataByCategory() {
    //code for Q2 goes here
    var groupedData = d3.nest()
        .key((d) => d.category)
        .entries(data);
    return groupedData;
}

function groupDataByYear() {
    //code for Q3.1 goes here
    var groupedData = d3.nest()
        .key((d) => d.year)
        .rollup((v) => d3.sum(v, (d) => d.n))
        .entries(data);
    return groupedData;
}

function groupDataByYearMean() {
    //code for Q3.2 goes here
}


function visualizeBarChart(dataitems) {
    var margin = {top:20, right: 20, bottom:30, left:60}
    var width = 940 - margin.left - margin.right
    var height = 500 - margin.top - margin.bottom

    var x = d3.scaleBand()
        .domain(dataitems.map((d) => d.key))
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([0, d3.max(dataitems, (d) => d.value)])
        .range([height, 0]);

    var svg = d3.select("#chart1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 
    // code for Q4 goes here

    // code for Q5 goes here

    // code for Q6 goes here

    // code for Q7 goes here

    // code for Q8 goes here
    svg.selectAll(".bar")
        .data(dataitems)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("fill", "#E0D22E")
        .attr("x", (d) => x(d.key))
        .attr("width", x.bandwidth())
        .attr("y", (d) => y(d.value))
        .attr("height", (d) => height - y(d.value));

    // code for Q9 goes here
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));
}

function visualizeSmallMultipleBarChart(dataitems) {

	// code for Q13 goes here

	// code for Q14.1 goes here

	// code for Q14.2 goes here

	// code for Q15 goes here
	
	   // code for Q16 goes here
	   
	   // code for Q17 goes here

	   // code for Q18 goes here

	   // code for Q19 goes here

	   // code for Q20 goes here

	   // code for Q21 goes here
}


// CODE FOR SECTION 2 GOES HERE
// see instructions

// set the dimensions and margins of the graph
var c_margin = { top: 20, right: 20, bottom: 30, left: 60 }
var c_width = 940 - c_margin.left - c_margin.right;
var c_height = 500 - c_margin.top - c_margin.bottom;

function visualizeOneCategoryChart(dataitems) {	
	// create and draw chart (DONT CHANGE)
	createOneCategoryChart(dataitems)
	drawOneCategoryChart(dataitems)
}

function createOneCategoryChart(dataitems) {	
    // append an svg and g element to the #chart3 element

}

function drawOneCategoryChart(dataitems) {	
	// select the already-created svg group element (DONT CHANGE)
	var svg = d3.select("#chart3 > svg > g")

	// set the title of the chart (the h6 element in the #chart3 element)
	// to the name of this category
	
    // create an x axis scale

    // create a y axis scale

	// create / update the bars

    // add the x Axis

    // add the y Axis
}


