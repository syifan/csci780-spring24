import * as d3 from "d3";

const data = await d3.csv("data.csv");
console.log(data);

const canvas = d3.select("svg");
console.log(canvas);

canvas
  .selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("r", 5)
  .attr("cx", (d) => {
    const trans = Number(d["Transistors (million)"]);
    return ((800 - 0) / (1000 - 0)) * trans;
  })
  .attr("cy", (d) => {
    const dieSize = Number(d["Die Size (mm^2)"]);
    return ((800 - 0) / (1000 - 0)) * dieSize;
  })
  .attr("fill", (d) => {
    if (d["Foundry"] === "TSMC") {
      return "red";
    } else {
      return "blue";
    }
  })
  .attr("opacity", "0.1");

// for (let i = 0; i < 100; i++) {
//   canvas
//     .append("circle")
//     .attr("cx", 100 + 1 * i)
//     .attr("cy", 100 + 1 * i)
//     .attr("r", 100)
//     .attr("fill", "red")
//     .attr("stroke", "black");
// }
// canvas
//   .append("circle")
//   .attr("cx", 50)
//   .attr("cy", 50)
//   .attr("r", 50)
//   .attr("fill", "red");

// canvas
//   .append("text")
//   .attr("x", 50)
//   .attr("y", 50)
//   .text("Hello World")
//   .attr("fill", "white");
