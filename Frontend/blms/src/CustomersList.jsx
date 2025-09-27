import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import './Admin.css';

const CustomersList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch('http://localhost:8082/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch customers');
                }
                const data = await response.json();
                
                const filteredCustomers = data.filter(user => user.role !== 'Admin');
                setCustomers(filteredCustomers);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    return (
        <>
            <AdminNavbar />
            <div className="admin-dashboard-container">
                <h2> Customer List</h2>
                <div className="dashboard-section" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div className="section-header">
                        <h3>📋 All Customers</h3>
                        <span className="count-badge repayment-badge">{customers.length}</span>
                    </div>
                    {loading ? (
                        <div className="loading-message">Loading customers...</div>
                    ) : error ? (
                        <div className="error-message">Error: {error}</div>
                    ) : (
                        <div className="dashboard-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.length > 0 ? (
                                        customers.map((customer) => (
                                            <tr key={customer.id}>
                                                <td className="customer-name">{customer.id}</td>
                                                <td className="customer-name">{customer.username}</td>
                                                <td>{customer.email}</td>
                                                <td>{customer.phone}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="empty-message">No customers found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CustomersList;