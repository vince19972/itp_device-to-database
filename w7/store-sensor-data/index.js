const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING
});

async function insertRow(event) {
    const query = `INSERT INTO environment 
        (device, temperature, humidity) 
        VALUES ($1,$2,$3)`;  
    const values = [event.device, event.temperature, event.humidity];
    console.log(query, values);

    const result = await pool.query(query, values);
    return result.rowCount;
};

exports.handler = async (event) => {    
    await insertRow(event);
    const response = {
        statusCode: 200,
        body: 'OK'
    };
    return response;
};
