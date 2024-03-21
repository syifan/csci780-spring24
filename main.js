import * as d3 from "d3";

let data;

main();

async function main() {
  const data = await getData();
  const filteredData = processData(data);

  document
    .getElementById("by-release-date-btn")
    .addEventListener("click", () => {
      render(filteredData, "Release Date");
    });

  document.getElementById("by-transistor-btn").addEventListener("click", () => {
    render(filteredData, "Transistors");
  });

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

function render(data, xAxisName) {
  const canvas = d3.select("svg");
  console.log(canvas);

  const canvasWidth = 800;
  const canvasHeight = 800;
  const paddingLeft = 60;
  const paddingBottom = 60;
  const paddingTop = 20;
  const paddingRight = 20;

  let xScale = d3
    .scaleLog()
    .domain([100, 20000])
    .range([paddingLeft, canvasWidth - paddingRight]);

  if (xAxisName === "Release Date") {
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

  let group = canvas.select("#data");
  if (group.empty()) {
    group = canvas.append("g").attr("id", "data");
  }

  group
    .selectAll("circle")
    .data(data)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("r", 5)
          .attr("cx", 0)
          .attr("cy", (d) => {
            const dieSize = Number(d["Die Size (mm^2)"]);
            return yScale(dieSize);
          })
          .on("mouseover", (event, d) => {
            showTooltip(event, d);
          })
          .on("mousemove", (event, d) => {
            showTooltip(event, d);
          })
          .on("mouseout", (event, d) => {
            hideTooltip();
          }),
      (update) => update,
      (exit) =>
        exit
          .transition()
          .duration(1000)
          .attr("x", canvasWidth - paddingRight)
          .remove()
    )
    .transition()
    .duration(1000)
    .attr("r", 5)
    .attr("cx", (d) => {
      const trans = Number(d["Transistors (million)"]);
      const date = new Date(d["Release Date"]);
      if (xAxisName === "Release Date") {
        return xScale(date);
      }
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

  // circles
  //   .merge(circlesEnter)
  //   .transition()
  //   .duration(1000)
  //   .attr("cx", (d) => {
  //     const trans = Number(d["Transistors (million)"]);
  //     const date = new Date(d["Release Date"]);
  //     if (xAxisName === "Release Date") {
  //       return xScale(date);
  //     }
  //     return xScale(trans);
  //   });

  // circles
  //   .exit()
  //   .transition()
  //   .duration(1000)
  //   .attr("x", canvasWidth - paddingRight)
  //   .remove();

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

  if (xAxisName === "Release Date") {
    canvas
      .append("text")
      .text("Release Date")
      .attr("x", canvasWidth / 2)
      .attr("y", canvasHeight - 10)
      .attr("text-anchor", "middle");
  } else {
    canvas
      .append("text")
      .text("Transistors (million)")
      .attr("x", 400)
      .attr("y", 800 - 10)
      .attr("text-anchor", "middle");
  }

  canvas
    .append("text")
    .text("Die Size (mm^2)")
    .attr("x", 10)
    .attr("y", 400)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90 10 400) translate(0, 10)");
}

function showTooltip(event, d) {
  const tooltip = d3.select("#tooltip");
  tooltip
    .style("opacity", 1)
    .style("left", event.pageX + 5 + "px")
    .style("top", event.pageY + 5 + "px")
    .html(
      `<div>
        ${d["Product"]}
        <br>Transistors: ${d["Transistors (million)"]}
        <br>Die Size: ${d["Die Size (mm^2)"]}
        <br>Process Size: ${d["Process Size (nm)"]}
        <br>Density: ${(
          d["Transistors (million)"] / d["Die Size (mm^2)"]
        ).toFixed(2)}
        <br>Release Date: ${d["Release Date"]}
      </div>`
    );
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
