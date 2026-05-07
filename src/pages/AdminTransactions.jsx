import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Wallet, ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../components/Config';
import TransactionDetails from './TransactionDetails';
import '../Transaction.css';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ income: 0, spending: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  
  const navigate = useNavigate();
  const currency = "K";
  
  // Updated categories to match your Database ENUM for status
  const categories = ["All", "Success", "Pending", "Failed"];

  useEffect(() => {
    const role = localStorage.getItem(`${API_BASE_URL.slice(8, 15)}-role`);
    if (role !== "ADMIN") navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/admin_transactions.php`, {
          params: { category: activeCat, search: searchTerm },
          signal: controller.signal
        });

        if (res.data.success) {
          setTransactions(res.data.transactions);
          setStats({
            income: res.data.income,
            spending: res.data.spending,
            balance: res.data.balance
          });
        }
      } catch (err) {
        if (!axios.isCancel(err)) console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [activeCat, searchTerm]);

  return (
    <div className="trx-page-wrapper">
      <nav className="trx-nav">
        <div className="nav-left">
          <div className="back-trigger" onClick={() => navigate(-1)}><ArrowLeft size={20}/></div>
          <div className="nav-title">Financial Ledger</div>
        </div>
        <div className="nav-right">
          <div className="search-pill">
            <Search size={16} className="s-icon"/>
            <input 
              type="text" 
              placeholder="Search reference or user..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </nav>

      {selectedId && (
        <TransactionDetails 
          transactionId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}

      <div className="trx-content-layout">
        <aside className="trx-insights">
          <div className="balance-card">
            <div className="card-glass"></div>
            <p>System Wallet Balance</p>
            <h2>{currency}{stats.income.toLocaleString()}</h2>
            <div className="card-footer">
              <span>ADMIN CORE</span>
              <Wallet size={20}/>
            </div>
          </div>

          <div className="mini-stats">
            <div className="m-stat">
              <div className="m-icon up"><ArrowUpRight size={16}/></div>
              <div><p>Total Revenue</p><strong>{currency}{stats.income.toLocaleString()}</strong></div>
            </div>
            <div className="m-stat">
              <div className="m-icon down"><ArrowDownLeft size={16}/></div>
              <div><p>Lost/Failed</p><strong>{currency}{stats.spending.toLocaleString()}</strong></div>
            </div>
          </div>

          <div className="cat-filter-box">
            <h4>Filter by Status</h4>
            <div className="cat-list">
              {categories.map(c => (
                <button 
                  key={c} 
                  className={`cat-item ${activeCat === c ? 'active' : ''}`} 
                  onClick={() => setActiveCat(c)}
                >
                  {c} {activeCat === c && <div className="dot" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="trx-main-feed">
          <div className="feed-header">
            <h3>{activeCat} Records ({transactions.length})</h3>
          </div>

          <div className="trx-list">
            {loading ? (
              <div className="shimmer-list">Loading transactions...</div>
            ) : transactions.length > 0 ? (
              transactions.map((t) => (
                <div key={t.id} className="trx-row" onClick={() => setSelectedId(t.id)}>
                  <div className="trx-brand">
                    <div className="brand-logo">{t.shop.charAt(0)}</div>
                    <div className="brand-details">
                      <h4>{t.id}</h4>
                      <p>{t.user_name} • {t.date}</p>
                    </div>
                  </div>
                  <div className="trx-status-cell">
                    <span className={`status-pill ${t.status.toLowerCase()}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="trx-amount-cell">
                    <h4 className={t.status === 'SUCCESS' ? 'positive' : 'negative'}>
                      {currency}{parseFloat(t.amount).toLocaleString()}
                    </h4>
                    <ChevronRight size={18} className="row-chevron"/>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No transactions found matching your criteria.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}