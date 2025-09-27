import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api';
import './Navbar.css';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const profileRef = useRef(null);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            const userData = JSON.parse(loggedInUser);
            setUser(userData);
            setEditData(userData);
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

    const handleCancel = () => {
        setIsEditing(false);
        setEditData(user);
    };

    const handleSave = async () => {
        try {
            const response = await api.put(`/users/${user.id}`, editData);
            const updatedUser = response.data;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    };

    const handleInputChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <nav className="navbar">
            <div className="logo1" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>🏦 TrustLine</div>
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/emi">EMI Calculator</Link></li>
                {user && (
                    <li><Link to="/loan-status">Loan Status</Link></li>
                )}
            </ul>
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
                                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                            <button 
                                                className="nav-btn" 
                                                onClick={handleEdit}
                                                style={{ 
                                                    backgroundColor: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Edit Profile
                                            </button>
                                            <button 
                                                className="nav-btn" 
                                                onClick={handleLogout}
                                                style={{
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label><strong>Name:</strong></label>
                                            <input 
                                                type="text" 
                                                value={editData.name || ''} 
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                style={{ width: '75%', padding: '5px', marginTop: '5px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label><strong>Username:</strong></label>
                                            <input 
                                                type="text" 
                                                value={editData.username || ''} 
                                                onChange={(e) => handleInputChange('username', e.target.value)}
                                                style={{ width: '64%', padding: '5px', marginTop: '5px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label><strong>Email:</strong></label>
                                            <input 
                                                type="email" 
                                                value={editData.email || ''} 
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                style={{ width: '76%', padding: '5px', marginTop: '5px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label><strong>Phone:</strong></label>
                                            <input 
                                                type="tel" 
                                                value={editData.phone || ''} 
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                style={{ width: '74%', padding: '5px', marginTop: '5px' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <label><strong>Password:</strong></label>
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <input 
                                                    type={showPassword ? "text" : "password"} 
                                                    value={editData.password || ''} 
                                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                                    style={{ width: '80%', padding: '5px', paddingRight: '25px' }}
                                                    placeholder="Enter new password"
                                                />
                                                <span 
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '5px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {showPassword ? (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                            <circle cx="12" cy="12" r="3"/>
                                                        </svg>
                                                    ) : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                                        </svg>
                                                    )}
                                                </span>
                                            </div>
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
                    <></>
                    
                )}
            </div>
        </nav>
    );
};

export default Navbar;