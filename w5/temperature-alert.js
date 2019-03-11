const mqtt = require('mqtt')
const mqttClient = mqtt.connect(process.env.MQTT_SERVER)

mqttClient.on('connect', () => {
	console.log('MQTT Connected')
	mqttClient.subscribe('itp/device_ms/temperature')
})

mqttClient.on('message', (topic, message) => {
	console.log(topic, message.toString())
	const temperature = Number(message.toString())

	if (temperature > 80) {
		const alertMessage = `Temperature ${temperature}°F exceeds the high temperature limit of 80°F`
		mqttClient.publish('itp/device_ms/alert', alertMessage)
	}
})