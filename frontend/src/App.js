import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlucoseChart from './components/GlucoseChart';
import Home from './components/Home';
import RetinaImages from './components/RetinaImages';
import AverageReadingsPage from './components/AverageReadingsPage';

function App() {
  const [glucoseData, setGlucoseData] = useState({ records: [] });

  useEffect(() => {
    // Make the API call to fetch glucose readings
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/egvs');
        const data = await response.json();
        setGlucoseData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Convert glucose values from mg/dL to mmol/L
  const convertToMmolL = (mgdL) => (mgdL * 0.0555).toFixed(1);
  const timestamps = glucoseData.records?.map(record => record.displayTime) ?? [];
  const glucoseValues = glucoseData.records?.map(record => convertToMmolL(record.value)) ?? [];

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/glucose-chart" element={
          <div className="App">
            <GlucoseChart timestamps={timestamps} glucoseValues={glucoseValues} />
          </div>
        } />
        <Route path="/retina-images" element={<RetinaImages />} />
        <Route path="/average-readings" element={
          <AverageReadingsPage glucoseData={glucoseData} />
        } />
      </Routes>
    </Router>
  );
}

export default App;
