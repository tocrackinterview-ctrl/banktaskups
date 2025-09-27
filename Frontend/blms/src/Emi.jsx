import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Emi.css';
import loadimage from './emi.png';
import Navbar from './Navbar';
import Footer from './Footer';
 
const EMICalculator = () => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [emiDetails, setEmiDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const FIXED_RATE = 7.4;
  const calculateEMI = () => {
    const P = parseFloat(principal);
    const R = FIXED_RATE / 12 / 100;
    const N = parseFloat(tenure) * 12;
 
    if (P && R && N) {
      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      const totalPayment = emi * N;
      const totalInterest = totalPayment - P;
 
      setEmiDetails({
        emi: emi.toFixed(2),
        principal: P.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
      });
      setShowModal(true);
    } else {
      setEmiDetails(null);
      setShowModal(false);
    }
  };
 
  const closeModal = () => setShowModal(false);
 
  return (
    <div className="homepage">
      {/* Navbar */}
      <Navbar />
 
      {/* EMI Calculator Section */}
      <main className="emi-container">
        <div className="emi-content">
          {/* Left: EMI Form */}
          <div className="emi-form">
            <h2>EMI Calculator</h2>
            <input
              type="number"
              placeholder="Loan Amount"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
             
            <input
              type="number"
              placeholder="Loan Tenure (Years)"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
            />
 
            <p className="text-sm text-gray-500">
              Annual Interest Rate: {FIXED_RATE}% (Fixed)
            </p>
            <br/>
            <button onClick={calculateEMI}>Calculate EMI</button>
          </div>
 
          {/* Right: Image */}
          <div className="emi-image">
            <img src={loadimage} alt="Loan Illustration" />
          </div>
        </div>
      </main>
 
      {/* Modal Popup */}
      {showModal && emiDetails && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="close-btn" onClick={closeModal}>×</button>
            <h3>Loan Summary</h3>
            <p><strong>Monthly EMI:</strong> ₹{emiDetails.emi}</p>
            <p><strong>Principal Amount:</strong> ₹{emiDetails.principal}</p>
            <p><strong>Total Interest:</strong> ₹{emiDetails.totalInterest}</p>
            <p><strong>Total Amount Payable:</strong> ₹{emiDetails.totalPayment}</p>
          </div>
        </div>
      )}
 
      <Footer/>
    </div>
  );
};
 
export default EMICalculator;