import React, { useState, useEffect } from 'react';
import './Admin.css';
import AdminNavbar from './AdminNavbar';
 
const AdminPage = () => {
  const [loanApplications, setLoanApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [errorApplications, setErrorApplications] = useState(null);
  const [acceptedApplications, setAcceptedApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [repaymentStatus, setRepaymentStatus] = useState([]);
  const [paidCustomers, setPaidCustomers] = useState([]);
  const [pendingCustomers, setPendingCustomers] = useState([]);
  const [loadingRepayments, setLoadingRepayments] = useState(true);
  const [errorRepayments, setErrorRepayments] = useState(null);
 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false); // New state for reject modal
  const [rejectionFeedback, setRejectionFeedback] = useState(''); // New state for feedback
  const [currentRejectApplicationId, setCurrentRejectApplicationId] = useState(null); // New state for current rejected application
  const [showLoanApplications, setShowLoanApplications] = useState(false); // New state to toggle accepted/rejected applications view
 
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoadingApplications(true);
        const response = await fetch('http://localhost:8082/api/loan-applications');
        if (!response.ok) {
          throw new Error('Failed to fetch loan applications');
        }
        const data = await response.json();
       
        const pendingApplications = data.filter(app => app.status === 'Pending' || app.status === null);
        const acceptedApps = data.filter(app => app.status === 'Accepted');
        const rejectedApps = data.filter(app => app.status === 'Rejected');
 
        setLoanApplications(pendingApplications);
        setAcceptedApplications(acceptedApps);
        setRejectedApplications(rejectedApps);
 
      } catch (err) {
        setErrorApplications(err.message);
      } finally {
        setLoadingApplications(false);
      }
    };
 
    const fetchRepaymentStatus = async () => {
      try {
        setLoadingRepayments(true);
        
        // Fetch pending customers
        const pendingResponse = await fetch('http://localhost:8082/api/repayments/all');
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          setPendingCustomers(pendingData);
        }
        
        // Fetch paid customers
        const paidResponse = await fetch('http://localhost:8082/api/repayments/paid');
        if (paidResponse.ok) {
          const paidData = await paidResponse.json();
          setPaidCustomers(paidData);
        }
        
      } catch (err) {
        console.error('Error fetching repayment status:', err);
        setErrorRepayments(err.message);
      } finally {
        setLoadingRepayments(false);
      }
    };
 
    fetchAllData();
    fetchRepaymentStatus();
  }, []);
 
  const handleAction = (id, action) => {
    const customer = loanApplications.find(app => app.id === id) ||
                     acceptedApplications.find(app => app.id === id) ||
                     rejectedApplications.find(app => app.id === id);
    if (customer) {
      setSelectedCustomer(customer);
      setIsModalOpen(true);
    }
  };
 
  const handleAccept = async (id) => {
    try {
      const response = await fetch(`http://localhost:8082/api/loan-applications/${id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to accept loan application on the backend');
      }
     
      const acceptedApp = loanApplications.find(app => app.id === id);
      if (acceptedApp) {
        setAcceptedApplications(prev => [...prev, { ...acceptedApp, status: 'Accepted' }]);
        setLoanApplications(prev => prev.filter(app => app.id !== id));
      }
      closeModal();
    } catch (error) {
      console.error('Error accepting loan application:', error);
    }
  };
 
  const handleReject = (id) => {
    setCurrentRejectApplicationId(id);
    setIsRejectModalOpen(true);
  };
 
  const confirmReject = async () => {
    if (!rejectionFeedback.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8082/api/loan-applications/${currentRejectApplicationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: rejectionFeedback }),
      });
      if (!response.ok) {
        throw new Error('Failed to reject loan application on the backend');
      }
 
      const rejectedApp = loanApplications.find(app => app.id === currentRejectApplicationId);
      if (rejectedApp) {
        setRejectedApplications(prev => [...prev, { ...rejectedApp, status: 'Rejected', feedback: rejectionFeedback }]);
        setLoanApplications(prev => prev.filter(app => app.id !== currentRejectApplicationId));
      }
      closeRejectModal();
    } catch (err) {
      console.error(`Error rejecting application with ID ${currentRejectApplicationId}:`, err);
    }
  };
 
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };
 
  // Send reminder to customer for upcoming unpaid EMI
  const handleSendReminder = async (customerId) => {
    try {
      const res = await fetch(`http://localhost:8082/api/repayments/reminder/${customerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
      });
      if (!res.ok) {
        throw new Error('Failed to send reminder');
      }
      alert('Reminder sent successfully.');
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('Reminder action executed (no backend endpoint configured).');
    }
  };
 

 
  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectionFeedback('');
    setCurrentRejectApplicationId(null);
  };
 
  const renderTable = (applications, title, showActions) => (
    <div className="table-container">
      <h3>{title}</h3>
      <div className="table-scroll-wrapper">
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Loan Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.fullName}</td>
                  <td>{customer.loanAmount}</td>
                  <td>
                    <div className="action-buttons">
                      {showActions && (
                        <>
                          <button className="accept-btn" onClick={() => handleAccept(customer.id)}>Accept</button>
                          <button className="reject-btn" onClick={() => handleReject(customer.id)}>Reject</button>
                        </>
                      )}
                      <button className="view-details-btn" onClick={() => handleAction(customer.id, 'View Details')}>View Details</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="repayment-table-empty-message">No {title.toLowerCase()}.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
 
  return (
    <>
      <AdminNavbar />
      <div className="admin-dashboard-container">
        <h2>Admin Dashboard</h2>
 
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '1400px', margin: '0 auto', marginBottom: '2rem' }}>
          <div className="dashboard-section">
            <div className="section-header pending-header">
              <h3>📋 Pending Loan Applications</h3>
              <span className="count-badge pending-badge">{loanApplications.length}</span>
            </div>
            {loadingApplications ? (
              <div className="loading-message">Loading applications...</div>
            ) : errorApplications ? (
              <div className="error-message">Error: {errorApplications}</div>
            ) : (
              <div className="dashboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Loan Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loanApplications.length > 0 ? (
                      loanApplications.map((customer) => (
                        <tr key={customer.id}>
                          <td className="customer-name">{customer.fullName}</td>
                          <td className="loan-amount">₹{customer.loanAmount?.toLocaleString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="accept-btn" onClick={() => handleAccept(customer.id)}>Accept</button>
                              <button className="reject-btn" onClick={() => handleReject(customer.id)}>Reject</button>
                              <button className="view-btn" onClick={() => handleAction(customer.id, 'View Details')}>View</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="empty-message">No pending applications</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <div className="section-header repayment-header">
              <h3>💰 Customers Need to Pay</h3>
              <span className="count-badge repayment-badge">{pendingCustomers.length}</span>
            </div>
            {loadingRepayments ? (
              <div className="loading-message">Loading repayments...</div>
            ) : errorRepayments ? (
              <div className="error-message">Error: {errorRepayments}</div>
            ) : (
              <div className="dashboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Current EMI</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCustomers.length > 0 ? (
                      pendingCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="customer-name">{customer.customerName}</td>
                          <td className="emi-amount">₹{customer.nextEmiAmount?.toLocaleString()}</td>
                          <td>
                            <button className="reminder-btn" onClick={() => handleSendReminder(customer.id)}>
                              Send Reminder
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="empty-message">All customers are up to date</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Paid Customers Section */}
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="dashboard-section">
            <div className="section-header" style={{ borderBottom: '2px solid #28a745' }}>
              <h3 style={{ color: '#28a745' }}>✓ Customers Who Paid</h3>
              <span className="count-badge" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>{paidCustomers.length}</span>
            </div>
            {loadingRepayments ? (
              <div className="loading-message">Loading repayments...</div>
            ) : errorRepayments ? (
              <div className="error-message">Error: {errorRepayments}</div>
            ) : (
              <div className="dashboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Total Paid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidCustomers.length > 0 ? (
                      paidCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="customer-name">{customer.customerName}</td>
                          <td className="emi-amount">₹{(customer.totalPaidAmount || customer.loanAmount || 0).toLocaleString()}</td>
                          <td><span style={{ color: '#28a745', fontWeight: '600' }}>Paid</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="empty-message">No customers have completed payments</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {isModalOpen && selectedCustomer && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Customer Details</h4>
                <button onClick={closeModal} className="modal-close-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '28px', width: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <p className="detail-label">Full Name:</p>
                  <p className="detail-value">{selectedCustomer.fullName}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">DOB:</p>
                  <p className="detail-value">{selectedCustomer.dateOfBirth}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Email:</p>
                  <p className="detail-value">{selectedCustomer.emailAddress}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Contact:</p>
                  <p className="detail-value">{selectedCustomer.primaryContact}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Residential Address:</p>
                  <p className="detail-value">{selectedCustomer.residentialAddress}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Aadhar No:</p>
                  <p className="detail-value">{selectedCustomer.aadhar}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">PAN:</p>
                  <p className="detail-value">{selectedCustomer.pan}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Current Employer:</p>
                  <p className="detail-value">{selectedCustomer.currentEmployer}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Monthly Income:</p>
                  <p className="detail-value">₹{selectedCustomer.monthlyIncome}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Experience (In Years):</p>
                  <p className="detail-value">{selectedCustomer.experience}</p>
                </div>
                <div className="detail-row">
                  <p className="detail-label">Other Income:</p>
                  <p className="detail-value">{selectedCustomer.otherIncome}</p>
                </div>
                <div className="cibil-loan-details">
                  <div className="detail-row">
                    <p className="detail-label">CIBIL:</p>
                    <p className="detail-value">{selectedCustomer.cibilScore}</p>
                  </div>
                  <div className="detail-row">
                    <p className="detail-label">Loan Amount (in Rupees):</p>
                    <p className="detail-value">₹{selectedCustomer.loanAmount}</p>
                  </div>
                  <div className="detail-row">
                    <p className="detail-label">Interest (%):</p>
                    <p className="detail-value">{selectedCustomer.interestRate}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                
              </div>
            </div>
          </div>
        )}
 
        {/* Reject Loan Modal */}
        {isRejectModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content reject-modal-content">
              <h4 className="reject-modal-title">Reject Application</h4>
              <textarea
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                placeholder="Enter rejection reason..."
                className="rejection-textarea"
              ></textarea>
              <div className="reject-modal-actions">
                <button onClick={closeRejectModal} className="cancel-reject-btn">
                  Cancel
                </button>
                <button onClick={confirmReject} className="confirm-reject-btn">
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="footer">
        <p>©2025 Bank Loan Management System. All rights reserved.</p>
      </footer>
    </>
  );
};
 
export default AdminPage;