import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';
import loadimage from './homepage.jpg';
import loan from './loan_criteria.jpg';
import Footer from './Footer';


const HomePage = () => {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [showLoanPopup, setShowLoanPopup] = useState(false);
  const [notification, setNotification] = useState(''); // New state for notification
  const [reminders, setReminders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loanStatus, setLoanStatus] = useState(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
        fetchLoanStatus(userData.id);
        if (userData.role === 'Customer') {
          fetchReminders(userData.id);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLoanStatus = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8082/api/loan-applications/user/${userId}`);
      if (response.ok) {
        const loanData = await response.json();
        setLoanStatus(loanData.status);
      }
    } catch (error) {
      console.log('No loan application found');
    }
  };

  const fetchReminders = async (customerId) => {
    try {
      const response = await fetch(`http://localhost:8082/api/repayments/reminders/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const dismissReminder = async (reminderId) => {
    try {
      const response = await fetch(`http://localhost:8082/api/repayments/reminders/${reminderId}/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        // Refresh reminders after marking as read
        if (user && user.role === 'Customer') {
          fetchReminders(user.id);
        }
      }
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditData({ ...user });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:8082/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      // Fallback: Save locally if backend is not available
      const updatedUser = { ...user, ...editData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      alert('Profile updated locally (backend not available)');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleApplyLoan = () => {
    if (user) {
      navigate('/loan-applications');
    } else {
      navigate('/login');
    }
  };

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  const openLoanPopup = () => setShowLoanPopup(true);
  const closeLoanPopup = () => setShowLoanPopup(false);

  return (
  <div
    className={`homepage ${activeModal ? 'blur-background' : ''}`}
    style={{
      backgroundImage: `url(${loadimage})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      height: '100%',
      
    }}
  >
      {/* Reminder Notifications */}
      {user && user.role === 'Customer' && reminders.length > 0 && (
        <div style={{
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '10px 20px',
          textAlign: 'center',
          fontWeight: 'bold',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            {reminders[0].message}
          </div>
          <button 
            onClick={() => dismissReminder(reminders[0].id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0 10px'
            }}
            title="Dismiss reminder"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Navbar */}
      <nav className="navbar" style={{ marginTop: user && user.role === 'Customer' && reminders.length > 0 ? '60px' : '0' }}>
        <div className="nav-left">
          <div className="logo1">🏦 TrustLine</div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><a href="#about">About</a></li>
            <li><a href="#loan">Criteria</a></li>
            <li><Link to="/emi">EMI Calculator</Link></li>
            {user && <li><Link to="/loan-status">Loan Status</Link></li>}
            
          </ul>
        </div>
        <div className="nav-actions">
          {user ? (
                    <div ref={profileRef} style={{ position: 'relative' }}>
                        <div className="profile-logo" onClick={toggleProfile}>
                            👤
                        </div>
                        {showProfile && (
                            <div className="profile-dropdown">
                                {!isEditing ? (
                    <>
                      <p><strong>Name:</strong> {user.name}</p>
                      <p><strong>Username:</strong> {user.username}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Phone:</strong> {user.phone}</p>
                      <button className="nav-btn" onClick={handleEdit} style={{ marginTop: '10px', marginRight: '5px' }}>
                        Edit
                      </button>
                      <button className="nav-btn" onClick={handleLogout} style={{ marginTop: '10px' }}>
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Name:</strong>
                        <input 
                          type="text" 
                          value={editData.name || ''} 
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          style={{ marginLeft: '5px', padding: '2px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Username:</strong>
                        <input 
                          type="text" 
                          value={editData.username || ''} 
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          style={{ marginLeft: '5px', padding: '2px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Email:</strong>
                        <input 
                          type="email" 
                          value={editData.email || ''} 
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          style={{ marginLeft: '5px', padding: '2px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Phone:</strong>
                        <input 
                          type="text" 
                          value={editData.phone || ''} 
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          style={{ marginLeft: '5px', padding: '2px' }}
                        />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Password:</strong>
                        <input 
                          type="password" 
                          value={editData.password || ''} 
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          style={{ marginLeft: '5px', padding: '2px', width: '90px' }}
                          placeholder="Enter new password"
                        />
                      </div>
                      <button className="nav-btn" onClick={handleSave} style={{ marginTop: '10px', marginRight: '5px' }}>
                        Save
                      </button>
                      <button className="nav-btn" onClick={handleCancel} style={{ marginTop: '10px' }}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-btn">Login</Link>
              <Link to="/signup" className="nav-btn">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Loan Status Notification */}
      {user && loanStatus && (
        <div className={`loan-notification ${loanStatus.toLowerCase()}`}>
          {loanStatus === 'Pending' && (
            <p>🔄 Your loan application is under review. We'll notify you once it's processed.</p>
          )}
          {loanStatus === 'Accepted' && (
            <p>🎉 Congratulations! Your loan has been approved. Check your loan status for details.</p>
          )}
          {loanStatus === 'Rejected' && (
            <p>❌ Your loan application was not approved. Contact support for more information.</p>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to TrustLine Bank</h1>
          <p>
            At TrustLine Bank, we believe that financial empowerment begins <br/> with trust, transparency, and personalized care.
            Whether you're <br/>planning a wedding, renovating your home, consolidating debt, or <br/>funding a milestone, our personal loan solutions
            are designed to support your journey with confidence.
          </p>
          <button className="cta-btn" onClick={handleApplyLoan}>Apply for a Loan</button>
        </div>
      </section>

        <section className="loan-box-wrapper" id="loan">
        <div className="loan-box" onClick={openLoanPopup}>
            <img src={loan} alt="Loan Icon" className="loan-box-image" />
            <h2>Personal Loan</h2>
            <p>To apply for personal the customer must need to satisfy the below criteria.</p>
            <button className="criteria-btn">Criteria</button>
        </div>
      </section>
      
      {/* Cota Capital Section */}
      <section className="cota-section" id="about">
        <div className="cota-overlay">
          <div className="cota-text">
            <h2>Why To Choose Us?</h2>
            <div className="cota-points">
              <div>
                <h3>Fast Approvals</h3>
                <p>Get your loan approved within minutes with our streamlined digital process.</p>
              </div>
              <div>
                <h3>Flexible Payments</h3>
                <p>Choose repayment plans that fit your lifestyle and financial goals.</p>
              </div>
              <div>
                <h3>No Prepayment Fees</h3>
                <p>Repay early anytime without penalties or hidden charges.</p>
              </div>
            </div>
            <div className="cota-buttons">
              <button onClick={() => openModal('approach')}>Our Approach</button>
              <button onClick={() => openModal('values')}>Our Values</button>
              <button onClick={() => openModal('team')}>Our Team</button>
            </div>
          </div>
         
        </div>
      </section>

      {/* Loan Criteria Box */}
      


      <Footer />
      {/* Modal Section */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>×</button>
            {activeModal === 'approach' && (
              <>
                <h2>Our Approach</h2>
                <p>We invest in visionary teams building transformative technologies. Our approach blends strategic guidance with long-term partnership to help companies scale sustainably.</p>
              </>
            )}
            {activeModal === 'values' && (
              <>
                <h2>Our Values</h2>
                <p>Integrity, innovation, and collaboration are at the heart of everything we do. We believe in empowering founders and fostering a culture of trust and transparency.</p>
              </>
            )}
            {activeModal === 'team' && (
              <>
                <h2>Our Team</h2>
                <p>Our team is composed of experienced investors, technologists, and operators who bring deep domain expertise and a passion for building enduring companies.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Loan Criteria Popup */}
      {showLoanPopup && (
        <div className="modal-overlay" onClick={closeLoanPopup}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeLoanPopup}>×</button>
            <h2>Personal Loan Eligibility Criteria</h2>
            <ul>
              <li>Age: 21 to 60 years</li>
              <li>Minimum monthly income: ₹25,000</li>
              <li>Valid PAN and Aadhaar card</li>
              <li>Stable employment for at least 1 year</li>
              <li>Good credit history (CIBIL score above 700 preferred)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;