$(document).ready(function () {
  const ws = new WebSocket("wss://192.168.2.127:443");
  // const ws = new WebSocket(
  //   "wss://iot-health-monitoring-for-the-elderly.onrender.com:443"
  // );
  ws.onopen = () => {
    console.log("WebSocket connected");
  };
  ws.onmessage = function (event) {
    const healthData = JSON.parse(event.data);
    console.log(healthData);
  };
});
