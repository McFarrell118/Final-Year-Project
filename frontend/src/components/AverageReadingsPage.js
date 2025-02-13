import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom'; 
import './AverageReadingsPage.css'; 
import Header from './Header'; 
import Footer from './Footer'; 



// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AverageReadingsPage = ({ glucoseData }) => {
  const [selectedRange, setSelectedRange] = useState(3); // Default to 3 days
  const [averageGlucose, setAverageGlucose] = useState(0); // For displaying average glucose in mmol/L
  const [dataForSelectedRange, setDataForSelectedRange] = useState({ Low: 0, InRange: 0, High: 0 });
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const calculatePercentagesAndAverage = (days) => {
      const endDate = dayjs();
      const startDate = endDate.subtract(days, 'day');
      const filteredReadings = glucoseData.records.filter(record => {
        const recordDate = dayjs(record.displayTime);
        return recordDate.isAfter(startDate) && recordDate.isBefore(endDate);
      });

      let low = 0, inRange = 0, high = 0, totalGlucose = 0;
      filteredReadings.forEach(record => {
        const value = parseFloat(record.value); //  value is in mg/dL
        totalGlucose += value;
        if (value < 70) low++; // Example threshold for mg/dL
        else if (value <= 180) inRange++; // Example threshold for mg/dL
        else high++;
      });

      const total = low + inRange + high;
      const averageMmolL = total > 0 ? ((totalGlucose / total) / 18).toFixed(1) : 0; // Convert average to mmol/L

      setDataForSelectedRange({
        Low: total ? ((low / total) * 100).toFixed(1) : 0,
        InRange: total ? ((inRange / total) * 100).toFixed(1) : 0,
        High: total ? ((high / total) * 100).toFixed(1) : 0,
      });
      setAverageGlucose(averageMmolL); // Set the converted average
    };

    calculatePercentagesAndAverage(selectedRange);
  }, [selectedRange, glucoseData]);

  const data = {
    labels: ['Glucose Levels'],
    datasets: [
      {
        label: 'Low',
        data: [dataForSelectedRange.Low],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        stack: 'Stack 0',
      },
      {
        label: 'In Range',
        data: [dataForSelectedRange.InRange],
        backgroundColor: 'rgba(129, 199, 132, 0.5)',
        stack: 'Stack 0',
      },
      {
        label: 'High',
        data: [dataForSelectedRange.High],
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        stack: 'Stack 0',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100,  // Ensuring the Y-axis does not extend beyond 100%
        ticks: {
          stepSize: 10,  // Consistent 10% step size for all ranges
          callback: value => `${value}%`
        },
        title: { 
          display: true, 
          text: 'Percentages in Ranges',
          font: { weight: 'bold' }, 
        },
      },
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Time in Range' },
    },
  };
  
  

  return (
    <>
      <Header title="Diabetic Retinopathy Management" />
      <div className="button-group">
        <button onClick={() => setSelectedRange(3)}>3 Days</button>
        <button onClick={() => setSelectedRange(7)}>7 Days</button>
        <button onClick={() => setSelectedRange(14)}>14 Days</button>
      </div>
      <Bar options={options} data={data} />
      <p className="average-readings-p">
        Average glucose reading for the past <strong>{selectedRange} days</strong> was <strong>{averageGlucose} mmol/L</strong>
      </p>
      <p className="average-readings-p important-p">
        Based on your average glucose reading for the past 14 days, analyze the chart below to see where it falls. If it falls within the action suggested segment, you may be at risk of diabetic retinopathy and may need a retina scan if glucose levels persist.
      </p>
      <img src="/Images/Diabetes-chart.png" alt="Diabetes chart" className="diabetes-chart" />
      <button className="navigation-button" onClick={() => navigate('/glucose-chart')}>Back to Glucose Chart</button>
      <Footer />
    </>
  );
  
};

export default AverageReadingsPage;
