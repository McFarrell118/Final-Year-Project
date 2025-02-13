import React, { useState } from 'react';
import axios from 'axios';
import './RetinaImages.css';
import { useNavigate } from 'react-router-dom'; 
import Header from './Header'; 
import Footer from './Footer'; 


const RetinaImages = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [prediction, setPrediction] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setPrediction('');
        setImageUrl('');
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("retinaImage", selectedFile);
        
        try {
            const response = await axios.post('http://localhost:5000/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPrediction(response.data.prediction);
            // Update this line to use the correct URL for the processed image
            setImageUrl(`http://localhost:5000${response.data.processedImageUrl}`);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };
    

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPrediction('');
        setImageUrl('');
        document.getElementById('fileInput').value = '';
    };


    const navigate = useNavigate(); // Initialize the navigate function for navigation

    return (
        <>
            <Header title="Diabetic Retinopathy Management" /> {/* Customize the title as needed */}
            <div className="container">
                <h2>Upload Retina Images for Diabetic Retinopathy Analysis</h2>
                <div className="input-group">
                    <input type="file" id="fileInput" onChange={handleFileChange} />
                </div>
                <div className="buttons">
                    <button onClick={handleUpload} disabled={!selectedFile}>Get Prediction</button>
                    {selectedFile && (
                        <button onClick={handleRemoveImage}>Remove Image</button>
                    )}
                </div>
                {prediction && <div className="prediction-result"><strong>Prediction Result:</strong> {prediction}</div>}
                {imageUrl && <div><img src={imageUrl} alt="Uploaded Retina"/></div>}
                <button className="back-button" onClick={() => navigate('/')}>Back to Home</button> {/* */}
            </div>
            <Footer /> {/* Include the Footer component at the bottom */}
        </>
    );
};

export default RetinaImages;
