$(document).ready(function () {
  let heartRateData = {
    labels: [],
    datasets: [
      {
        label: "Heart Rate (BPM)",
        data: [],
        borderColor: "red",
        fill: false,
      },
    ],
  };
  let spO2Data = {
    labels: [],
    datasets: [
      { label: "SpO2 (%)", data: [], borderColor: "blue", fill: false },
    ],
  };
  let bodyTempData = {
    labels: [],
    datasets: [
      {
        label: "Body Temp (°C)",
        data: [],
        borderColor: "green",
        fill: false,
      },
    ],
  };
  let ambientTempData = {
    labels: [],
    datasets: [
      {
        label: "Ambient Temp (°C)",
        data: [],
        borderColor: "orange",
        fill: false,
      },
    ],
  };

  const heartRateChart = new Chart($("#heartRateChart")[0], {
    type: "line",
    data: heartRateData,
  });
  const spO2Chart = new Chart($("#spO2Chart")[0], {
    type: "line",
    data: spO2Data,
  });
  const bodyTempChart = new Chart($("#bodyTempChart")[0], {
    type: "line",
    data: bodyTempData,
  });
  const ambientTempChart = new Chart($("#ambientTempChart")[0], {
    type: "line",
    data: ambientTempData,
  });

  const ws = new WebSocket("ws://192.168.2.127:3000");

  ws.onmessage = function (event) {
    const healthData = JSON.parse(event.data);
    console.log(healthData); // In ra dữ liệu nhận được từ WebSocket

    if (healthData && healthData.deviceID) {
      //   updateHealthDataInTable(healthData);
      const timestamp = moment().format("HH:mm:ss");
      updateCharts(healthData, timestamp);
    } else {
      console.warn("Invalid health data received");
    }
  };
  function updateCharts(healthData, timestamp) {
    heartRateData.labels.push(timestamp);
    heartRateData.datasets[0].data.push(healthData.heartBeat);

    spO2Data.labels.push(timestamp);
    spO2Data.datasets[0].data.push(healthData.spo2);

    bodyTempData.labels.push(timestamp);
    bodyTempData.datasets[0].data.push(healthData.bodyTemp);

    ambientTempData.labels.push(timestamp);
    ambientTempData.datasets[0].data.push(healthData.ambientTemp);

    if (heartRateData.labels.length > 30) {
      heartRateData.labels.shift();
      heartRateData.datasets[0].data.shift();
    }
    if (spO2Data.labels.length > 30) {
      spO2Data.labels.shift();
      spO2Data.datasets[0].data.shift();
    }
    if (bodyTempData.labels.length > 30) {
      bodyTempData.labels.shift();
      bodyTempData.datasets[0].data.shift();
    }
    if (ambientTempData.labels.length > 30) {
      ambientTempData.labels.shift();
      ambientTempData.datasets[0].data.shift();
    }

    heartRateChart.update();
    spO2Chart.update();
    bodyTempChart.update();
    ambientTempChart.update();
  }
});
