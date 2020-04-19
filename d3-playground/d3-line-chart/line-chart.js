function getGraphsForState(state, groupName, data) {
    const groupedData = groupAllData(data)
    const stateData = groupedData.find(stateData => stateData.key === state)
    const stateGroupData = stateData['values'].find(stateData => stateData.key === groupName)
    return stateGroupData.values
};

function groupAllData(data) {
    var groupedData = d3.nest()
        .key(function (d) { return d.locationdesc; })
        .key(function (d) { return d.category; })
        .key(function (d) { return d.category_value; })
        .entries(data);
    return groupedData;
}

function drawGraph(state, groupName) {
    var margin = {
        top: 60,
        right: 200,
        bottom: 30,
        left: 50
    },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            return y(d.temperature);
        });

    const chartId = groupName.replace(" ", "_")

    var svg = d3.select("body")
        .append('div')
        .attr('id', chartId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    d3.csv('./data/obesity_data.csv', _data => {
        // console.log('our obesity data:', _data)
        // const state = 'Texas'
        // const groupName = 'Age Group'
        const stateData = getGraphsForState(state, groupName, _data)

        let groupData = {}
        // groupData = [
        //     {'18-24':[13, 13, 23, 43]},
        //     {'24-30':[13, 13, 23, 43]},
        //         ...
        // ]

        // groupData = {
        //     '18-24':[13, 13, 23, 43],
        //     '24-30':[13, 13, 23, 43],
        //         ...
        // }
        stateData.forEach(category => {
            const values = category.values.map(value => value.avg_data_value)
            const key = category.key
            groupData[key] = values
        })



        let categories = d3.keys(groupData)
        if (groupName === 'Age Group') {
            categories = categories.sort((a, b) => b.charAt(0) - a.charAt(0))
        } else {
            categories = categories.sort()
        }
        color.domain(categories);


        const yearsInt = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018]
        const years = yearsInt.map(year => parseDate(year.toString()));

        var cities = color.domain().map(
            function (name) {
                return {
                    name: name,
                    values: years.map(function (year, i) {
                        return {
                            date: year,
                            temperature: +groupData[name][i]
                        };
                    })
                };
            });

        x.domain([years[0], years[years.length - 1]]);
        y.domain([
            d3.min(cities, function (c) {
                return d3.min(c.values, function (v) {
                    return v.temperature;
                });
            }),
            d3.max(cities, function (c) {
                return d3.max(c.values, function (v) {
                    return v.temperature;
                });
            })
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


        var legend = svg.selectAll('g')
            .data(cities)
            .enter()
            .append('g')
            .attr('class', 'legend');

        legend.append('rect')
            .attr('x', width + margin.right - 80 - 20)
            .attr('y', function (d, i) {
                return i * 20;
            })
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', function (d) {
                return color(d.name);
            });

        legend.append('text')
            .attr('x', width + margin.right - 80 - 8)
            .attr('y', function (d, i) {
                return (i * 20) + 9;
            })
            .text(function (d) {
                return d.name;
            });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Obesity Prevalence (%)");

        var city = svg.selectAll(".city")
            .data(cities)
            .enter().append("g")
            .attr("class", "city");

        city.append("path")
            .attr("class", "line")
            .attr("d", function (d) {
                return line(d.values);
            })
            .style("stroke", function (d) {
                return color(d.name);
            });

        city.append("text")
            .datum(function (d) {
                return {
                    name: d.name,
                    value: d.values[d.values.length - 1]
                };
            })
            .attr("transform", function (d) {
                return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
            })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function (d) {
                return d.name;
            });

        var mouseG = svg.append("g")
            .attr("class", "mouse-over-effects");

        mouseG.append("path") // this is the black vertical line to follow mouse
            .attr("class", "mouse-line")
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        var lines = document.getElementsByClassName('line');

        var mousePerLine = mouseG.selectAll('.mouse-per-line')
            .data(cities)
            .enter()
            .append("g")
            .attr("class", "mouse-per-line");

        mousePerLine.append("circle")
            .attr("r", 7)
            .style("stroke", function (d) {
                return color(d.name);
            })
            .style("fill", "none")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        mousePerLine.append("text")
            .attr("transform", "translate(10,3)");

        mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
            .attr('width', width) // can't catch mouse events on a g element
            .attr('height', height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mouseout', function () { // on mouse out hide line, circles and text
                svg.select(`.mouse-line`)
                    .style(`opacity`, `0`);
                svg.selectAll(`.mouse-per-line circle`)
                    .style(`opacity`, `0`);
                svg.selectAll(`.mouse-per-line text`)
                    .style("opacity", "0");
            })
            .on('mouseover', function () { // on mouse in show line, circles and text
                svg.select(`.mouse-line`)
                    .style(`opacity`, `1`);
                svg.selectAll(`.mouse-per-line circle`)
                    .style(`opacity`, `1`);
                svg.selectAll(`.mouse-per-line text`)
                    .style("opacity", "1");
            })
            .on('mousemove', function () { // mouse moving over canvas
                var mouse = d3.mouse(this);
                svg.select(`.mouse-line`)
                    .attr("d", function () {
                        var d = "M" + mouse[0] + "," + height;
                        d += " " + mouse[0] + "," + 0;
                        return d;
                    });

                svg.selectAll(`.mouse-per-line`)
                    .attr("transform", function (d, i) {
                        // console.log(width / mouse[0])
                        var xDate = x.invert(mouse[0]),
                            bisect = d3.bisector(function (d) { return d.date; }).right;
                        idx = bisect(d.values, xDate);

                        var beginning = 0,
                            end = lines[i].getTotalLength(),
                            target = null;

                        while (true) {
                            target = Math.floor((beginning + end) / 2);
                            pos = lines[i].getPointAtLength(target);
                            if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                                break;
                            }
                            if (pos.x > mouse[0]) end = target;
                            else if (pos.x < mouse[0]) beginning = target;
                            else break; //position found
                        }

                        d3.select(this).select('text')
                            .text(y.invert(pos.y).toFixed(2) + "%");

                        return "translate(" + mouse[0] + "," + pos.y + ")";
                    });
            });
    });
}
