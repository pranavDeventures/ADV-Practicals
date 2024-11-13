// Load CSV data
d3.csv("../Datasets/data_exp_7.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.MSFT = +d.MSFT;
        d.IBM = +d.IBM;
        d.SBUX = +d.SBUX;
        d.AAPL = +d.AAPL;
        d.GSPC = +d.GSPC;
        d.Date = new Date(d.Date);
    });
    createBubblePlot(data);
    createLineChart(data);
    createPieChart(data);
    createJointBarGraph(data);
    createScatterPlot(data);
    createBoxPlot(data);
    createRegressionPlot(data);
    performCorrelationAnalysis(data);
});

// Function to create a Bubble Plot showing average stock prices
function createBubblePlot(data) {
    const margin = { top: 20, right: 20, bottom: 50, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#bubble-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const stocks = ["MSFT", "IBM", "SBUX", "AAPL", "GSPC"];

    // Calculate average prices for each stock
    const averagePrices = stocks.map(stock => {
        const total = d3.sum(data, d => d[stock]);
        const avg = total / data.length;
        return { stock, avg };
    });

    // Set up x scale based on the date
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, width]);

    // Set up y scale based on the maximum average price
    const maxAvgPrice = d3.max(averagePrices, d => d.avg);
    const y = d3.scaleLinear()
        .domain([0, maxAvgPrice])
        .range([height, 0]);

    // Create color scale
    const color = d3.scaleOrdinal()
        .domain(stocks)
        .range(d3.schemeCategory10); // D3's built-in color scheme

    // Create bubbles for each stock based on average prices
    averagePrices.forEach(({ stock, avg }) => {
        svg.append("circle")
            .attr("class", stock)
            .attr("cx", x(d3.mean(data, d => d.Date))) // Place bubble at the average date
            .attr("cy", y(avg))
            .attr("r", Math.sqrt(avg) * 2) // Size based on average price (adjust scale factor as needed)
            .attr("fill", color(stock))
            .attr("opacity", 0.33) // Optional: Add some transparency

            // Tooltip to show details
            .on("mouseover", function(event) {
                d3.select(this).attr("stroke", "black").attr("stroke-width", 1.5);
                svg.append("text")
                    .attr("id", "tooltip")
                    .attr("x", x(d3.mean(data, d => d.Date)) + 5)
                    .attr("y", y(avg) - 10)
                    .text(`Avg ${stock}: $${avg.toFixed(2)}`)
                    .attr("fill", "black");
            })
            .on("mouseout", function() {
                d3.select(this).attr("stroke", "none");
                svg.select("#tooltip").remove();
            });
    });

    // Axes
    svg.append("g")
        .attr("class", "axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis--y")
        .call(d3.axisLeft(y));

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Bubble Plot of Average Stock Prices");

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, 10)`);

    stocks.forEach((stock, index) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", index * 20)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color(stock));

        legend.append("text")
            .attr("x", 25)
            .attr("y", index * 20 + 15)
            .text(stock);
    });
}

// // Function to create a Line Chart with Support, Resistance, and Tooltips
function createLineChart(data) {
    const margin = { top: 20, right: 20, bottom: 50, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .range([0, width])
        .domain(d3.extent(data, d => d.Date));

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, d => d3.max([d.MSFT, d.IBM, d.SBUX, d.AAPL, d.GSPC]))]);

    // Create a tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Draw lines for each stock
    ["MSFT", "IBM", "SBUX", "AAPL", "GSPC"].forEach(stock => {
        // Line for the stock
        svg.append("path")
            .data([data])
            .attr("class", stock.toLowerCase() + "-line")
            .attr("fill", "none")
            .attr("stroke", getColor(stock))
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.Date))
                .y(d => y(d[stock]))
            );

        // Calculate and draw support and resistance lines
        const prices = data.map(d => d[stock]);
        const support = d3.min(prices);
        const resistance = d3.max(prices);

        // Draw support line
        svg.append("line")
            .attr("class", stock.toLowerCase() + "-support")
            .attr("x1", 0)
            .attr("y1", y(support))
            .attr("x2", width)
            .attr("y2", y(support))
            .attr("stroke", "gray")
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 1);

        // Draw resistance line
        svg.append("line")
            .attr("class", stock.toLowerCase() + "-resistance")
            .attr("x1", 0)
            .attr("y1", y(resistance))
            .attr("x2", width)
            .attr("y2", y(resistance))
            .attr("stroke", "red")
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 1);

        // Add circles to show points on the line for tooltips
        svg.selectAll(`.${stock.toLowerCase()}-point`)
            .data(data)
            .enter().append("circle")
            .attr("class", `${stock.toLowerCase()}-point`)
            .attr("cx", d => x(d.Date))
            .attr("cy", d => y(d[stock]))
            .attr("r", 5)
            .attr("fill", getColor(stock))
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.Date)}<br>${stock}: ${d[stock]}<br>Support: ${support}<br>Resistance: ${resistance}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    });

    svg.append("g")
        .attr("class", "axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%Y")));

    svg.append("g")
        .attr("class", "axis--y")
        .call(d3.axisLeft(y));

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Stock Prices Over Time with Support and Resistance");

    // Create legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, 0)`);
    
    ["MSFT", "IBM", "SBUX", "AAPL", "GSPC"].forEach((stock, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", getColor(stock));
        
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(stock);
    });
}

// Function to get color for each stock
function getColor(stock) {
    const colors = {
        MSFT: "blue",
        IBM: "green",
        SBUX: "orange",
        AAPL: "red",
        GSPC: "purple"
    };
    return colors[stock] || "black";
}


// Function to create a Pie Chart
function createPieChart(data) {
    const margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = 800 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#pie-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

    const totalPrices = {
        MSFT: d3.mean(data, d => d.MSFT),
        IBM: d3.mean(data, d => d.IBM),
        SBUX: d3.mean(data, d => d.SBUX),
        AAPL: d3.mean(data, d => d.AAPL),
        GSPC: d3.mean(data, d => d.GSPC),
    };

    const pie = d3.pie()
        .value(d => d.value);
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2);

    const pieData = pie(Object.entries(totalPrices).map(([key, value]) => ({ key, value })));

    svg.selectAll("arc")
        .data(pieData)
        .enter().append("g")
        .attr("class", "arc")
        .append("path")
        .attr("d", arc)
        .attr("fill", d => getColor(d.data.key));

    // Title
    svg.append("text")
        .attr("x", 0)
        .attr("y", 0 - (height / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Average Share Price Distribution");

    // Create legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, ${-height / 2})`);
    
    Object.entries(totalPrices).forEach((d, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", getColor(d[0]));
        
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(d[0]);
    });
}

// Function to create a Joint Bar Graph
function createJointBarGraph(data) {
    const margin = { top: 20, right: 20, bottom: 50, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#joint-bar-graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const yearData = d3.rollup(data, v => ({
        MSFT: d3.mean(v, d => d.MSFT),
        IBM: d3.mean(v, d => d.IBM),
        SBUX: d3.mean(v, d => d.SBUX),
        AAPL: d3.mean(v, d => d.AAPL),
        GSPC: d3.mean(v, d => d.GSPC),
    }), d => d.Date.getFullYear());

    const years = Array.from(yearData.keys());

    const x = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(Array.from(yearData.values()), d => d3.max(Object.values(d)))])
        .range([height, 0]);

    svg.selectAll(".bar")
        .data(years)
        .enter().append("g")
        .attr("transform", d => `translate(${x(d)},0)`)
        .selectAll("rect")
        .data(year => Object.entries(yearData.get(year)))
        .enter().append("rect")
        .attr("x", (d, i) => i * (x.bandwidth() / 5)) // Divide by number of stocks
        .attr("y", d => y(d[1]))
        .attr("width", x.bandwidth() / 5)
        .attr("height", d => height - y(d[1]))
        .attr("fill", d => getColor(d[0]));

    svg.append("g")
        .attr("class", "axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis--y")
        .call(d3.axisLeft(y));

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Average Price Per Year");

    // Create legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, 0)`);
    
    Object.keys(yearData.values().next().value).forEach((stock, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", getColor(stock));
        
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(stock);
    });
}
// Function to create a Scatter Plot
function createScatterPlot(data) {
    const margin = { top: 20, right: 20, bottom: 50, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const stocks = ["MSFT", "IBM", "SBUX", "AAPL", "GSPC"];

    // Set up x and y scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(stocks, stock => d[stock]))])
        .range([height, 0]);

    // Create color scale
    const color = d3.scaleOrdinal()
        .domain(stocks)
        .range(d3.schemeCategory10); // D3's built-in color scheme

    // Create scatter points for each stock
    stocks.forEach(stock => {
        const stockData = data.map(d => ({ date: d.Date, price: d[stock] }));

        svg.selectAll(`circle.${stock}`)
            .data(stockData)
            .enter().append("circle")
            .attr("class", stock)
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.price))
            .attr("r", 3)
            .attr("fill", color(stock));
        
        // Calculate mean price and draw mean line
        const meanPrice = d3.mean(stockData, d => d.price);
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", y(meanPrice))
            .attr("x2", width)
            .attr("y2", y(meanPrice))
            .attr("stroke", color(stock))
            .attr("stroke-dasharray", "5,5") // Dashed line for mean
            .attr("stroke-width", 1)
            .attr("class", "mean-line")
            .append("title") // Tooltip for mean line
            .text(`Mean ${stock}: ${meanPrice.toFixed(2)}`);
    });

    // Axes
    svg.append("g")
        .attr("class", "axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis--y")
        .call(d3.axisLeft(y));

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Stock Prices Over Time");

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, 10)`);

    stocks.forEach((stock, index) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", index * 20)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color(stock));

        legend.append("text")
            .attr("x", 25)
            .attr("y", index * 20 + 15)
            .text(stock);
    });
}

// Function to create a Box Plot
function createBoxPlot(data) {
    const margin = { top: 20, right: 20, bottom: 50, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#box-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const stocks = ["MSFT", "IBM", "SBUX", "AAPL", "GSPC"];
    
    const y = d3.scaleBand()
        .domain(stocks)
        .range([0, height])
        .padding(0.1);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max([d.MSFT, d.IBM, d.SBUX, d.AAPL, d.GSPC]))])
        .range([0, width]);

    svg.selectAll(".box")
        .data(stocks)
        .enter().append("g")
        .attr("class", "box")
        .attr("transform", d => `translate(0,${y(d)})`)
        .each(function(stock) {
            const stockData = data.map(d => d[stock]);
            const q1 = d3.quantile(stockData.sort(d3.ascending), 0.25);
            const median = d3.quantile(stockData.sort(d3.ascending), 0.5);
            const q3 = d3.quantile(stockData.sort(d3.ascending), 0.75);
            const interquartileRange = q3 - q1;

            d3.select(this).append("rect")
                .attr("x", x(q1))
                .attr("y", 0)
                .attr("width", x(q3) - x(q1))
                .attr("height", y.bandwidth())
                .attr("fill", "lightgray");

            d3.select(this).append("line")
                .attr("x1", x(median))
                .attr("y1", 0)
                .attr("x2", x(median))
                .attr("y2", y.bandwidth())
                .attr("stroke", "black");

            d3.select(this).append("line")
                .attr("x1", x(d3.min(stockData)))
                .attr("y1", y.bandwidth() / 2)
                .attr("x2", x(d3.max(stockData)))
                .attr("y2", y.bandwidth() / 2)
                .attr("stroke", "black");
        });

    svg.append("g")
        .attr("class", "axis--y")
        .call(d3.axisLeft(y));

    svg.append("g")
        .attr("class", "axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Box Plot of Stock Prices");
}

// Function to create a Regression Plot
function createRegressionPlot(data) {
    const margin = { top: 20, right: 20, bottom: 50, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#regression-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.MSFT)])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.IBM)])
        .range([height, 0]);

    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.MSFT))
        .attr("cy", d => y(d.IBM))
        .attr("r", 3)
        .attr("fill", "blue");

    const regressionLine = getLinearRegression(data, 'MSFT', 'IBM');
    const x0 = x.domain()[0], x1 = x.domain()[1];
    const y0 = regressionLine.slope * x0 + regressionLine.intercept;
    const y1 = regressionLine.slope * x1 + regressionLine.intercept;

    svg.append("line")
        .attr("x1", x(x0))
        .attr("y1", y(y0))
        .attr("x2", x(x1))
        .attr("y2", y(y1))
        .attr("stroke", "red");

    svg.append("g")
        .attr("class", "axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis--y")
        .call(d3.axisLeft(y));

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Regression Plot of MSFT vs IBM");
}

// Function to get Linear Regression parameters
function getLinearRegression(data, xKey, yKey) {
    const n = data.length;
    const xSum = data.reduce((sum, d) => sum + d[xKey], 0);
    const ySum = data.reduce((sum, d) => sum + d[yKey], 0);
    const xMean = xSum / n;
    const yMean = ySum / n;

    const numerator = data.reduce((sum, d) => sum + (d[xKey] - xMean) * (d[yKey] - yMean), 0);
    const denominator = data.reduce((sum, d) => sum + Math.pow(d[xKey] - xMean, 2), 0);
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    return { slope, intercept };
}

        function getCorrelation(data, xKey, yKey) {
            const n = data.length;
            const xSum = data.reduce((sum, d) => sum + d[xKey], 0);
            const ySum = data.reduce((sum, d) => sum + d[yKey], 0);
            const xMean = xSum / n;
            const yMean = ySum / n;

            const numerator = data.reduce((sum, d) => sum + (d[xKey] - xMean) * (d[yKey] - yMean), 0);
            const xDenominator = data.reduce((sum, d) => sum + Math.pow(d[xKey] - xMean, 2), 0);
            const yDenominator = data.reduce((sum, d) => sum + Math.pow(d[yKey] - yMean, 2), 0);
            
            const correlation = numerator / Math.sqrt(xDenominator * yDenominator);
            return correlation;
        }

        // Function to perform hypothesis testing on the correlation coefficient
        function hypothesisTest(r, n) {
            const t = r * Math.sqrt((n - 2) / (1 - r * r));
            const df = n - 2;
            const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df)); // Two-tailed test
            return { tStat: t, pValue: pValue };
        }

        // Function to calculate and display correlations and hypothesis testing results
        function displayCorrelations(data) {
            const correlations = [
                { label: "MSFT and IBM", r: getCorrelation(data, 'MSFT', 'IBM') },
                { label: "MSFT and SBUX", r: getCorrelation(data, 'MSFT', 'SBUX') },
                { label: "MSFT and AAPL", r: getCorrelation(data, 'MSFT', 'AAPL') },
                { label: "MSFT and GSPC", r: getCorrelation(data, 'MSFT', 'GSPC') },
                { label: "IBM and SBUX", r: getCorrelation(data, 'IBM', 'SBUX') },
                { label: "IBM and AAPL", r: getCorrelation(data, 'IBM', 'AAPL') },
                { label: "IBM and GSPC", r: getCorrelation(data, 'IBM', 'GSPC') },
                { label: "SBUX and AAPL", r: getCorrelation(data, 'SBUX', 'AAPL') },
                { label: "SBUX and GSPC", r: getCorrelation(data, 'SBUX', 'GSPC') },
                { label: "AAPL and GSPC", r: getCorrelation(data, 'AAPL', 'GSPC') },
            ];

            const correlationDiv = d3.select("#correlation-results");
            correlations.forEach(c => {
                const { tStat, pValue } = hypothesisTest(c.r, data.length);
                const significance = pValue < 0.05 ? "Reject the null hypothesis (correlation exists)" : "Fail to reject the null hypothesis (no correlation)";
                
                correlationDiv.append("p")
                    .text(`Correlation between ${c.label}: ${c.r.toFixed(4)} (t-statistic: ${tStat.toFixed(4)}, p-value: ${pValue.toFixed(4)}; ${significance})`);
            });
        }

        // Load the data and calculate correlations
        d3.csv("../Datasets/data_exp_7.csv").then(data => {
            data.forEach(d => {
                d.Date = new Date(d.Date);
                d.MSFT = +d.MSFT;
                d.IBM = +d.IBM;
                d.SBUX = +d.SBUX;
                d.AAPL = +d.AAPL;
                d.GSPC = +d.GSPC;
            });

            // Display correlations and hypothesis testing results
            displayCorrelations(data);
        });