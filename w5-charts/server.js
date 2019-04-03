const express = require('express')
const { Pool } = require('pg')

const app = express()
const port = 4000

// app.get('/', (req, res) => res.send('Hello World!'))
app.use(express.static('public'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// 'json spaces' pretty prints JSON which is nice for debugging
app.set('json spaces', 2);

const pool = new Pool({
    connectionString: process.env.TIMESCALE_SERVER
})

app.get('/device', async (req, res) => {
	const query = `SELECT distinct device
			FROM sensor_data
			WHERE measurement = 'humidity'
			ORDER BY device`
	console.log(query)

	try {
			const results = await pool.query(query)
			console.log(`returning ${results.rowCount} rows`)
			const devices = results.rows.map(d => d.device)
			res.send(devices)
			// console.log(results)
	} catch(err) {
			console.log(err.stack)
			res.status(400).send('server error')
	}
})

app.get('/device/:device/humidity', async (req, res) => {
	const device = req.params.device
	const query = `SELECT recorded_at, reading::float as humidity
			FROM sensor_data
			WHERE measurement = 'humidity'
			AND device = $1`
	const params = [device]
	console.log(query, params)

	try {
			const result = await pool.query(query, params)
			res.send(result.rows)
	} catch(err) {
			console.log(err.stack)
			res.status(400).send('server error')
	}
})

app.get('/messages-per-device', async (req, res) => {

	const query = `SELECT device, count(*)
			FROM sensor_data
			GROUP BY device
			ORDER BY device`;
	console.log(query);

	try {
			const result = await pool.query(query);
			res.send(result.rows);
	} catch(err) {
			console.log(err.stack);
			res.status(400).send('server error');
	}
});

app.get('/messages-per-day', async (req, res) => {

	const query = `SELECT recorded_at::date as date, count(*)
			FROM sensor_data
			GROUP BY date
			ORDER BY count`;
	console.log(query);

	try {
			const result = await pool.query(query);
			res.send(result.rows);
	} catch(err) {
			console.log(err.stack);
			res.status(400).send('server error');
	}
});