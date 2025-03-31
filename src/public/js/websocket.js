$(document).ready(function () {
  const ws = new WebSocket("ws://192.168.65.58:3000");
  // const ws = new WebSocket(
  //   "wss://iot-health-monitoring-for-the-elderly.onrender.com/api/v1/test/websocket:443"
  // );
  ws.onopen = () => {
    console.log("WebSocket connected");
  };
  ws.onmessage = function (event) {
    const healthData = JSON.parse(event.data);
    console.log(healthData);
  };
});
