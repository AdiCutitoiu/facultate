const fs = require("fs");

let count = 0;

function createChart(results, title, key) {
  count++;

  const rows = results
    .map((result) => {
      const numericResults = Object.keys(result)
        .filter((k) => k.endsWith(key))
        .map((k) => result[k]);

      return [result.sizeKb, ...numericResults];
    })
    .sort((a, b) => a[0] - b[0]);

  return {
    ["chart_div" + count]: {
      title,
      columns: ["X", "gzip", "brotli", "lzma"],
      rows: rows,
    },
  };
}

module.exports = function (results) {
  const graphs = JSON.stringify({
    ...createChart(results, "Size comp (KB)", "-compressionSizeKb"),
    ...createChart(results, "Time comp (ms)", "-compressionTimeMs"),
    ...createChart(results, "Memory comp (KB)", "-compressionMemoryKb"),
    ...createChart(results, "Comp ratio", "-compressionRatio"),
    ...createChart(results, "Size decomp (KB)", "-decompressionSizeKb"),
    ...createChart(results, "Time decomp (ms)", "-decompressionTimeMs"),
    ...createChart(results, "Memory decomp (KB)", "-decompressionMemoryKb"),
  });

  const htmlContent = `<html>

    <head>
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <script type="text/javascript">
            google.charts.load('current', { packages: ['corechart', 'line'] });
            google.charts.setOnLoadCallback(drawCurveTypes);
    
    
            function drawCurveTypes() {
                const graph = JSON.parse('${graphs}');
    
                const [body] = document.getElementsByTagName('body');
    
                for (const key in graph) {
                    const graphElement = document.createElement('div');
                    graphElement.setAttribute('id', key);
                    body.appendChild(graphElement);
    
                    var data = new google.visualization.DataTable();
    
                    for (const col of graph[key].columns) {
                        data.addColumn('number', col);
                    }
    
                    data.addRows(graph[key].rows);
    
                    var options = {
                        hAxis: {
                            title: 'Size (KB)'
                        },
                        vAxis: {
                            title: graph[key].title
                        },
                        series: {
                            1: { curveType: 'function' }
                        }
                    };
    
                    var chart = new google.visualization.LineChart(graphElement);
                    chart.draw(data, options);
                }
            }
        </script>
    </head>
    
    <body>
    </body>
    
    </html>`;

  fs.writeFileSync("./report.html", htmlContent);
};
