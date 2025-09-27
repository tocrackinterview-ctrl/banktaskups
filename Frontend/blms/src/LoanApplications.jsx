import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import './Admin.css';

const LoanApplications = () => {
  const [acceptedApplications, setAcceptedApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('http://localhost:8082/api/loan-applications');
        const data = await response.json();
        
        setAcceptedApplications(data.filter(app => app.status === 'Accepted'));
        setRejectedApplications(data.filter(app => app.status === 'Rejected'));
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <AdminNavbar />
      <div className="admin-dashboard-container">
        <h2>Loan Applications</h2>
        
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ flex: 1 }}>
            <div className="table-container">
              <h3>Accepted Applications</h3>
              <div className="table-scroll-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Loan Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acceptedApplications.length > 0 ? (
                      acceptedApplications.map((app) => (
                        <tr key={app.id}>
                          <td>{app.fullName}</td>
                          <td>₹{app.loanAmount?.toLocaleString()}</td>
                          <td><span className="status accepted">{app.status}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="repayment-table-empty-message">No accepted applications.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="table-container">
              <h3>Rejected Applications</h3>
              <div className="table-scroll-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Loan Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedApplications.length > 0 ? (
                      rejectedApplications.map((app) => (
                        <tr key={app.id}>
                          <td>{app.fullName}</td>
                          <td>₹{app.loanAmount?.toLocaleString()}</td>
                          <td><span className="status rejected">{app.status}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="repayment-table-empty-message">No rejected applications.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="footer">
        <p>© 2025 Bank Loan Management System. All rights reserved.</p>
      </footer>
    </>
  );
};

export default LoanApplications;