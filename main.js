import * as d3 from "d3";

let canvas = d3.select("svg");
const canvasWidth = 800;
const canvasHeight = 600;
const paddingLeft = 60;
const paddingBottom = 60;
const paddingTop = 20;
const paddingRight = 20;

let data = [];

const processSizes = [4, 5, 7, 10, 12, 14, 28, 40, 60, 90, 130, 180];

main();

async function main() {
  data = await getData();
  let filteredData = processData(data);

  document.getElementById("release-date-btn").addEventListener("click", () => {
    render(filteredData, "Release Date");
  });

  document.getElementById("transistor-btn").addEventListener("click", () => {
    render(filteredData, "Transistors (million)");
  });

  document.getElementById("btn-4nm").addEventListener("click", () => {
    toggleProcessSize(4);
  });

  document.getElementById("btn-5nm").addEventListener("click", () => {
    toggleProcessSize(5);
  });

  document.getElementById("btn-7nm").addEventListener("click", () => {
    toggleProcessSize(7);
  });

  document.getElementById("btn-10nm").addEventListener("click", () => {
    toggleProcessSize(10);
  });

  document.getElementById("btn-12nm").addEventListener("click", () => {
    toggleProcessSize(12);
  });

  render(filteredData, "Release Date");
}

function toggleProcessSize(processSize) {
  if (processSizes.includes(processSize)) {
    processSizes.splice(processSizes.indexOf(processSize), 1);
  } else {
    processSizes.push(processSize);
  }

  const filteredData = processData(data);
  render(filteredData, "Release Date");
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

    if (d["Process Size (nm)"] === "") {
      return false;
    }

    if (!processSizes.includes(Number(d["Process Size (nm)"]))) {
      return false;
    }

    return true;
  });

  return filteredData;
}

function render(data, xAxisName) {
  let xScale = undefined;
  if (xAxisName === "Transistors (million)") {
    xScale = d3
      .scaleLog()
      .domain([10, 20000])
      .range([paddingLeft, canvasWidth - paddingRight]);
  } else if (xAxisName === "Release Date") {
    xScale = d3
      .scaleTime()
      .domain([new Date("1999-01-01"), new Date("2024-01-01")])
      .range([paddingLeft, canvasWidth - paddingRight]);
  }

  const yScale = d3
    .scaleLinear()
    .domain([50, 600])
    .range([canvasHeight - paddingBottom, paddingTop]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  let circleGroup = canvas.select("#circle-group");
  if (circleGroup.empty()) {
    circleGroup = canvas.append("g").attr("id", "circle-group");
  }

  circleGroup
    .selectAll("circle")
    .data(data, (d) => d["Product"])
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("r", 5)
          .attr("cx", () => paddingLeft)
          .attr("cy", (d) => {
            const dieSize = Number(d["Die Size (mm^2)"]);
            return yScale(dieSize);
          })
          .attr("fill", (d) => {
            return colorScale(d["Process Size (nm)"]);
          })
          .attr("opacity", "0.1")
          .on("mouseover", showTooltip)
          .on("mousemove", showTooltip)
          .on("mouseout", hideTooltip),
      (update) => update,
      (exit) => exit.remove()
    )
    .transition()
    .duration(1000)
    // .ease(d3.easeBounceInOut)
    .attr("r", 5)
    .attr("cx", (d) => {
      if (xAxisName === "Release Date") {
        const date = new Date(d["Release Date"]);
        return xScale(date);
      } else if (xAxisName === "Transistors (million)") {
        const trans = Number(d["Transistors (million)"]);
        return xScale(trans);
      }
    })
    .attr("cy", (d) => {
      const dieSize = Number(d["Die Size (mm^2)"]);
      return yScale(dieSize);
    })
    .attr("fill", (d) => {
      return colorScale(d["Process Size (nm)"]);
    })
    .attr("opacity", "0.1");

  drawAxis(canvas, xScale, yScale, xAxisName);

  let zoom = d3.zoom().on("zoom", (event) => {
    console.log(event.transform);

    const newXScale = event.transform.rescaleX(xScale);
    const newYScale = event.transform.rescaleY(yScale);
    drawAxis(canvas, newXScale, newYScale, xAxisName);

    circleGroup
      .selectAll("circle")
      .attr("cx", (d) => {
        if (xAxisName === "Release Date") {
          const date = new Date(d["Release Date"]);
          return newXScale(date);
        } else if (xAxisName === "Transistors (million)") {
          const trans = Number(d["Transistors (million)"]);
          return newXScale(trans);
        }
      })
      .attr("cy", (d) => {
        const dieSize = Number(d["Die Size (mm^2)"]);
        return newYScale(dieSize);
      });
  });

  canvas.call(zoom);
}

function drawAxis(canvas, xScale, yScale, xAxisName) {
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  let xAxisGroup = canvas.select("#x-axis");
  if (xAxisGroup.empty()) {
    xAxisGroup = canvas.append("g").attr("id", "x-axis");
  }

  let yAxisGroup = canvas.select("#y-axis");
  if (yAxisGroup.empty()) {
    yAxisGroup = canvas.append("g").attr("id", "y-axis");
  }

  xAxisGroup
    .attr("transform", `translate(0, ${canvasHeight - paddingBottom})`)
    .call(xAxis);

  yAxisGroup.attr("transform", `translate(${paddingLeft}, 0)`).call(yAxis);

  let xLabel = canvas.select("#x-label");
  if (xLabel.empty()) {
    xLabel = canvas.append("text").attr("id", "x-label");
  }

  let yLabel = canvas.select("#y-label");
  if (yLabel.empty()) {
    yLabel = canvas.append("text").attr("id", "y-label");
  }

  if (xAxisName === "Release Date") {
    xLabel
      .text("Release Date")
      .attr("x", 400)
      .attr("y", canvasHeight - 10)
      .attr("text-anchor", "middle");
  } else if (xAxisName === "Transistors (million)") {
    xLabel
      .text("Transistors (million)")
      .attr("x", 400)
      .attr("y", canvasHeight - 10)
      .attr("text-anchor", "middle");
  }

  yLabel
    .text("Die Size (mm^2)")
    .attr("x", 10)
    .attr("y", canvasHeight / 2)
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90 10 ${canvasHeight / 2}) translate(0, 10)`);
}

function showTooltip(event, d) {
  const tooltip = d3.select("#tooltip");
  tooltip
    .style("opacity", 1)
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY + 10 + "px").html(`
      ${d["Product"]} <br\>
      Transistors: ${d["Transistors (million)"]} million <br\>
      Die Size: ${d["Die Size (mm^2)"]} mm^2 <br\>
      Process Size: ${d["Process Size (nm)"]} nm <br\>
      Density: ${(d["Transistors (million)"] / d["Die Size (mm^2)"]).toFixed(
        2
      )} million/mm^2<br\>
      Release Date: ${d["Release Date"]}
    `);
}

function hideTooltip() {
  const tooltip = d3.select("#tooltip");
  tooltip.style("opacity", 0).style("left", "-9999px").style("top", "-9999px");
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
