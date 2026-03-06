import React from 'react';
import { XCircle, RefreshCcw, CreditCard, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../TransactionError.css';

export default function TransactionFailed({ errorMsg = "Transaction was declined by the provider.", onRetry }) {
  const navigate = useNavigate();

  return (
    <div className="fail-overlay">
      <div className="fail-card">
        <div className="fail-icon-wrapper">
          <div className="fail-shake-container">
            <XCircle size={80} strokeWidth={1.5} className="error-icon" />
          </div>
          <div className="fail-halo"></div>
        </div>

        <div className="fail-header">
          <h1>Payment Failed</h1>
          <p>{errorMsg}</p>
        </div>

        <div className="troubleshoot-list">
          <h3>Common reasons:</h3>
          <ul>
            <li><div className="bullet"></div> Insufficient balance in your account</li>
            <li><div className="bullet"></div> Incorrect PIN entered on your phone</li>
            <li><div className="bullet"></div> The request timed out</li>
          </ul>
        </div>

        <div className="fail-actions">
          <button className="btn-retry" onClick={onRetry}>
            <RefreshCcw size={18} /> Try Again
          </button>
          
          {/* <div className="secondary-actions">
            <button className="btn-outline" onClick={() => navigate('/cart')}>
               Change Method
            </button>
            <button className="btn-outline">
              <MessageCircle size={16} /> Support
            </button>
          </div> */}
        </div>

        <button className="btn-back-home" onClick={onRetry}>
          <ArrowLeft size={14} /> Back to Shop
        </button>
      </div>
    </div>
  );
}