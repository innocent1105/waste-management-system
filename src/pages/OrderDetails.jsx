import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, Printer, Trash2, ClipboardList } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../components/Config';
import '../OrderDetails.css';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/get_order_details.php?id=${id}`);
      console.log("Order details fetched:", res.data);
      setOrder(res.data);
    } catch (err) {
      console.error("Fetch Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/update_order_status.php`, { id, status: newStatus });
      setOrder(prev => ({ ...prev, order_status: newStatus }));
      console.log("Status updated:", res.data);
      console.log(id);
    } catch (err) {
      alert("Status update failed");
    } finally {
      setUpdating(false);
    }
  };

  // 1. Loading State
  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  // 2. Error/Null State (CRITICAL: This prevents the 'Cannot read properties of null' crash)
  if (!order) return (
    <div className="error-view">
      <h2>Request Not Found</h2>
      <button onClick={() => navigate(-1)}>Back to Orders</button>
    </div>
  );

  return (
    <div className="details-page">
      <header className="details-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="back-circle"><ArrowLeft size={20}/></button>
          <div>
            <h1>Request #{order.transaction_reference || order.order_id}</h1>
            <p>Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => window.print()}><Printer size={18}/> Print</button>
        </div>
      </header>

      <div className="details-grid">
        <div className="details-main">
          <section className="info-card">
            <div className="card-header"><ClipboardList size={20}/> <h2>Collection Items</h2></div>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Waste Category</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>K{Number(item.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="order-total-footer">
               <h3>Total: K{Number(order.total_amount).toLocaleString()}</h3>
            </div>
          </section>

          <div className="customer-info-row">
            <div className="info-card">
              <h3>Customer Details</h3>
              <p><strong>{order.full_name}</strong></p>
              <p>{order.email}</p>
              <p>{order.phone}</p>
            </div>
            <div className="info-card">
              <h3><MapPin size={18}/> Pickup Address</h3>
              <p>{order.pickup_address || "No address provided"}</p>
            </div>
          </div>
        </div>

        <aside className="details-sidebar">
          <div className="info-card status-manager">
            <h3><Truck size={18}/> Manage Request</h3>
            <div className={`status-tag ${order.order_status.toLowerCase()}`}>
                {order.order_status}
            </div>
            <select 
              value={order.order_status} 
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
            >
              {['PENDING', 'PAID', 'ASSIGNED', 'IN_TRANSIT', 'COLLECTED', 'CANCELLED'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="info-card status-manager">
            <h3>Open GPS</h3>
            <br></br>
            <button className="btn-secondary" onClick={() => {
                const address = encodeURIComponent(order.pickup_address);
                navigate(`/user-gps/${order.user_id}`);
              }
            }>
              <MapPin size={18}/> View on Map
            </button>
          </div>

        </aside>
      </div>
    </div>
  );
}