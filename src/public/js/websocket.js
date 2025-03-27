$(document).ready(function () {
  //   const ws = new WebSocket("ws://192.168.26:8080");
  const ws = new WebSocket("ws://192.168.2.127:3000");
  let heartRateData = {
    labels: [],
    datasets: [
      { label: "Heart Rate (BPM)", data: [], borderColor: "red", fill: false },
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
      { label: "Body Temp (°C)", data: [], borderColor: "green", fill: false },
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

  ws.onmessage = function (event) {
    const healthData = JSON.parse(event.data);

    if (healthData && healthData.deviceID) {
      updateHealthDataInTable(healthData);

      const timestamp = moment().format("HH:mm:ss");
      // Cập nhật biểu đồ với dữ liệu mới
      updateCharts(healthData, timestamp);
    } else {
      console.warn("Invalid health data received");
    }
  };

  // Cập nhật biểu đồ với dữ liệu mới
  function updateCharts(healthData, timestamp) {
    heartRateData.labels.push(timestamp);
    heartRateData.datasets[0].data.push(healthData.heartBeat);

    spO2Data.labels.push(timestamp);
    spO2Data.datasets[0].data.push(healthData.spo2);

    bodyTempData.labels.push(timestamp);
    bodyTempData.datasets[0].data.push(healthData.bodyTemp);

    ambientTempData.labels.push(timestamp);
    ambientTempData.datasets[0].data.push(healthData.ambientTemp);

    // Giới hạn số lượng điểm dữ liệu hiển thị trên đồ thị (nếu muốn)
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

    // Cập nhật biểu đồ
    heartRateChart.update();
    spO2Chart.update();
    bodyTempChart.update();
    ambientTempChart.update();
  }

  // Cập nhật dữ liệu của bảng mà không thay đổi cấu trúc bảng
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

// Xử lý khi nhấn nút "Đăng Xuất"
$("#logoutBtn").click(function () {
  // Xóa token khỏi localStorage
  localStorage.removeItem("token");

  // Chuyển hướng về trang đăng nhập
  window.location.href = "/api/v1/auth";
});
