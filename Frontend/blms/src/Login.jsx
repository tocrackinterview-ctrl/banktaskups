import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './Login.css';
 
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Clear form fields when component mounts
    setUsername('');
    setPassword('');
    // Scroll to top of page
    window.scrollTo(0, 0);
  }, []);
 
  const handleLogin = async (e) => {
    e.preventDefault();
 
    try {
      const payload = { username, password };
      const response = await fetch('http://localhost:8082/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
 
      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        alert('Login successful');
        if (userData.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        const result = await response.text();
        alert(result);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };
 
  return (
    <>
      <Navbar />
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-row">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Login
          </button>
        </form>
        <div className="toggle-link">
          <div>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="linklike"
            >
              Sign up here
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
 
export default Login;