import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, CreditCard, Trash2, Save, Printer } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../components/Config';
import '../OrderDetails.css';

export default function UserOrderDetails() {
  const { id } = useParams();
  const [user_id, setUserId] = useState(null);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(API_BASE_URL.slice(8, 15));
    if(!token) {
        console.warn("No user found");
        navigate("/login"); 
    } else {
        setUserId(token);
    }
    
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_order_details.php?id=${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.post(`${API_BASE_URL}/update_order_status.php`, { id, status: newStatus, user_id });
      setOrder({ ...order, order_status: newStatus });
      alert("Status updated successfully!");
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const deleteOrder = async () => {
    if (window.confirm("Are you sure? This will permanently remove the order.")) {
      try {
        await axios.post(`${API_BASE_URL}/delete_order.php`, { id });
        navigate('/admin-orders');
      } catch (err) {
        alert("Error deleting order");
      }
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (!order) return <div className="error-view">Order not found.</div>;

  return (
    <div className="details-page">
      <header className="details-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="back-circle"><ArrowLeft size={20}/></button>
          <div>
            <h1>Order #{order.transaction_reference}</h1>
            <p>Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
      </header>

      <div className="details-grid">
        <div className="details-main">
          <section className="info-card">
            <div className="card-header"><Package size={20}/> <h2>Items Summary</h2></div>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="item-cell">
                        <img src={`${API_BASE_URL}/uploads/products/${item.img}`} alt="" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td>K{Number(item.unit_price).toLocaleString()}</td>
                    <td>{item.quantity}</td>
                    <td>K{Number(item.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="order-total-footer">
              <div className="total-row"><span>Subtotal</span> <span>K{Number(order.total_amount).toLocaleString()}</span></div>
              <div className="total-row grand"><span>Total</span> <span>K{Number(order.total_amount).toLocaleString()}</span></div>
            </div>
          </section>

          <div className="customer-info-row">
            <div className="info-card">
              <div className="card-header"><User size={18}/> <h3>Customer</h3></div>
              <p><strong>{order.full_name}</strong></p>
              <p>{order.email}</p>
              <p>{order.phone}</p>
            </div>
            <div className="info-card">
              <div className="card-header"><MapPin size={18}/> <h3>Shipping</h3></div>
              <p>{order.shipping_address || "Address not provided"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}