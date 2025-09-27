import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import api from './api';
import './LoanApplicationForm.css';


const LoanApplicationForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        residentialAddress: '',
        maritalStatus: '',
        aadhar: '',
        primaryContact: '',
        secondaryContact: '',
        pan: '',
        emailAddress: '',
        currentEmployer: '',
        monthlyIncome: '',
        positionTitle: '',
        experience: '',
        otherIncome: '',
        loanAmount: '',
        tenure: '',
        cibilScore: '',
        userId: null,
    });
    const [hasPendingApplication, setHasPendingApplication] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [phoneError, setPhoneError] = useState('');
    const [secondaryPhoneError, setSecondaryPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            const user = JSON.parse(loggedInUser);
            const userId = user.id;
            setFormData(prev => ({ ...prev, userId }));
            checkUserApplicationStatus(userId);
        }
    }, []);

    const checkUserApplicationStatus = async (userId) => {
        if (!userId) return;

        try {
            const response = await api.get(`/api/loan-applications/check-status/${userId}`);
            const data = response.data;
            setHasPendingApplication(data.hasPending);
            if (data.hasPending) {
                setMessage({
                    text: 'You have a pending or accepted loan application and cannot submit another.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error checking application status:', error);
        }
    };

    const validatePhone = (phone) => {
        if (!/^[6-9]\d{9}$/.test(phone)) {
            return 'Phone number must be 10 digits starting with 6, 7, 8, or 9';
        }
        if (/^(?:0123456789|1234567890|9876543210)$/.test(phone)) {
            return 'Phone number cannot be sequential numbers';
        }
        return '';
    };

    const validateEmail = (email) => {
        const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address';
        }
        
        const domain = email.split('@')[1]?.toLowerCase();
        if (!validDomains.includes(domain)) {
            return 'Please use a valid email domain (gmail.com, yahoo.com, outlook.com, hotmail.com, icloud.com, protonmail.com)';
        }
        
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'aadhar' && !/^\d{0,12}$/.test(value)) return;
        if (name === 'cibilScore' && !/^\d{0,3}$/.test(value)) return;
        
        if (name === 'primaryContact') {
            if (value === '' || /^\d*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
                if (value.length === 1 && !/^[6-9]/.test(value)) {
                    setPhoneError('Phone number must start with 6, 7, 8, or 9');
                } else if (value.length === 1) {
                    setPhoneError('');
                }
                if (value.length === 10) {
                    setPhoneError(validatePhone(value));
                } else if (value.length < 10 && value.length > 1) {
                    setPhoneError('');
                }
            }
            return;
        }
        
        if (name === 'secondaryContact') {
            if (value === '' || /^\d*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
                if (value.length === 1 && !/^[6-9]/.test(value)) {
                    setSecondaryPhoneError('Phone number must start with 6, 7, 8, or 9');
                } else if (value.length === 1) {
                    setSecondaryPhoneError('');
                }
                if (value.length === 10) {
                    setSecondaryPhoneError(validatePhone(value));
                } else if (value.length < 10 && value.length > 1) {
                    setSecondaryPhoneError('');
                }
            }
            return;
        }
        
        if (name === 'emailAddress') {
            setFormData(prev => ({ ...prev, [name]: value }));
            if (value) {
                setEmailError(validateEmail(value));
            } else {
                setEmailError('');
            }
            return;
        }
        
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setIsLoading(true);

        try {
            if (!formData.userId) {
                setMessage({ text: 'User ID is missing. Please log in to apply for a loan.', type: 'error' });
                return;
            }

            if (hasPendingApplication) {
                 setMessage({ text: 'You already have a pending or accepted loan application.', type: 'error' });
                 return;
            }

            if (!/^\d{12}$/.test(formData.aadhar)) {
                alert('Aadhar must be exactly 12 digits.');
                setMessage({ text: 'Aadhar must be exactly 12 digits.', type: 'error' });
                return;
            }

            if (!/^\d{10}$/.test(formData.primaryContact)) {
                alert('Primary contact must be exactly 10 digits.');
                setMessage({ text: 'Primary contact must be exactly 10 digits.', type: 'error' });
                return;
            }

            if (phoneError) {
                alert(phoneError);
                setMessage({ text: phoneError, type: 'error' });
                return;
            }

            if (formData.secondaryContact && !/^\d{10}$/.test(formData.secondaryContact)) {
                alert('Secondary contact must be exactly 10 digits.');
                setMessage({ text: 'Secondary contact must be exactly 10 digits.', type: 'error' });
                return;
            }

            if (secondaryPhoneError) {
                alert(secondaryPhoneError);
                setMessage({ text: secondaryPhoneError, type: 'error' });
                return;
            }

            if (emailError) {
                alert(emailError);
                setMessage({ text: emailError, type: 'error' });
                return;
            }

            const age = calculateAge(formData.dateOfBirth);
            if (age < 21 || age > 60) {
                alert('Applicant must be between 21 and 60 years of age.');
                setMessage({ text: 'Applicant must be between 21 and 60 years of age.', type: 'error' });
                return;
            }

            const cibil = parseInt(formData.cibilScore, 10);
            if (isNaN(cibil) || cibil < 300 || cibil > 900) {
                alert('CIBIL score must be between 300 and 900.');
                setMessage({ text: 'CIBIL score must be between 300 and 900.', type: 'error' });
                return;
            }
            
            await api.post('/api/loan-applications', formData);
            alert('Application submitted successfully!');
            setMessage({ text: 'Application submitted successfully!', type: 'success' });
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            console.error('Submission error:', error);
            setMessage({ text: 'An unexpected error occurred. Please try again.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f7f6;
                        color: #333;
                        margin: 0;
                    }
                    
                    
                    .loan-form-container {
                        max-width: 800px;
                        margin: 2rem auto;
                        padding: 2rem;
                        background-color: #fff;
                        border-radius: 10px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    }
                    .form-title {
                        text-align: center;
                        color: #004d40;
                        margin-bottom: 0.5rem;
                    }
                    .form-description {
                        text-align: center;
                        color: #666;
                        margin-bottom: 2rem;
                        font-size: 0.9rem;
                    }
                    .form-section {
                        border-bottom: 1px solid #eee;
                        padding-bottom: 1.5rem;
                        margin-bottom: 1.5rem;
                    }
                    .form-section h3 {
                        color: #004d40;
                        margin-top: 0;
                        margin-bottom: 1rem;
                        font-size: 1.2rem;
                    }
                    .form-row {
                        display: flex;
                        gap: 1rem;
                        margin-bottom: 1rem;
                    }
                    .form-row .form-group {
                        flex: 1;
                    }
                    .form-group {
                        margin-bottom: 1rem;
                    }
                    .form-group label {
                        display: block;
                        font-weight: bold;
                        margin-bottom: 0.5rem;
                        color: #555;
                    }
                    .form-group input, .form-group select, .form-group textarea {
                        width: 100%;
                        padding: 0.75rem;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        box-sizing: border-box;
                    }
                    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                        border-color: #00796b;
                        outline: none;
                    }
                    .submit-btn {
                        display: block;
                        width: 100%;
                        padding: 1rem;
                        background-color: #00796b;
                        color: #fff;
                        font-size: 1.1rem;
                        font-weight: bold;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background-color 0.3s ease;
                    }
                    .submit-btn:hover {
                        background-color: #004d40;
                    }
                    .submit-btn:disabled {
                        background-color: #ccc;
                        cursor: not-allowed;
                    }
                    .footer {
                        text-align: center;
                        padding: 1.5rem;
                        color: #999;
                        font-size: 0.8rem;
                        margin-top: 2rem;
                    }
                    .message-box {
                        padding: 1rem;
                        border-radius: 5px;
                        margin-bottom: 1rem;
                        font-weight: bold;
                    }
                    .message-box.success {
                        background-color: #e8f5e9;
                        color: #2e7d32;
                        border: 1px solid #c8e6c9;
                    }
                    .message-box.error {
                        background-color: #ffebee;
                        color: #c62828;
                        border: 1px solid #ffcdd2;
                    }
                    .loading-indicator {
                        text-align: center;
                        padding: 1rem;
                        font-style: italic;
                        color: #666;
                    }
                `}
            </style>
            <Navbar />
            <div className="loan-form-container">
                <h2 className="form-title">Loan Application Form</h2>
                <p className="form-description">
                    Please complete this form to apply for a loan. Ensure all information is accurate and up to date.
                </p>

                {hasPendingApplication ? (
                    <div className={`message-box ${message.type}`}>
                        {message.text}
                    </div>
                ) : (
                    <>
                        {message.text && (
                            <div className={`message-box ${message.type}`}>
                                {message.text}
                            </div>
                        )}
                        
                        {isLoading && (
                            <div className="loading-indicator">Submitting...</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h3>Personal Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="fullName">Full Name <span style={{color: 'red'}}>*</span></label>
                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="dateOfBirth">Date of Birth <span style={{color: 'red'}}>*</span></label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            max={new Date().toISOString().split("T")[0]}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="gender">Gender <span style={{color: 'red'}}>*</span></label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="aadhar">Aadhar <span style={{color: 'red'}}>*</span></label>
                                        <input
                                            type="text"
                                            name="aadhar"
                                            value={formData.aadhar}
                                            onChange={handleChange}
                                            placeholder="12 digit Aadhar"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="maritalStatus">Marital Status <span style={{color: 'red'}}>*</span></label>
                                        <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} required>
                                            <option value="">Select</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Divorced">Divorced</option>
                                            <option value="Widowed">Widowed</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="pan">PAN <span style={{color: 'red'}}>*</span></label>
                                        <input
                                            type="text"
                                            name="pan"
                                            value={formData.pan}
                                            onChange={handleChange}
                                            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                                            title="PAN must be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="residentialAddress">Residential Address <span style={{color: 'red'}}>*</span></label>
                                    <textarea
                                        name="residentialAddress"
                                        value={formData.residentialAddress}
                                        onChange={handleChange}
                                        required
                                        rows="4"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Contact Details</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="primaryContact">Primary Contact <span style={{color: 'red'}}>*</span></label>
                                        <input 
                                            type="text" 
                                            name="primaryContact" 
                                            value={formData.primaryContact} 
                                            onChange={handleChange} 
                                            maxLength="10"
                                            required 
                                        />
                                        {phoneError && <div style={{color: 'red', fontSize: '12px', marginTop: '5px'}}>{phoneError}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="secondaryContact">Secondary Contact</label>
                                        <input 
                                            type="text" 
                                            name="secondaryContact" 
                                            value={formData.secondaryContact} 
                                            onChange={handleChange} 
                                            maxLength="10"
                                        />
                                        {secondaryPhoneError && <div style={{color: 'red', fontSize: '12px', marginTop: '5px'}}>{secondaryPhoneError}</div>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="emailAddress">Email Address <span style={{color: 'red'}}>*</span></label>
                                    <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} required />
                                    {emailError && <div style={{color: 'red', fontSize: '12px', marginTop: '5px'}}>{emailError}</div>}
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Employment & Income Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="currentEmployer">Current Employer <span style={{color: 'red'}}>*</span></label>
                                        <input type="text" name="currentEmployer" value={formData.currentEmployer} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="monthlyIncome">Monthly Income <span style={{color: 'red'}}>*</span></label>
                                        <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} required />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="positionTitle">Position Title <span style={{color: 'red'}}>*</span></label>
                                        <input type="text" name="positionTitle" value={formData.positionTitle} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="experience">Experience (in years) <span style={{color: 'red'}}>*</span></label>
                                        <input type="text" name="experience" value={formData.experience} onChange={handleChange} required />
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="otherIncome">Other Income</label>
                                        <input type="text" name="otherIncome" value={formData.otherIncome} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="loanAmount">Loan Amount <span style={{color: 'red'}}>*</span></label>
                                        <input
                                            type="number"
                                            name="loanAmount"
                                            max="1000000"
                                            placeholder="Max 10 Lakhs"
                                            value={formData.loanAmount}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="tenure">Tenure <span style={{color: 'red'}}>*</span></label>
                                        <input
                                            type="number"
                                            placeholder="upto 7 years"
                                            max="7"
                                            name="tenure"
                                            value={formData.tenure}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="cibilScore">CIBIL Score <span style={{color: 'red'}}>*</span></label>
                                    <input
                                        type="number"
                                        name="cibilScore"
                                        value={formData.cibilScore}
                                        onChange={handleChange}
                                        placeholder="300 - 900"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isLoading || hasPendingApplication}>
                                {isLoading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </form>
                    </>
                )}
            </div>

            <footer className="footer">
                <p>© 2025 Bank Loan Management System. All rights reserved.</p>
            </footer>

        </>
    );
};

export default LoanApplicationForm;
