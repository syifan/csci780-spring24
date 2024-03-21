import * as d3 from "d3";

main();

async function main() {
  const data = await getData();
  const filteredData = processData(data);
  render(filteredData);
}

async function getData() {
  const data = await d3.csv("data.csv");
  console.log(data);

  return data;
}

function processData(data) {
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

    if (d["Release Date"] === "") {
      return false;
    }

    return true;
  });

  return filteredData;
}

function render(data) {
  const canvas = d3.select("svg");
  console.log(canvas);

  const canvasWidth = 800;
  const canvasHeight = 600;
  const paddingLeft = 60;
  const paddingBottom = 60;
  const paddingTop = 20;
  const paddingRight = 20;

  const xScale = d3
    .scaleLog()
    .domain([10, 20000])
    .range([paddingLeft, canvasWidth - paddingRight]);

  const yScale = d3
    .scaleLinear()
    .domain([50, 600])
    .range([canvasHeight - paddingBottom, paddingTop]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  canvas
    .append("g")
    .selectAll("circle")
    .data(data)
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

  canvas
    .append("text")
    .text("Transistors (million)")
    .attr("x", 400)
    .attr("y", canvasHeight - 10)
    .attr("text-anchor", "middle");

  canvas
    .append("text")
    .text("Die Size (mm^2)")
    .attr("x", 10)
    .attr("y", canvasHeight / 2)
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90 10 ${canvasHeight / 2}) translate(0, 10)`);
}

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
