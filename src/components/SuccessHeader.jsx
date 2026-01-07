import React from 'react';
import '../styles/paymentSuccess.css';

const SuccessHeader = () => {
  return (
    <header className="success-header" aria-label="success">
      <div className="success-icon-placeholder" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#78e78e"/>
          <path d="M18 33.5L28 43.5L46 23.5" stroke="#14421e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </header>
  );
};

export default SuccessHeader;

