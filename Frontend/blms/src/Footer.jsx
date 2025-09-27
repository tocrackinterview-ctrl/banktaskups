import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-col footer-about">
          <div className="logo">TrustLine</div>
          <p>Fast, secure, and flexible loans for every need. Trusted by thousands. Your financial partner for life.</p>
        </div>
        <div className="footer-col">
          <h3>Contact Us</h3>
          <p>
            Email Support: TrustLine@gmail.com<br/>
            Call: +91 xxxxxxxxxxx
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;