// Chart.js initialization for Cam 1
const ctx1 = document.getElementById('headCountChart1').getContext('2d');
const headCountChart1 = new Chart(ctx1, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Head Count',
            borderColor: 'rgb(75, 192, 192)',
            data: [],
        }]
    }
});

// Chart.js initialization for Cam 2
const ctx2 = document.getElementById('headCountChart2').getContext('2d');
const headCountChart2 = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Head Count',
            borderColor: 'rgb(75, 192, 192)',
            data: [],
        }]
    }
});

// Function to update the chart data
function updateChartData(chart, result) {
    chart.data.labels = result.map(data => data.imageId);
    chart.data.datasets[0].data = result.map(data => data.count);
    chart.update();
}

let lastProcessedCam1ImageTimestamp = null;
let lastProcessedCam2ImageTimestamp = null;

// Fetch and update data for Cam 1
async function fetchDataForCam1() {
    try {
      const response = await fetch('/image-predict/cam1');
      const result = await response.json();
      updateChartData(headCountChart1, result);
      if (result.length > 0) {
        const latestImage = result[result.length - 1];
        if (lastProcessedCam1ImageTimestamp !== latestImage.timestamp) {
          document.getElementById('cam1Image').src = latestImage.imagePath;
          document.getElementById('cam1Count').textContent = `Count: ${latestImage.count}`;
          document.getElementById('totalCount').textContent = latestImage.totalCount; 
          lastProcessedCam1ImageTimestamp = latestImage.timestamp;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  // Fetch and update data for Cam 2
  async function fetchDataForCam2() {
    try {
      const response = await fetch('/image-predict/cam2');
      const result = await response.json();
      updateChartData(headCountChart2, result);
      if (result.length > 0) {
        const latestImage = result[result.length - 1];
        if (lastProcessedCam2ImageTimestamp !== latestImage.timestamp) {
          document.getElementById('cam2Image').src = latestImage.imagePath;
          document.getElementById('cam2Count').textContent = `Count: ${latestImage.count}`;
          document.getElementById('totalCount').textContent = latestImage.totalCount; 
          lastProcessedCam2ImageTimestamp = latestImage.timestamp;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

// Fetch and update data for Cam 1 and Cam 2 every 30 seconds
setInterval(() => {
    fetchDataForCam1();
    fetchDataForCam2();
}, 8000);
