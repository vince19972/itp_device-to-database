window.addEventListener('load', getDeviceList);

// Get a list of devices from the server
async function getDeviceList() {
    const response = await fetch('device');
    const devices = await response.json();
		buildSelectControl(devices);
		getChartData(deviceSelect.value);
}

// Build HTML for <select> control with devices
function buildSelectControl(devices) {
    const select = document.querySelector('select');
    devices.forEach(device => {
        const option = document.createElement('option');
        option.innerText = device;
        select.appendChild(option);
    });
    select.addEventListener('change', onDeviceSelected, false);
}

// onChange event handler for device <select> control
function onDeviceSelected(e) {
	const device = e.target.value;
	getChartData(device);
}

// Get humidity data from the server for the selected device
async function getChartData(device) {
	const response = await fetch(`device/${device}/humidity`);
	const json = await response.json();
	const rows = json.map(row => [new Date(row.recorded_at), row.humidity]);
	drawChart(rows);
}

// Draw the chart
function drawChart(rows) {
	var data = new google.visualization.DataTable();
	data.addColumn('date', 'Date');
	data.addColumn('number', 'humidity');
	data.addRows(rows);

	var chart = new google.visualization.AnnotationChart(document.getElementById('chart_div'));

	var options = {
			displayAnnotations: true
	};

	chart.draw(data, options);
}

google.charts.load('current', {'packages':['annotationchart']});
