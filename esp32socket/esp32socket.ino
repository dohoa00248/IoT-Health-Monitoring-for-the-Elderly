#include <SPI.h>
#include "DFRobot_BloodOxygen_S.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <Adafruit_MLX90614.h>
#include <WiFi.h>
#include <WebSocketsClient.h>

// Cấu hình Wi-Fi

// #define WIFI_SSID "DTH 999"
// #define WIFI_PASSWORD "9999999990"

// #define WIFI_SSID "Sparta.inc_5G"
// #define WIFI_PASSWORD "Dochua2023"

#define WIFI_SSID "Wifi chùa"
#define WIFI_PASSWORD "9999999990"

// // DNS Google (8.8.8.8 và 8.8.4.4)
// IPAddress dns1(8, 8, 8, 8);
// IPAddress dns2(8, 8, 4, 4);

// Địa chỉ I2C và các cảm biến
#define I2C_ADDRESS 0x57
#define i2c_Address 0x3c

// Khởi tạo các cảm biến
DFRobot_BloodOxygen_S_I2C MAX30102(&Wire, I2C_ADDRESS);
Adafruit_MLX90614 mlx = Adafruit_MLX90614();
Adafruit_SH1106G display = Adafruit_SH1106G(128, 64, &Wire, 4);

// Cấu hình các thông số về LED
int ledLowHeartRate = 32;
int ledHighHeartRate = 33;
int ledLowSpo2 = 25;
int ledHighTemp = 26;

// Thông tin WebSocket server
// const char* websocketServer = "iot-health-monitoring-for-the-elderly.onrender.com";  // Địa chỉ WebSocket server
// const char* websocketServer = "ws://iot-health-monitoring-for-the-elderly.onrender.com";  // Địa chỉ WebSocket server
// const char* websocketServer = "ws://192.168.2.127";  // Địa chỉ WebSocket server

const char* websocketServer = "192.168.65.58";  // Địa chỉ WebSocket server

const int port = 3000;
// const int port = 10000;
// const int port = 8080;
// const int port = 443;
WebSocketsClient webSocket;

// String patientID = "P01";
String deviceID = "DV02";

// Các giá trị ngưỡng
const int lowHeartRate = 60;
const int highHeartRate = 80;
const int lowSpo2 = 95;
const float highTemp = 37.5;

unsigned long lastConnectionAttempt = 0;
unsigned long previousDisplayMillis = 0;
const long displayInterval = 500;

void setup() {
  Serial.begin(115200);

  // Kết nối Wi-Fi
  // Cấu hình DNS và kết nối Wi-Fi
  // WiFi.config(INADDR_NONE, INADDR_NONE, dns1, dns2);  // Đặt DNS 8.8.8.8 và 8.8.4.4
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nConnected to Wi-Fi");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  // Khởi tạo các cảm biến
  MAX30102.begin();
  mlx.begin();
  delay(1000);
  MAX30102.sensorStartCollect();

  display.begin(i2c_Address, true);
  display.setTextSize(1);
  display.setTextColor(SH110X_WHITE);
  display.clearDisplay();

  // Cấu hình các chân LED
  pinMode(ledLowHeartRate, OUTPUT);
  pinMode(ledHighHeartRate, OUTPUT);
  pinMode(ledLowSpo2, OUTPUT);
  pinMode(ledHighTemp, OUTPUT);

  // Kết nối WebSocket
  webSocket.begin(websocketServer, port);
  webSocket.onEvent(webSocketEvent);

  Serial.println("Setup complete.");
}

void loop() {
  webSocket.loop();  // Kiểm tra kết nối WebSocket

  if (!webSocket.isConnected() && millis() - lastConnectionAttempt > 5000) {
    Serial.println("WebSocket not connected. Attempting to reconnect...");
    webSocket.begin(websocketServer, port);
    lastConnectionAttempt = millis();
  }

  // Lấy dữ liệu từ cảm biến
  int heart_beat, spo2;
  MAX30102.getHeartbeatSPO2();
  heart_beat = MAX30102._sHeartbeatSPO2.Heartbeat;
  spo2 = MAX30102._sHeartbeatSPO2.SPO2;

  // Kiểm tra giá trị hợp lệ
  if (spo2 < 0 || spo2 > 100) {
    spo2 = 0;
  }
  if (heart_beat < 0) {
    heart_beat = 0;
  }

  float temp_amb = mlx.readAmbientTempC();
  float temp_obj = mlx.readObjectTempC();

  // In ra các giá trị lên Serial Monitor
  Serial.print("Heart Beat: ");
  Serial.println(heart_beat);
  Serial.print("SpO2: ");
  Serial.println(spo2);
  Serial.print("Ambient Temperature: ");
  Serial.println(temp_amb);
  Serial.print("Body Temperature: ");
  Serial.println(temp_obj);


  // Control LEDs based on health status
  controlLEDs(heart_beat, spo2, temp_obj);


  // Gửi dữ liệu lên WebSocket server mỗi 1 giây
  static unsigned long lastSendTime = 0;
  unsigned long currentMillis = millis();
  if (currentMillis - lastSendTime >= 1000) {
    lastSendTime = currentMillis;

    // Tạo chuỗi JSON để gửi lên server
    // String jsonDsata = "{\"deviceID\":\"" + deviceID + "\",\"patientID\":\"" + patientID + "\",\"heartBeat\":" + heart_beat + ",\"spo2\":" + spo2 + ",\"tempBody\":" + temp_obj + ",\"ambientTemp\":" + temp_amb + "}";
   
    String jsonData = "{\"deviceID\":\"" + deviceID + "\",\"heartBeat\":" + heart_beat + ",\"spo2\":" + spo2 + ",\"bodyTemp\":" + temp_obj + ",\"ambientTemp\":" + temp_amb + "}";

    // Gửi dữ liệu lên WebSocket server
    if (webSocket.isConnected()) {
      webSocket.sendTXT(jsonData);
      Serial.println("Sent data:");
      Serial.println(jsonData);
    } else {
      Serial.println("WebSocket not connected. Reconnecting...");
    }
  }

  // Hiển thị thông tin lên OLED
  if (currentMillis - previousDisplayMillis >= displayInterval) {
    previousDisplayMillis = currentMillis;
    display.clearDisplay();
    display.setCursor(0, 15);
    display.print("ID: ");
    display.print(deviceID);
    // display.print("  P ID: ");
    // display.print(patientID);

    display.setCursor(0, 25);
    display.print("HB: ");
    display.print(heart_beat);
    display.print(" BPM");

    display.setCursor(0, 35);
    display.print("SpO2: ");
    display.print(spo2);
    display.print(" %");

    display.setCursor(0, 45);
    display.print("Temp: ");
    display.print(temp_obj);
    display.print(" C");

    display.setCursor(0, 55);
    display.print("Amb: ");
    display.print(temp_amb);
    display.print(" C");

    display.display();
  }
}

// Hàm xử lý sự kiện WebSocket
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("Disconnected from WebSocket server");
      break;
    case WStype_CONNECTED:
      Serial.println("Connected to WebSocket server");
      break;
    case WStype_TEXT:
      Serial.println("Received data from server:");
      Serial.println((char*)payload);
      break;
    case WStype_PING:
      break;
    case WStype_PONG:
      break;
    case WStype_ERROR:
      Serial.println("WebSocket error");
      break;
  }
}

// Control LED based on health status
void controlLEDs(int heart_beat, int spo2, float temp_obj) {
  digitalWrite(ledLowHeartRate, heart_beat < lowHeartRate ? HIGH : LOW);
  digitalWrite(ledHighHeartRate, heart_beat > highHeartRate ? HIGH : LOW);
  digitalWrite(ledLowSpo2, spo2 < lowSpo2 ? HIGH : LOW);
  digitalWrite(ledHighTemp, temp_obj > highTemp ? HIGH : LOW);
}