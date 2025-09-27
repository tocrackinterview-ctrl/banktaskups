import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './Login.css';
import './Signup.css';
 
const Signup = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
 
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  });
 
  const validateEmail = (email) => {
    const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (!validDomains.includes(domain)) {
      setEmailError('Please use a valid email domain (gmail.com, yahoo.com, outlook.com, hotmail.com, icloud.com, protonmail.com)');
      return false;
    }
    
    setEmailError('');
    return true;
  };
 
  const validatePhone = (phone) => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError('Phone number must be 10 digits starting with 6, 7, 8, or 9');
      return false;
    }
   
    // Check for sequential numbers
    if (/^(?:0123456789|1234567890|9876543210)$/.test(phone)) {
      setPhoneError('Phone number cannot be sequential numbers');
      return false;
    }
   
    setPhoneError('');
    return true;
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      setNameError('Name should only contain letters and spaces');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters long');
      return false;
    }
    setNameError('');
    return true;
  };
 
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Update password validation states
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);
 
  const validatePassword = (password) => {
    const validations = passwordValidation;
   
    if (!validations.length) {
      return "Password must be at least 8 characters long.";
    }
    if (!validations.uppercase) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!validations.lowercase) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!validations.number) {
      return "Password must contain at least one number.";
    }
    if (!validations.symbol) {
      return "Password must contain at least one special character.";
    }
 
    return null;
  };
 
  const handleSignup = async (e) => {
    e.preventDefault();
 
    // Validate name, email and phone
    if (!validateName(name) || !validateEmail(email) || !validatePhone(phone)) {
      return;
    }
 
    const passwordError = validatePassword(password);
    if (passwordError) {
      alert(passwordError);
      return;
    }
 
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
 
    const payload = { name, email, phone, username, password, role };
 
    try {
      const response = await fetch('http://localhost:8082/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
 
      const result = await response.text();
      alert(result);
      if (response.ok) {
        alert('Registration successful! Please login to continue.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed');
    }
  };
 
  return (
    <>
      <Navbar />
      <div className="login-box">
        <h2>Register</h2>
        <form onSubmit={handleSignup}>
          <div className="form-row">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="new-username"
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                validateName(e.target.value);
              }}
              autoComplete="name"
              required
            />
          </div>
          {nameError && <div className="error-message-e">{nameError}</div>}
          <div className="form-row">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              autoComplete="email"
              required
            />
          </div>
          {emailError && <div className="error-message-e">{emailError}</div>}
          <div className="form-row">
            <label htmlFor="phone">Phone:</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*$/.test(value)) {
                  setPhone(value);
                  if (value.length === 1 && !/^[6-9]/.test(value)) {
                    setPhoneError('Phone number must start with 6, 7, 8, or 9');
                  } else if (value.length === 1) {
                    setPhoneError('');
                  }
                  if (value.length === 10) {
                    validatePhone(value);
                  }
                }
              }}
              maxLength="10"
              autoComplete="tel"
              required
            />
          </div>
          {phoneError && <div className="error-message-e">{phoneError}</div>}
          <div className="form-row">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="password-validation">
            <div className={`validation-item ${passwordValidation.length ? 'valid' : ''}`}>
              ✓ At least 8 characters
            </div>
            <div className={`validation-item ${passwordValidation.uppercase ? 'valid' : ''}`}>
              ✓ One uppercase letter
            </div>
            <div className={`validation-item ${passwordValidation.lowercase ? 'valid' : ''}`}>
              ✓ One lowercase letter
            </div>
            <div className={`validation-item ${passwordValidation.number ? 'valid' : ''}`}>
              ✓ One number
            </div>
            <div className={`validation-item ${passwordValidation.symbol ? 'valid' : ''}`}>
              ✓ One special character
            </div>
          </div>
          <div className="form-row">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Sign Up
          </button>
        </form>
        <div className="toggle-link">
          <div>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                navigate('/login');
                window.location.reload();
              }}
              className="linklike"
            >
              Login here
            </button>
            <div className="back-home">
              <button onClick={() => navigate('/')} className="navbtn">
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
 
export default Signup;