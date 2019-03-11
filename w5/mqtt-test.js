const mqtt = require('mqtt')

const mqttClient = mqtt.connect(process.env.MQTT_SERVER)

mqttClient.on('connect', () => {
    console.log('MQTT Connected')
    mqttClient.subscribe('#')
})

mqttClient.on('message', (topic, message) => {
    console.log(topic, message.toString())
})