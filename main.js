// import * as d3 from "d3";
// import { Chart } from "chart.js";

async function GetData() {
  let res = await fetch("./data.json");
  let json = await res.json();
  return json;
}

let json = await GetData();

const getOrCreateTooltip = (chart) => {
  let tooltipEl = chart.canvas.parentNode.querySelector("div");

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.style.background = "hsl(25 47% 15%)";
    tooltipEl.style.borderRadius = "4px";
    tooltipEl.style.color = "hsl(33 100% 98%)";
    tooltipEl.style.opacity = 1;
    tooltipEl.style.fontSize = "14px";
    tooltipEl.style.fontFamily = "DM Sans";
    tooltipEl.style.fontWeight = 500;
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.position = "absolute";
    tooltipEl.style.transform = "translate(-50%, -110%)";
    tooltipEl.style.transition = "all .1s ease";

    const table = document.createElement("table");
    table.style.margin = "0px";

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const bodyLines = tooltip.body.map((b) => b.lines);

    const tableBody = document.createElement("tbody");
    bodyLines.forEach((body) => {
      let txt = `$${body}`;

      const tr = document.createElement("tr");
      tr.style.backgroundColor = "inherit";
      tr.style.borderWidth = 0;

      const td = document.createElement("td");
      td.style.borderWidth = 0;

      const text = document.createTextNode(txt);

      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector("table");

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableBody);
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + "px";
  tooltipEl.style.top = positionY + tooltip.caretY + "px";
  // tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding =
    tooltip.options.padding + "px " + tooltip.options.padding + "px";
};

const labels = json.map((d) => {
  return d.day;
});

const amounts = json.map((d) => {
  return d.amount;
});
const amountMax = Math.max(...amounts);
const backgroundColors = amounts.map((item) =>
  item >= amountMax ? "hsl(186 34% 60%)" : "hsl(10 79% 65%)"
);
const hoverBackgroundColors = amounts.map((item) =>
  item >= amountMax ? "hsl(187 49% 80%)" : "hsl(10 100% 76%)"
);

const data = {
  labels: labels,
  datasets: [
    {
      label: "",
      backgroundColor: backgroundColors,
      hoverBackgroundColor: hoverBackgroundColors,
      data: amounts,
      borderRadius: 3,
      borderSkipped: false,
    },
  ],
};

const config = {
  type: "bar",
  data: data,
  options: {
    scales: {
      yAxis: {
        display: false,
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "DM Sans",
          },
        },
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        external: externalTooltipHandler,
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
      },
    },
    maintainAspectRatio: false,
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement.length
        ? "pointer"
        : "default";
    },
  },
};

const myChart = new Chart(document.getElementById("myChart"), config);
