const fs = require('fs')
const mqtt = require('mqtt')

const fileName = './mqtt.log'
const mqttClient = mqtt.connect(process.env.MQTT_SERVER)

mqttClient.on('connect', () => {
    console.log('MQTT Connected')
    mqttClient.subscribe('#')
})

mqttClient.on('message', function (topic, message) {
    const timestamp = new Date().getTime()
    const data = `${timestamp}\t${topic}\t${message}\n`
    fs.writeFile(fileName, data, { flag: 'a' }, () => {})
})