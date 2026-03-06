import React, { useEffect, useState } from 'react';
import { Search, Bell, Package, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { API_BASE_URL } from '../components/Config';
import '../AdminOrders.css';
import { useNavigate } from "react-router-dom";

export default function UserOrders() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {

    const token = localStorage.getItem(API_BASE_URL.slice(8, 15));

    if (!token) {
      localStorage.clear();
      navigate("/login");
      return;
    }

    fetchOrders(token);

  }, []);

  const fetchOrders = async (token) => {

    try {

      const res = await axios.post(`${API_BASE_URL}/user_orders.php`, {
        user_token: token
      });

      if (res.data.success) {
        setOrders(Array.isArray(res.data.orders) ? res.data.orders : []);
      } else {
        setOrders([]);
      }

    } catch (err) {

      console.error("Orders fetch error", err);

    } finally {

      setLoading(false);

    }
  };

  const filteredOrders = orders.filter(order => {

    const status = order.order_status?.toLowerCase() || "";

    const matchesFilter =
      filter === "All" ||
      status === filter.toLowerCase();

    const matchesSearch =
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.transaction_reference || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;

  });

  if (loading) {
    return (
      <div className="loading-modal">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="pos-wrapper">

      <Sidebar active={"orders"} />

      <main className="main-hub">

        <header className="hub-header">

          <div className="search-container">
            <Search size={18} className="s-icon" />

            <input
              type="text"
              placeholder="Search customer, order ID or transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div
            onClick={() => navigate("/notifications")}
            className="header-meta"
          >
            <button className="notif-btn">
              <Bell size={20} />
              <div className="bell-tip"></div>
            </button>
          </div>

        </header>

        <section className="hero-section">
          <h1>Customer <span className="text-accent">Orders</span></h1>
          <p>Order history.</p>
        </section>

        <div className="filter-row">

          {["All","PENDING","PAID","ASSIGNED","IN_TRANSIT","COLLECTED","CANCELLED"].map((tab) => (

            <button
              key={tab}
              className={`filter-tab ${filter === tab ? "active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>

          ))}

        </div>

        <div className="orders-grid">

          {filteredOrders.length > 0 ? (

            filteredOrders.map(order => (

              <div
                key={order.order_id}
                className="order-card-premium"
                onClick={() => navigate(`/user-order-details/${order.order_id}`)}
              >

                <div className="order-main-info">

                  <div className="customer-avatar-circle">
                    {order.customer_name?.charAt(0) || "G"}
                  </div>

                  <div className="order-titles">

                    <h3 className="customer-name">
                      {order.customer_name || "Guest User"}
                    </h3>

                    <span className="order-ref">
                      #{order.transaction_reference || order.order_id}
                    </span>

                    <br />

                    <span className="order-ref">
                      {new Date(order.date).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short" }
                      )}
                    </span>

                  </div>

                </div>

                <div className="order-finance">

                  <Package size={14} className="stat-icon" />

                  <div className="stat-texts">
                    <label>Location</label>
                    <span>{order.pickup_address}</span>
                  </div>

                </div>

                <div className="order-status-box">

                  <div
                    className={`status-indicator-tag ${(order.order_status || "PENDING").toLowerCase()}`}
                  >
                    <span className="dot"></span>
                    {order.order_status}
                  </div>

                </div>

                <div className="order-finance">

                  <label>Total Amount</label>

                  <div className="amount-val">
                    K{Number(order.total_amount || 0).toLocaleString()}
                  </div>

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