import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '../Transaction.css';
import { API_BASE_URL } from '../components/Config';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ income: 0, spending: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  
  const navigate = useNavigate();
  const currency = "K";
  const wasteCategories = ["All", "Plastic", "Organic", "Medical", "Electronic"];

  useEffect(() => {
    const controller = new AbortController();
    // Retrieve token from storage (ensure this matches your login storage key)
    const token = localStorage.getItem("user_token") || localStorage.getItem(API_BASE_URL.slice(8, 15));

    if(!token) {
        navigate("/login");
        return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await axios.post(`${API_BASE_URL}/user_transactions.php`, {
          user_token: token,
          params: { category: activeCat, search: searchTerm }
        }, { signal: controller.signal });

        if (res.data.success) {
          setTransactions(res.data.transactions || []);
          setStats({
            income: res.data.income || 0,
            spending: res.data.spending || 0,
            balance: res.data.balance || 0
          });
        }
      } catch (err) {
        if (!axios.isCancel(err)) console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [activeCat, searchTerm, navigate]);

  return (
    <div className="trx-page-wrapper">
      <nav className="trx-nav">
        <div className="nav-left">
          <div className="back-trigger" onClick={() => navigate(-1)}><ArrowLeft size={20}/></div>
          <div className="nav-title">Back</div>
        </div>
        <div className="nav-right">
          <div className="search-pill">
            <Search size={16} className="s-icon"/>
            <input 
              type="text" 
              placeholder="Search reference..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </nav>


      <section className="hero-section">
        <h1>Transactions <span className="text-accent">History</span></h1>
        <p>Payment and Transaction history.</p>
      </section>

      <main className="trx-main-feed">
        <div className="trx-list">
          {loading ? (
            <div className="loading-spinner">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">No transactions found</div>
          ) : transactions.map((t) => (
            <div key={t.id} className="trx-row">
              <div className="trx-brand">
                <div className="brand-logo">
                  {(t.shop || "Waste").charAt(0).toUpperCase()}
                </div>
                <div className="brand-details">
                  <h4>{t.order_id || t.id}</h4>
                  <p>{t.shop || 'MoMo'} • {t.date}</p>
                </div>
              </div>
              
              <div className="trx-status-cell">
                 <span className={`status-dot ${(t.status || 'pending').toLowerCase()}`}></span>
                 {t.status}
              </div>

              <div className="trx-amount-cell">
                <h4 className={t.status === 'SUCCESS' ? 'positive' : 'negative'}>
                  {currency}{parseFloat(t.amount || 0).toLocaleString()}
                </h4>
                <ChevronRight size={18} className="row-chevron"/>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}