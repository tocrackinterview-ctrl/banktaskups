import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const AdminNavbar = () => {
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
            setUser(JSON.parse(loggedInUser));
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
                alert('Failed to update profile');
            }
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
            <div className="logo1" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>🏦 TrustLine</div>
            <ul className="nav-links">
                <li><Link to="/admin">Home</Link></li>
                <li><Link to="/customers">Customer List</Link></li>
                <li><Link to="/applications">Applications</Link></li>
            </ul>
            <div className="nav-actions">
                <div ref={profileRef} style={{ position: 'relative' }}>
                        <div className="profile-logo" onClick={toggleProfile}>
                            👤
                        </div>
                    {showProfile && (
                        <div className="profile-dropdown">
                            {!isEditing ? (
                                <>
                                    <p><strong>Name:</strong> {user?.name}</p>
                                    <p><strong>Username:</strong> {user?.username}</p>
                                    <p><strong>Email:</strong> {user?.email}</p>
                                    <p><strong>Phone:</strong> {user?.phone}</p>
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
                                        <button className="nav-btn" onClick={handleLogout}>
                                            Sign out
                                        </button>
                                    </div>
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
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                value={editData.password || ''} 
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                style={{ marginLeft: '5px', padding: '2px', paddingRight: '25px' }}
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
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {showPassword ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                                    </svg>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                        <button 
                                            className="nav-btn" 
                                            onClick={handleSave}
                                            style={{ 
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button 
                                            className="nav-btn" 
                                            onClick={() => setIsEditing(false)}
                                            style={{ 
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;