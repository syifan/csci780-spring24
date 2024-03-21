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

  return true;
});

const yearToGPUMap = {};
const yearToTransistorMap = {};
filteredData.forEach((d) => {
  if (d["Type"] !== "GPU") {
    return;
  }

  const date = new Date(d["Release Date"]);
  const year = date.getFullYear();
  if (year === 0 || isNaN(year)) {
    return;
  }

  if (yearToGPUMap[year] === undefined) {
    yearToGPUMap[year] = 0;
    yearToTransistorMap[year] = 0;
  }

  yearToGPUMap[year]++;
  yearToTransistorMap[year] += Number(d["Transistors (million)"]);
});

const avgTransistorsPerYear = [];
for (const year in yearToGPUMap) {
  avgTransistorsPerYear.push({
    year: year,
    avgTransistors: yearToTransistorMap[year] / yearToGPUMap[year],
  });
}
avgTransistorsPerYear.sort((a, b) => a.year - b.year);

console.log(avgTransistorsPerYear);

// const canvas = d3.select("svg");

// const xScale = d3
//   .scaleLinear()
//   .domain([1999, 2024])
//   .range([60, 800 - 20]);
// const yScale = d3
//   .scaleLinear()
//   .domain([0, 50000])
//   .range([800 - 60, 20]);

// canvas
//   .append("g")
//   .append("path")
//   .datum(avgTransistorsPerYear)
//   .attr("fill", "none")
//   .attr("stroke", "steelblue")
//   .attr("stroke-width", 1.5)
//   .attr(
//     "d",
//     d3
//       .line()
//       .x((d) => xScale(Number(d.year)))
//       .y((d) => yScale(d.avgTransistors))
//   );

// canvas
//   .append("g")
//   .selectAll("circle")
//   .data(avgTransistorsPerYear)
//   .enter()
//   .append("circle")
//   .attr("r", 5)
//   .attr("cx", (d) => xScale(Number(d.year)))
//   .attr("cy", (d) => yScale(d.avgTransistors))
//   .attr("fill", "steelblue");

// canvas
//   .append("text")
//   .text("Year")
//   .attr("x", 400)
//   .attr("y", 800 - 10);

// Bar chart
const canvas2 = d3.select("svg");
const xScale2 = d3
  .scaleBand()
  .domain(avgTransistorsPerYear.map((d) => d.year))
  .range([60, 800 - 20])
  .padding(0.1);

const yScale2 = d3
  .scaleLinear()
  .domain([0, 50000])
  .range([800 - 60, 20]);

canvas2
  .append("g")
  .selectAll("rect")
  .data(avgTransistorsPerYear)
  .enter()
  .append("rect")
  .attr("x", (d) => xScale2(d.year))
  .attr("y", (d) => yScale2(d.avgTransistors))
  .attr("width", xScale2.bandwidth())
  .attr("height", (d) => 800 - 60 - yScale2(d.avgTransistors))
  .attr("fill", "steelblue");
