const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.TIMESCALE_SERVER
})

async function insertRow(device, measurement, reading) {

	const query = 'INSERT INTO sensor_data (device, measurement, reading) VALUES ($1, $2, $3)'
	const values = [device, measurement, reading]
	console.log(query, values)

	try {
		const result = await pool.query(query, values)
		console.log(`Inserted ${result.rowCount} record.`)
	} catch (err) {
		console.log(err.stack)
	}

}

insertRow('device_ms', 'acceleration', 9.82)