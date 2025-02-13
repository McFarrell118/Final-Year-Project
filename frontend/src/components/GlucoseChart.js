import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';
import './GlucoseChart.css';
import Header from './Header'; 
import Footer from './Footer'; 

// Register components that Chart.js needs
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

const GlucoseChart = ({ timestamps, glucoseValues }) => {
  const [timeRange, setTimeRange] = useState(24);
  const navigate = useNavigate();

  useEffect(() => {
    const customFillerPlugin = {
      id: 'customFillerPlugin',
      beforeDraw: (chart) => {
        const { ctx, chartArea: { top, bottom, left, right }, scales: { y } } = chart;
        const colors = [
          { min: 2.0, max: 4.0, color: 'rgba(255, 99, 132, 0.4)', label: 'Low' },
          { min: 4.0, max: 10.0, color: 'rgba(169, 169, 169, 0.4)', label: 'In Range' },
          { min: 10.0, max: 22.0, color: 'rgba(255, 159, 64, 0.4)', label: 'High' },
        ];
        colors.forEach(({ min, max, color }) => {
          const startY = y.getPixelForValue(min);
          const endY = y.getPixelForValue(max);
          ctx.fillStyle = color;
          ctx.fillRect(left, startY, right - left, endY - startY);
        });
      }
    };

    ChartJS.register(customFillerPlugin);

    return () => {
      ChartJS.unregister(customFillerPlugin);
    };
  }, []);

  // Filter the data based on the selected time range
  const now = new Date();
  const filteredTimestamps = timestamps.filter(timestamp => {
    const hoursAgo = (now - new Date(timestamp)) / (1000 * 60 * 60);
    return hoursAgo <= timeRange;
  });
  const startIndex = timestamps.indexOf(filteredTimestamps[0]);
  const filteredGlucoseValues = glucoseValues.slice(startIndex);

  const data = {
    labels: filteredTimestamps,
    datasets: [
      {
        label: 'Glucose Level',
        data: filteredGlucoseValues,
        borderColor: 'black',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Glucose Levels Over The Last ${timeRange} Hours`,
        font: {
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          parser: 'yyyy-MM-dd\'T\'HH:mm:ssxxx',
          tooltipFormat: 'MMM dd, yyyy HH:mm',
        },
        title: {
          display: true,
          text: 'Time',
          font: {
            weight: 'bold',
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Glucose (mmol/L)',
          font: {
            weight: 'bold',
          },
        },
        min: 2.0,
        max: 22.0,
      },
    },
    legend: {
      display: false // Hide the default legend
    }
  };




  return (
    <>
      <Header title="Diabetic Retinopathy Management" />  {/* Customize the title as needed */}
      <div className="chart-container">
        <div className="button-container">
          <button onClick={() => setTimeRange(3)}>Last 3 Hours</button>
          <button onClick={() => setTimeRange(6)}>Last 6 Hours</button>
          <button onClick={() => setTimeRange(12)}>Last 12 Hours</button>
          <button onClick={() => setTimeRange(24)}>Last 24 Hours</button>
        </div>
        <Line data={data} options={options} />
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color low"></span> Low
        </div>
        <div className="legend-item">
          <span className="legend-color in-range"></span> In Range
        </div>
        <div className="legend-item">
          <span className="legend-color high"></span> High
        </div>
      </div>
      <div className="navigation-buttons">
        <button onClick={() => navigate('/')}>Back to Home</button>
        <button onClick={() => navigate('/average-readings')}>Average Readings</button>
      </div>
      <Footer />  {/* Include the Footer component at the bottom */}
    </>
  );
};

export default GlucoseChart;
