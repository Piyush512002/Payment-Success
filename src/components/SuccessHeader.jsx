import React from 'react';
import '../styles/paymentSuccess.css';

const SuccessHeader = () => {
  return (
    <header className="success-header" aria-label="success">
      <div className="success-brand">
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="48" height="48" rx="10" fill="#ffffff" />
          <path d="M14.5 24.5L20.5 30.5L33.5 17.5" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="brand-text">
          <div className="brand-name">PaySuccess</div>
          <div className="brand-sub">Receipt</div>
        </div>
      </div>
    </header>
  );
};

export default SuccessHeader;

