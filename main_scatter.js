import * as d3 from "d3";

const data = await d3.csv("data.csv");
console.log(data);

const filteredData = data.filter((d) => {
  const trans = Number(d["Transistors (million)"]);
  if (isNaN(trans)) {
    return false;
  }

  if (trans <= 0) {
    return false;
  }

  const dieSize = Number(d["Die Size (mm^2)"]);
  if (isNaN(dieSize)) {
    return false;
  }

  if (dieSize <= 0) {
    return false;
  }

  if (d["Foundry"] !== "TSMC") {
    return false;
  }

  // if (d["Process Size (nm)"] === "7" || d["Process Size (nm)"] === "4") {
  //   return true;
  // }

  return true;
});

const canvas = d3.select("svg");
console.log(canvas);

const canvasWidth = 800;
const canvasHeight = 800;
const paddingLeft = 60;
const paddingBottom = 60;
const paddingTop = 20;
const paddingRight = 20;

const xScale = d3
  .scaleLinear()
  .domain([1, 20000])
  .range([paddingLeft, canvasWidth - paddingRight]);

const yScale = d3
  .scaleLinear()
  .domain([1, 600])
  .range([canvasHeight - paddingBottom, paddingTop]);

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

canvas
  .append("g")
  .selectAll("circle")
  .data(filteredData)
  .enter()
  .append("circle")
  .attr("r", 5)
  .attr("cx", (d) => {
    const trans = Number(d["Transistors (million)"]);
    return xScale(trans);
  })
  .attr("cy", (d) => {
    const dieSize = Number(d["Die Size (mm^2)"]);
    return yScale(dieSize);
  })
  .attr("fill", (d) => {
    return colorScale(d["Process Size (nm)"]);
  })
  .attr("opacity", "0.1");

const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

canvas
  .append("g")
  .attr("transform", `translate(0, ${canvasHeight - paddingBottom})`)
  .call(xAxis);
canvas
  .append("g")
  .attr("transform", `translate(${paddingLeft}, 0)`)
  .call(yAxis);

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
