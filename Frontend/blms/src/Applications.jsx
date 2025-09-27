import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import './Applications.css';

const Applications = () => {
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

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <>
      <AdminNavbar />
      <div className="applications-container">
        <div className="applications-header">
          <h1>Loan Applications</h1>
        </div>
        
        <div className="applications-grid">
          <div className="application-section accepted-section">
            <div className="section-header accepted-header">
              <h2>✅ Accepted Applications</h2>
              <span className="count-badge accepted-badge">{acceptedApplications.length}</span>
            </div>
            <div className="applications-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Loan Amount</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedApplications.length > 0 ? (
                    acceptedApplications.map((app) => (
                      <tr key={app.id}>
                        <td className="customer-name">{app.fullName}</td>
                        <td className="loan-amount">₹{app.loanAmount?.toLocaleString()}</td>
                        <td>{new Date(app.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td><span className="status-badge accepted">Accepted</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-message">No accepted applications found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="application-section rejected-section">
            <div className="section-header rejected-header">
              <h2>❌ Rejected Applications</h2>
              <span className="count-badge rejected-badge">{rejectedApplications.length}</span>
            </div>
            <div className="applications-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Loan Amount</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedApplications.length > 0 ? (
                    rejectedApplications.map((app) => (
                      <tr key={app.id}>
                        <td className="customer-name">{app.fullName}</td>
                        <td className="loan-amount">₹{app.loanAmount?.toLocaleString()}</td>
                        <td>{new Date(app.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td><span className="status-badge rejected">Rejected</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-message">No rejected applications found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Applications;