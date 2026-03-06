import React, { useState, useEffect } from 'react';
import { X, Truck, User, CreditCard, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../components/Config';

export default function TransactionDetails({ transactionId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.post(`${API_BASE_URL}/get_transaction_details.php`, {
          transaction_id: transactionId
        });
        if (res.data.success) setData(res.data.details);
      } catch (err) {
        console.error("Detail Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (transactionId) fetchDetails();
  }, [transactionId]);

  if (!transactionId) return null;

  return (
    <div className={`details-overlay active`}>
      <div className="details-panel">
        <header>
          <button onClick={onClose} className="close-btn"><X size={24}/></button>
          <h3>Collection Details</h3>
        </header>

        {loading ? (
          <div className="loader-container"><p>Fetching details...</p></div>
        ) : data && (
          <div className="details-scrollable">
            {/* Status Banner */}
            <div className={`status-banner ${(data.status || 'pending').toLowerCase()}`}>
              {data.status} • {data.ref}
            </div>

            {/* Waste Pickup Service Info */}
            <section className="detail-section">
              <h4><Truck size={18}/> Service Information</h4>
              <div className="info-grid">
                <p><strong>Order ID:</strong> {data.order_id}</p>
                <p><strong>Status:</strong> {data.order_status}</p>
                <p><strong>Driver:</strong> {data.driver_name || "Assigning Driver..."}</p>
                {data.driver_phone && <p><strong>Driver Contact:</strong> {data.driver_phone}</p>}
              </div>
            </section>

            {/* Customer Info */}
            <section className="detail-section">
              <h4><User size={18}/> Customer Information</h4>
              <div className="info-grid">
                <p><strong>Name:</strong> {data.customer_name}</p>
                <p><strong>Phone:</strong> {data.customer_phone}</p>
              </div>
            </section>

            {/* Logistics Info */}
            <section className="detail-section">
              <h4><Calendar size={18}/> Schedule</h4>
              <p>{data.scheduled_for ? new Date(data.scheduled_for).toLocaleString() : "As soon as possible"}</p>
              
              <br/>
              <h4><MapPin size={18}/> Pickup Location</h4>
              <p className="address-text">{data.pickup_address}</p>
            </section>

            {/* Payment Summary */}
            <section className="detail-section payment-summary">
              <h4><CreditCard size={18}/> Payment Summary</h4>
              <div className="total-row">
                <span>Method: {data.payment_method}</span>
                <strong className="final-amount">K{parseFloat(data.amount).toLocaleString()}</strong>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}