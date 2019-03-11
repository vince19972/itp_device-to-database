const mqtt = require('mqtt')
const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.TIMESCALE_SERVER
})

const mqttClient = mqtt.connect(process.env.MQTT_SERVER)

mqttClient.on('connect', () => {
	console.log('MQTT connected')
	mqttClient.subscribe('itp/device_ms/+')
})

mqttClient.on('message', (topic, message) => {
	console.log(topic, message.toString())

	const parts = topic.split('/')
	const root = parts[0]              // itp (not used)
	const device = parts[1]            // device_xx
	const measurement = parts[2]       // temperature, humidity, etc
	const reading = message.toString() // convert buffer to a string

	insertRow(device, measurement, reading)
})

async function insertRow(device, measurement, reading) {

	const query = 'INSERT INTO sensor_data (device, measurement, reading) VALUES ($1,$2,$3)';
	const values = [device, measurement, reading];
	console.log(query, values);

	try {
			const result = await pool.query(query, values);
			console.log(`Inserted ${result.rowCount} record.`);  // should be 1
	} catch(err) {
			console.log(err.stack);
	}
}

insertRow('device_ms', 'acceleration', 9.82)