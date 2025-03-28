$(document).ready(function () {
  const ws = new WebSocket("ws://192.168.2.127:3000");
  ws.onmessage = function (event) {
    const healthData = JSON.parse(event.data);
    console.log(healthData); // In ra dữ liệu nhận được từ WebSocket

    if (healthData && healthData.deviceID) {
      updateHealthDataInTable(healthData);
      //   const timestamp = moment().format("HH:mm:ss");
      //   updateCharts(healthData, timestamp);
    } else {
      console.warn("Invalid health data received");
    }
  };
  function updateHealthDataInTable(data) {
    $("#deviceID").text(data.deviceID || "N/A");
    $("#heartBeat").text(data.heartBeat || "0 BPM");
    $("#spo2").text(data.spo2 || "0%");
    $("#bodyTemp").text(data.bodyTemp || "N/A");
    $("#ambientTemp").text(data.ambientTemp || "N/A");

    if (
      Array.isArray(data.healthDiagnosis) &&
      data.healthDiagnosis.length > 0
    ) {
      $("#healthDiagnosis").text(data.healthDiagnosis.join(", "));
    } else {
      $("#healthDiagnosis").text("N/A");
    }

    $("#healthStatus").text(data.healthStatus || "N/A");
  }
});
