// IoT Workshop
// Send temperature and humidity data to MQTT
//
// Uses WiFi101 https://www.arduino.cc/en/Reference/WiFi101 (MKR1000)
// Uses WiFiNINA https://www.arduino.cc/en/Reference/WiFiNINA (MKR WiFi 1010)
// Arduino MQTT Client Library https://github.com/arduino-libraries/ArduinoMqttClient
// Adafruit DHT Sensor Library https://github.com/adafruit/DHT-sensor-library
// Adafruit Unified Sensor Library https://github.com/adafruit/Adafruit_Sensor
//

#include <SPI.h>
#ifdef ARDUINO_SAMD_MKR1000
#include <WiFi101.h>
#define WL_NO_MODULE WL_NO_SHIELD 
#else
#include <WiFiNINA.h>
#endif
#include <ArduinoMqttClient.h>

#include "config.h"

WiFiSSLClient net;
MqttClient mqtt(net);

// Temperature and Humidity Sensor
#include <DHT.h>
#define DHTTYPE DHT11
#define DHTPIN  7
DHT dht(DHTPIN, DHTTYPE);

// btn
const int buttonPin = 0;
int buttonState = 0;  

// network
String temperatureTopic = "itp/" + DEVICE_ID + "/temperature";
String humidityTopic = "itp/" + DEVICE_ID + "/humidity";
String btnTopic = "itp/" + DEVICE_ID + "/btn";
String ledTopic = "itp/" + DEVICE_ID + "/led";

// Publish every 10 seconds for the workshop. Real world apps need this data every 5 or 10 minutes.
unsigned long publishInterval = 10 * 500;
unsigned long lastMillis = 0;

void setup() {
  Serial.begin(9600);

  // Uncomment next line to wait for a serial connection
  // while (!Serial) { }
 
  // initialize temperature sensor
  dht.begin();

  // initialize digital pin LED_BUILTIN as an output.
  pinMode(LED_BUILTIN, OUTPUT);

  // btn input
  pinMode(buttonPin, INPUT);
 
  Serial.println("Connecting WiFi");
  connectWiFi();

  // define function for incoming MQTT messages
  mqtt.onMessage(messageReceived);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (!mqtt.connected()) {
    connectMQTT();
  }
  
  // poll for new MQTT messages and send keep alives
  mqtt.poll();

  // btn
  buttonState = digitalRead(buttonPin);

  if (millis() - lastMillis > publishInterval) {
    lastMillis = millis();

    float temperature = dht.readTemperature(true);
    float humidity = dht.readHumidity();

    Serial.print(temperature);
    Serial.print("°F ");
    Serial.print(humidity);
    Serial.println("% RH");
    Serial.print("Is btn being pressed now? ");
    Serial.println(buttonState);
    
    mqtt.beginMessage(temperatureTopic);
    mqtt.print(temperature); 
    mqtt.endMessage();

    mqtt.beginMessage(humidityTopic);
    mqtt.print(humidity); 
    mqtt.endMessage();

    mqtt.beginMessage(btnTopic);
    mqtt.print(buttonState); 
    mqtt.endMessage();    
  }  
}

void connectWiFi() {
  // Check for the WiFi module
  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed!");
    // don't continue
    while (true);
  }

  Serial.print("WiFi firmware version ");
  Serial.println(WiFi.firmwareVersion());
  
  Serial.print("Attempting to connect to SSID: ");
  Serial.print(WIFI_SSID);
  Serial.print(" ");

  while (WiFi.begin(WIFI_SSID, WIFI_PASSWORD) != WL_CONNECTED) {
    // failed, retry
    Serial.print(".");
    delay(3000);
  }

  Serial.println("Connected to WiFi");
  printWiFiStatus();

}

void connectMQTT() {
  Serial.print("Connecting MQTT...");
  mqtt.setId(DEVICE_ID);
  mqtt.setUsernamePassword(MQTT_USER, MQTT_PASSWORD);

  while (!mqtt.connect(MQTT_BROKER, MQTT_PORT)) {
    Serial.print(".");
    delay(5000);
  }

  mqtt.subscribe(ledTopic);
  Serial.println("connected.");

  // Send connect and disconnect announcements similar to AWS Core IoT
  // https://docs.aws.amazon.com/iot/latest/developerguide/life-cycle-events.html
  mqtt.beginMessage("presence/connected/" + DEVICE_ID);
  mqtt.endMessage();

  // The will gets sent by the broker when the client disconnects
  mqtt.beginWill("presence/disconnected/" + DEVICE_ID, false, 1);
  mqtt.endWill();
}

void messageReceived(int messageSize) {
  String topic = mqtt.messageTopic();
  String payload = mqtt.readString();
  Serial.println("incoming: " + topic + " - " + messageSize + " ");
  Serial.println(payload);
  if (payload == "ON") {
    // turn the LED on
    digitalWrite(LED_BUILTIN, HIGH);
  } else if (payload == "OFF") {
    // turn the LED off
    digitalWrite(LED_BUILTIN, LOW);    
  }
}

void printWiFiStatus() {
  // print your WiFi IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
}
