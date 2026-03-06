import React, { useEffect } from 'react';
import { Check, ArrowRight, Download, ShoppingBag, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../TransactionSuccess.css';

export default function TransactionSuccess({ orderId = "ORD-77210", amount = "2,999" }) {
  const navigate = useNavigate();

  return (
    <div className="success-overlay">
      <div className="confetti-container">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`confetti piece-${i}`}></div>
        ))}
      </div>

      <div className="success-card">
        <div className="success-icon-wrapper">
          <div className="success-ring"></div>
          <div className="success-check-bg">
            <Check size={42} strokeWidth={3} className="check-icon" />
          </div>
        </div>

        <div className="success-header">
          <h1>Payment Received</h1>
          <p>Your order is being prepared with care.</p>
        </div>

        {/* <div className="order-details">
          <div className="detail-row">
            <span>Order ID</span>
            <strong>#{orderId}</strong>
          </div>
          <div className="detail-row">
            <span>Amount Paid</span>
            <strong>K{amount}</strong>
          </div>
          <div className="detail-row">
            <span>Status</span>
            <span className="status-badge">Confirmed</span>
          </div>
        </div> */}

          <br></br>
        <div className="success-actions">
          <button className="btn-primary" onClick={() => navigate('/')}>
            Continue Shopping <ArrowRight size={18} />
          </button>
          
          {/* <div className="action-grid">
            <button className="btn-secondary">
              <Download size={16} /> Receipt
            </button>
            <button className="btn-secondary">
              <Share2 size={16} /> Share
            </button>
          </div> */}
        </div>

        <div className="success-footer">
          <ShoppingBag size={14} />
          <span>Estimated delivery: 2-3 business days</span>
        </div>
      </div>
    </div>
  );
}