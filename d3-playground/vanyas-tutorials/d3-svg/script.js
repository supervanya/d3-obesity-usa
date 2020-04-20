// import * as d3 from "d3";

const svg = d3.select("svg");


function* range(start, end) {
    yield start;
    if (start === end) return;
    yield* range(start + 1, end);
}

let x = 0;
let y = 0;
const size = 15;
const margin = 1;

// D3 API
for (const i of range(1, 1534)) {
    if (x > 935) {
        x = 0;
        y += size + margin;
    }
    svg
        .append("rect")
        .attr("class", "click-me")
        .attr("fill", "#21211f")
        .attr("x", x)
        .attr("width", size + margin)
        .attr("height", size + margin)
        .attr("y", y);
    x += margin + size;
}

// DOM API
var clickMes = document.querySelectorAll(".click-me");
for (const clickMe of clickMes) {
    clickMe.onclick = function () {
        if (this.style.fill === "red") {
            this.style.fill = "black";
        } else {
            this.style.fill = "red";
        }
    };
}


const squares = d3.selectAll(".click-me");

squares.transition()
    .duration(1000)
    .attr('fill', 'black')

squares
    .on('mouseover', function (d, i) {
        d3.select(this)
            .transition()
            .duration(500)
            .attr('fill', 'yellow')
    })
    .on("mouseleave", function () {
        d3.select(this)
            .transition()
            .delay(500)
            .duration(200)
            .attr('fill', "#21211f")

    });

