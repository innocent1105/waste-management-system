import React, { useEffect, useState } from 'react';
import { Search, Bell, Clock, CheckCircle, Truck, Eye, Calendar, Package, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { API_BASE_URL } from '../components/Config';
import '../AdminOrders.css';
import { useNavigate, useParams } from "react-router-dom";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

   useEffect(() => {
    const role = localStorage.getItem(`${API_BASE_URL.slice(8, 15)}-role`);
    if (role !== "ADMIN") navigate("/login");
  }, []);


  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin_orders.php`);
      setOrders(Array.isArray(res.data) ? res.data : []);
      console.log(res.data);
    } catch (err) {
      console.error("Orders fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'All' || o.status === filter;
    const matchesSearch = o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="loading-modal"><div className="loader"></div></div>
  );

  return (
    <div className="pos-wrapper">
      <Sidebar active={"orders"} />

      <main className="main-hub">
        <header className="hub-header">
          <div className="search-container">
            <Search size={18} className="s-icon"/>
            <input 
              type="text" 
              placeholder="Search Customer or Order ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
        </header>

        <section className="hero-section">
          <h1>Customer <span className="text-accent">Orders</span></h1>
          <p>Track and manage your global sales flow.</p>
        </section>

        <div className="filter-row">
          {['All','Paid', 'Pending', 'Shipping', 'Shipped','Delivered'].map((tab) => (
            <button 
              key={tab} 
              className={`filter-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="orders-grid">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div onClick={()=>{
                navigate(`/order-details/${order.id}`)
              }} className="order-card-premium-admin" key={order.order_number}>
                <div className="order-main-info">
                  <div className="customer-avatar-circle">
                    {order.customer_name?.charAt(0) || 'G'}
                  </div>
                  <div className="order-titles">
                    <h3 className="customer-name">{order.customer_name || 'Guest User'}</h3>
                    <span className="order-ref">#{order.order_number}</span> <br></br>
                    <span className="order-ref">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>

                  </div>
                </div>

             
                

                <div className="order-finance">
                  <Package size={14} className="stat-icon" />
                  <div className="stat-texts">
                    <label>Items</label>
                    <span>{order.item_count || 0} Products</span>
                  </div>
                </div>

                {/* Status Section */}
                <div className="order-status-box">
                  <div className={`status-indicator-tag ${(order.status || 'pending').toLowerCase()}`}>
                    <span className="dot"></span>
                    {order.status || 'Pending'}
                  </div>
                </div>

                {/* Price Section */}
                <div className="order-finance">
                  <label>Total Amount</label>
                  <div className="amount-val">K{Number(order.total_amount || 0).toLocaleString()}</div>
                </div>

                {/* Actions Section */}
                <div className="order-action-hub">
                  <button className="view-details-btn" title="View Full Order">
                    <Eye size={18} />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-container">
              <center>
            <div className="empty-icon-bg">
                <AlertCircle size={48} />
              </div>
              <h2>No Orders Found</h2>
              <p>Try adjusting your filters or search terms.</p>
              </center>
  
            </div>
          )}
        </div>
      </main>
    </div>
  );
}