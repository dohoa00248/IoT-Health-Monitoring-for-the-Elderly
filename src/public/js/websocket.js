$(document).ready(function () {
  // const ws = new WebSocket("ws://192.168.2.127:3000");
  const ws = new WebSocket(
    "wss://iot-health-monitoring-for-the-elderly.onrender.com"
  );
  ws.onmessage = function (event) {
    const healthData = JSON.parse(event.data);
    console.log(healthData);
  };
});
