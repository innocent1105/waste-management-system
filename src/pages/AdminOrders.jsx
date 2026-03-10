import React, { useEffect, useState } from 'react';
import { Search, Eye, Package, AlertCircle, MapPin, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { API_BASE_URL } from '../components/Config';
import { useNavigate } from "react-router-dom";
import '../AdminOrders.css';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState("");

  // Waste Management Workflow Statuses from your DB
  const statusTabs = ['All', 'PENDING', 'PAID', 'ASSIGNED', 'IN_TRANSIT', 'COLLECTED', 'CANCELLED'];

  useEffect(() => {
    const role = localStorage.getItem(`${API_BASE_URL.slice(8, 15)}-role`);
    if (role !== "ADMIN") navigate("/login");
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin_orders.php`);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Orders fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'All' || o.status === filter;
    const matchesSearch = 
      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="loading-modal"><div className="loader"></div></div>;

  return (
    <div className="pos-wrapper">
      <Sidebar active={"orders"} />

      <main className="main-hub">
        <header className="hub-header">
          <div className="search-container">
            <Search size={18} className="s-icon"/>
            <input 
              type="text" 
              placeholder="Search Customer, ID or Address..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <section className="hero-section">
          <h1>Collection <span className="text-accent">Requests</span></h1>
          <p>Monitor waste pickup schedules and driver assignments.</p>
        </section>

        <div className="filter-row">
          {statusTabs.map((tab) => (
            <button 
              key={tab} 
              className={`filter-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="orders-grid">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div 
                key={order.id}
                onClick={() => navigate(`/order-details/${order.id}`)} 
                className="order-card-premium-admin"
              >
                <div className="order-main-info">
                  <div className="customer-avatar-circle">
                    {order.customer_name?.charAt(0)}
                  </div>
                  <div className="order-titles">
                    <h3 className="customer-name">{order.customer_name}</h3>
                    <span className="order-ref">ID: {order.order_number}</span>
                    <div className="order-date-sub">
                       {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="order-finance">
                  <MapPin size={14} className="stat-icon" />
                  <div className="stat-texts">
                    <label>Pickup Location</label>
                    <span className="truncate-text">{order.address || 'Address not set'}</span>
                  </div>
                </div>

                <div className="order-status-box">
                  <div className={`status-indicator-tag ${order.status.toLowerCase()}`}>
                    <span className="dot"></span>
                    {order.status}
                  </div>
                </div>

                <div className="order-finance">
                  <label>Service Fee</label>
                  <div className="amount-val">K{Number(order.total_amount).toLocaleString()}</div>
                </div>

                <div className="order-action-hub">
                  <button className="view-details-btn">
                    <Eye size={18} />
                    <span>Manage</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-container">
              <div className="empty-icon-bg"><AlertCircle size={48} /></div>
              <h2>No Collection Requests</h2>
              <p>Check back later or try a different filter.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}