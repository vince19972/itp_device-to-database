// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChart);

async function getMessageCountByDevice() {
    const response = await fetch('messages-per-device');
    const json = await response.json();
    const rows = json.map(row => [row.device, Number(row.count)]);
    return rows;
}

// Callback that creates and populates a data table, instantiates
// the pie chart, passes in the data and draws it.
async function drawChart() {

// Create the data table.
const data = new google.visualization.DataTable();
data.addColumn('string', 'Device');
data.addColumn('number', 'Message Count');
const rows = await getMessageCountByDevice();
data.addRows(rows);

// Set chart options
const options = {
    title:'Message Count per Device',
    is3D: true,
    //sliceVisibilityThreshold: .01,
    width: 800,
    height: 800
};

// Instantiate and draw our chart, passing in some options.
const chart = new google.visualization.PieChart(document.getElementById('chart_div'));
chart.draw(data, options);
}