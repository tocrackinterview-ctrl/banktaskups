import React, { useEffect, useState } from 'react';
import './RepaymentStatus.css';
import Navbar from './Navbar';
import api from './api';
import { useNavigate } from 'react-router-dom';

const RepaymentStatus = () => {
  const [loanDetails, setLoanDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [firstPendingIndex, setFirstPendingIndex] = useState(-1);

  const fetchRepaymentData = async () => {
    setLoading(true);
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      if (!loggedInUser) {
        navigate('/login');
        return;
      }

      // 1. Fetch the repayment schedule which includes loan details
      try {
        const repaymentResponse = await api.get(`/api/repayments/${loggedInUser.id}`);
        const repaymentData = repaymentResponse.data;

      // 2. Set loan details and payment history from the same response
      setLoanDetails(repaymentData.loan);
      
      setPaymentHistory(repaymentData.schedule);

      const index = repaymentData.schedule.findIndex(entry => entry.status.toLowerCase() === 'pending');
      setFirstPendingIndex(index);

        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          alert("No loan details found.");
          navigate('/');
          return;
        }
        setError('Failed to load data');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepaymentData();
  }, [navigate]);

  const handlePayNow = async (repaymentId) => {
    try {
      await api.post(`/api/repayments/pay/${repaymentId}`);
      alert('Payment successful! Any pending reminders have been cleared.');
      fetchRepaymentData();
      // Refresh the page to update reminders in navbar
      window.location.reload();
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred while processing the payment. Please try again.');
    }
  };

  const handleDownloadSchedule = () => {
    if (paymentHistory.length === 0) {
      alert('No repayment history to download.');
      return;
    }

    const headers = ["Due Date", "EMI Amount", "Status"];
    const rows = paymentHistory.map(entry => [
      new Date(entry.dueDate).toLocaleDateString('en-GB'),
      `₹${entry.emiAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      entry.status
    ]);

    
  };

  if (loading) return <div className="repayment-page">Loading...</div>;
  if (error) return <div className="repayment-page">{error}</div>;

  if (!loanDetails) {
    return null;
  }

  return (
    <div>
      <Navbar /><br />
      <main>
        {loanDetails.status === 'Overdue' && (
          <div className="alert-banner">
            Your EMI of ₹{loanDetails.emiAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} is overdue. Please pay now.
          </div>
        )}

        <section className="loan-summary">
          <div className="badge">Personal</div>
          <h3>₹{loanDetails.loanAmount}</h3>
          <div className="details">
            <p><strong>Tenure:</strong> {loanDetails.tenureMonths} Years</p>
            <p><strong>Interest Rate:</strong> {loanDetails.interestRate}%</p>
            <p><strong>Disbursed Date:</strong> {loanDetails.disbursedDate}</p>
          </div>
        </section>

        <section className="payment-history">
          <h4>Repayment Schedule</h4>
          <table>
            <thead>
              <tr>
                <th>Due Date</th>
                <th>EMI Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((entry, index) => (
                <tr key={index}>
                  <td>{new Date(entry.dueDate).toLocaleDateString('en-GB')}</td>
                  <td>₹{entry.emiAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td>
                    <span className={`status ${entry.status.toLowerCase()}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td>
                    {(() => {
                      const today = new Date();
                      const dueDate = new Date(entry.dueDate);
                      const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                      const isFirstEMI = index === 0;
                      const isWithin5Days = entry.status.toLowerCase() === 'pending' && daysDiff <= 5 && daysDiff >= 0;
                      
                      if (isFirstEMI && entry.status.toLowerCase() === 'pending') {
                        return (
                          <button
                            className="primary1"
                            onClick={() => handlePayNow(entry.id)}>
                            Pay Now
                          </button>
                        );
                      } else if (isWithin5Days) {
                        return (
                          <button
                            className="primary1"
                            onClick={() => handlePayNow(entry.id)}>
                            Pay Now
                          </button>
                        );
                      } else if (entry.status.toLowerCase() === 'pending' && daysDiff > 5) {
                        return (
                          <span className="payment-info">Available in {daysDiff - 5} days</span>
                        );
                      }
                      return null;
                    })()} 
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        
      </main>
      <footer className="footer">
        <p>© 2025 Bank Loan Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RepaymentStatus;