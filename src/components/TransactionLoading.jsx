import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, Info, X } from 'lucide-react';
import '../TransactionLoading.css';

export default function MpesaPrompt({ phoneNumber, amount, onCancel }) {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  return (
    <div className="prompt-overlay">
      <div className="prompt-card">
        {/* <button className="close-prompt" onClick={onCancel}><X size={20}/></button> */}
        
        <div className="phone-visual">
          <div className="pulse-circles">
            <div className="circle c1"></div>
            <div className="circle c2"></div>
            <div className="circle c3"></div>
          </div>
          <Smartphone size={48} className="phone-icon" />
        </div>

        <div className="prompt-content">
          <h2>Check your phone</h2>
          <p>We've sent a payment request to <strong>{phoneNumber}</strong></p>
          <p className='small-text'>Enter your mobile money PIN code <br></br> to make the payment</p>
          
          <div className="instruction-box">
            <div className="step">
              <span className="step-num">1</span>
              <span className='step-text'>Unlock your phone</span>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <span className='step-text'>Enter your <strong>PIN</strong> to authorize</span>
            </div>
          </div>

          {/* <div className="amount-pill">
            Pay {amount}
          </div> */}
        </div>

        <div className="prompt-footer">
          <div className="timer-ring">
            <span>{seconds}s</span>
          </div>
          <p>Waiting for authorization...</p>
        </div>

        <div className="security-note">
          <ShieldCheck size={14} />
          <span>Secure Encrypted Transaction</span>
        </div>
      </div>
    </div>
  );
}