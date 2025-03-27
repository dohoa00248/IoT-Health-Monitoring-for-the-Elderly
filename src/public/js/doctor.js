$(document).ready(function () {
  // const ws = new WebSocket(
  //   "wss://iot-health-monitoring-for-the-elderly.onrender.com"
  // );
  // const ws = new WebSocket(
  //   "wss://iot-health-monitoring-for-the-elderly.onrender.com:10000"
  // );
  const ws = new WebSocket("ws://192.168.2.127:3000");
  // const ws = new WebSocket("ws://" + window.location.hostname);
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

  // Xử lý khi nhấn nút "Xem Lịch sử"
  $("#viewHistoryBtn").click(function () {
    $.ajax({
      url: "/api/v1/health/history",
      method: "GET",
      success: function (data) {
        $("#historyTable tbody").empty();
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item) => {
            const tableRow = `<tr>
                            <td>${item.deviceID || "N/A"}</td>
                            <td>${item.heartBeat || "0 BPM"}</td>
                            <td>${item.spo2 || "0%"}</td>
                            <td>${item.bodyTemp || "N/A"}</td>
                            <td>${item.ambientTemp || "N/A"}</td>
                            <td>${
                              Array.isArray(item.healthDiagnosis) &&
                              item.healthDiagnosis.length > 0
                                ? item.healthDiagnosis.join(", ")
                                : "N/A"
                            }</td>
                            <td>${item.healthStatus || "N/A"}</td>
                            <td>${
                              item.createdAt
                                ? new Date(item.createdAt).toLocaleString()
                                : "N/A"
                            }</td>
                            <td>${
                              item.updatedAt
                                ? new Date(item.updatedAt).toLocaleString()
                                : "N/A"
                            }</td>
                        </tr>`;
            $("#historyTable tbody").append(tableRow);
          });
        } else {
          $("#historyTable tbody").append(
            '<tr><td colspan="10">No data available</td></tr>'
          );
        }
        $("#historyModal").modal("show");
      },
      error: function () {
        alert("Không thể tải lịch sử dữ liệu.");
      },
    });
  });

  // Xuất Excel
  $("#exportExcelBtn").click(function () {
    const table = $("#historyTable");
    const wb = XLSX.utils.table_to_book(table[0], { sheet: "History Data" });
    XLSX.writeFile(wb, "Health_Data_History.xlsx");
  });

  // Quay lại trang trước
  $("#backButton").click(function () {
    window.history.back();
  });

  // Xử lý khi nhấn nút "Đăng Xuất"
  $("#logoutBtn").click(function () {
    // Xóa token khỏi localStorage
    localStorage.removeItem("token");

    // Chuyển hướng về trang đăng nhập
    window.location.href = "/api/v1/auth";
  });
});
