const mqtt = require('mqtt')
const mqttClient = mqtt.connect(process.env.MQTT_SERVER)

mqttClient.on('connect', () => {
    console.log('MQTT Connected')
    mqttClient.publish('itp/device_xx/temperature', "120")
    console.log('Sent message')
    mqttClient.end()
})
