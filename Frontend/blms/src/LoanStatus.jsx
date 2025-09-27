import React, { useEffect, useState } from 'react';
import './RepaymentStatus.css';
import Navbar from './Navbar';
import Footer from './Footer';
import api from './api';
import { useNavigate } from 'react-router-dom';

const LoanStatus = () => {
  const [loanApplication, setLoanApplication] = useState(null);
  const [loanDetails, setLoanDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [firstPendingIndex, setFirstPendingIndex] = useState(-1);

  const fetchLoanStatus = async () => {
    setLoading(true);
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      if (!loggedInUser) {
        navigate('/login');
        return;
      }

      // First check for loan application
      try {
        const appResponse = await fetch(`http://localhost:8082/api/loan-applications/user/${loggedInUser.id}`);
        if (appResponse.ok) {
          const appData = await appResponse.json();
          setLoanApplication(appData);
        }
      } catch (err) {
        console.log('No loan application found');
      }

      // Then try to fetch repayment data (for accepted loans)
      try {
        const repaymentResponse = await api.get(`/api/repayments/${loggedInUser.id}`);
        const repaymentData = repaymentResponse.data;
        setLoanDetails(repaymentData.loan);
        setPaymentHistory(repaymentData.schedule);
        const index = repaymentData.schedule.findIndex(entry => entry.status.toLowerCase() === 'pending');
        setFirstPendingIndex(index);
      } catch (err) {
        if (err.response?.status === 404) {
          console.log('No repayment data found');
        }
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanStatus();
  }, [navigate]);

  const handlePayNow = async (repaymentId) => {
    try {
      const response = await api.post(`/api/repayments/pay/${repaymentId}`);
      alert('Payment successful! Any pending reminders have been cleared.');
      fetchLoanStatus();
      // Refresh the page to update reminders in navbar
      window.location.reload();
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data || 'An error occurred while processing the payment. Please try again.';
      alert(errorMessage);
    }
  };

  if (loading) return <div className="repayment-page">Loading...</div>;
  if (error) return <div className="repayment-page">{error}</div>;

  // Show loan application status if no repayment data
  if (loanApplication && !loanDetails) {
    return (
      <div>
        <Navbar /><br />
        <main>
          <section className="loan-summary">
            <div className={`badge ${loanApplication.status.toLowerCase()}`}>
              {loanApplication.status}
            </div>
            <h3>₹{loanApplication.loanAmount?.toLocaleString()}</h3>
            <div className="details">
              <p><strong>Tenure:</strong> {loanApplication.tenure} Years</p>
              <p><strong>Interest Rate:</strong> {loanApplication.interestRate}%</p>
              <p><strong>Status:</strong> {loanApplication.status}</p>
            </div>
            
            {loanApplication.status === 'Pending' && (
              <div className="status-message pending">
                <h4>Your loan application is under review</h4>
                <p>We will notify you once the review is complete.</p>
              </div>
            )}
            
            {loanApplication.status === 'Rejected' && (
              <div className="status-message rejected">
                <h4>Your loan application has been rejected</h4>
                {loanApplication.rejectionReason ? (
                  <p><strong>Reason:</strong> {loanApplication.rejectionReason}</p>
                ) : (
                  <p>Please contact our support team for more information.</p>
                )}
              </div>
            )}
            
            {loanApplication.status === 'Accepted' && (
              <div className="status-message accepted">
                <h4>Congratulations! Your loan has been approved</h4>
                <p>Your loan will be disbursed shortly.</p>
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Show repayment status if loan is disbursed
  if (!loanDetails) {
    return (
      <div>
        <Navbar /><br />
        <main>
          <div className="repayment-page">No loan details found.</div>
        </main>
      </div>
    );
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

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
          <div className="loan-summary" style={{ flex: 0.8 }}>
            <div className="badge">Amount Paid</div>
            <h3>₹{paymentHistory.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.emiAmount, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
          </div>
          
          <section className="loan-summary" style={{ flex: 1.4 }}>
            <div className="badge">Personal</div>
            <h3>₹{loanDetails.loanAmount}</h3>
            <div className="details">
              <p><strong>Tenure:</strong> {loanDetails.tenureMonths} Years</p>
              <p><strong>Interest Rate:</strong> {loanDetails.interestRate}%</p>
              <p><strong>Disbursed Date:</strong> {loanDetails.disbursedDate}</p>
            </div>
          </section>
          
          <div className="loan-summary" style={{ flex: 0.8 }}>
            <div className="badge">Amount Due</div>
            <h3>₹{paymentHistory.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.emiAmount, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
          </div>
        </div>

        <section className="payment-history">
          <h4>Loan Status</h4>
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
      <Footer />
    </div>
  );
};

export default LoanStatus;