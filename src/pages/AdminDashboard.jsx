import React, { useEffect, useState, useCallback } from 'react';
import { 
  Bell, TrendingUp, Users, Activity, DollarSign, 
  ShoppingCart, Truck, ArrowUpRight, ArrowDownRight, CheckCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../components/Config';
import axios from 'axios';
import '../AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { 
        revenue: 0, prevRevenue: 0, 
        orders: 0, prevOrders: 0,
        customers: 0, prevCustomers: 0,
        drivers: 0,
        conversion: 0 
    },
    revenueHistory: [],
    customerGrowth: [],
    statusDistribution: []
  });

  const COLORS = ['#00ca6d', '#f59e0b', '#ef4444']; // Success, Pending, Failed

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin_dashboard_stats.php`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(API_BASE_URL.slice(8, 15));
    const role = localStorage.getItem(`${API_BASE_URL.slice(8, 15)}-role`);
    
    if (!token || role !== "ADMIN") {
      localStorage.clear();
      navigate("/login");
      return;
    }
    
    fetchDashboardData();
  }, [navigate, fetchDashboardData]);

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  if (loading) return <div className="loading-screen">Loading Intelligence...</div>;

  return (
    <div className="pos-wrapper">
      <Sidebar active={"dashboard"} />

      <main className="main-hub">
        <header className="dashboard-header">
          <section className="hero-section">
            <h1>Waste Management <span className="text-accent">Admin</span></h1>
            <p>Platform Overview • {new Date().toLocaleDateString()}</p>
          </section>
        </header>

        <div className="metrics-grid">
          <MetricCard 
            title="System Revenue" 
            value={`K${data.stats.revenue.toLocaleString()}`} 
            percent={calculateChange(data.stats.revenue, data.stats.prevRevenue)} 
            icon={<DollarSign size={20}/>} 
            color="#00ca6d"
          />
          <MetricCard 
            title="Total Bookings" 
            value={data.stats.orders} 
            percent={calculateChange(data.stats.orders, data.stats.prevOrders)} 
            icon={<ShoppingCart size={20}/>} 
            color="#6366f1"
          />
          <MetricCard 
            title="Active Buyers" 
            value={data.stats.customers} 
            percent={calculateChange(data.stats.customers, data.stats.prevCustomers)} 
            icon={<Users size={20}/>} 
            color="#8b5cf6"
          />
          <MetricCard 
            title="Fleet (Drivers)" 
            value={data.stats.drivers} 
            percent="Active" 
            isStaticText={true}
            icon={<Truck size={20}/>} 
            color="#f59e0b"
          />
        </div>

        <div className="dashboard-grid-layout">
          <div className="chart-container full-width">
            <div className="chart-header">
              <h3>Collection Revenue (Last 30 Days)</h3>
            </div>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={data.revenueHistory}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ca6d" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00ca6d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#00ca6d" strokeWidth={4} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="dashboard-grid-layout bottom-charts">
          <div className="chart-container">
            <h3>User Acquisition</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <AreaChart data={data.customerGrowth}>
                  <XAxis dataKey="date" hide />
                  <Tooltip />
                  <Area type="step" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-container">
            <h3>Payment Status Breakdown</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.statusDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components (CustomTooltip, MetricCard) remain the same as your original snippet

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        <p className="value">K{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function MetricCard({ title, value, percent, icon, color, isStaticText }) {
  const isUp = parseFloat(percent) >= 0;
  return (
    <div className="metric-card" style={{"--card-color": color}}>
      <div className="metric-header">
        <div className="metric-icon" style={{backgroundColor: `${color}15`, color: color}}>{icon}</div>
        <div className={`metric-badge ${isUp ? 'up' : 'down'}`}>
          {!isStaticText && (isUp ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>)}
          {percent}{!isStaticText && '%'}
        </div>
      </div>
      <div className="metric-body">
        <span className="item-cat">{title}</span>
        <h2>{value}</h2>
      </div>
    </div>
  );
}