// Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../Home.css';
import Header from './Header';  
import Footer from './Footer';  

const Home = () => {
  return (
    <>
      <Header title="Diabetic Retinopathy Management" />  {/* Header with custom title */}
      <div className="home-container">
        <h1>Welcome to my diabetic retinopathy management web application</h1>
        <p>Welcome to a digital assistant for managing diabetes retinopathy. The aim of this application is to allow users to upload retina images to detect for diabetic retinopathy but also connect their Dexcom CGM device to get a visual representation of their blood glucose management.</p>
        {/* Image added below */}
        <img src="/Images/FYPhomepagepic.png" alt="Diabetes Retinopathy Management" />
        <div className="navigation-links">
          <Link to="/glucose-chart" className="link-button">View Dexcom Data</Link>
          <Link to="/retina-images" className="link-button">Check Retina Images</Link>
        </div>
      </div>
      <Footer />  {/* Footer for additional site information or links */}
    </>
  );
};

export default Home;
