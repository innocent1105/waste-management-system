import { LayoutGrid, BarChart3, ShoppingCart, Users, Home,Van, ListCheck, LayoutList, ListPlus,MapPinHouse, Zap, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from './Config';

const Sidebar = ({ active, cartItems }) => {
  const [activeTab, setActiveTab] = useState(active);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'home', icon: MapPinHouse, path: '/', label: 'Dashboard' },
    { id: 'transactions', icon: BarChart3, path: '/transactions', label: 'History' },
    { id: 'orders', icon: ShoppingCart, path: '/orders', label: 'Orders' },
    { id: 'profile', icon: Users, path: '/profile', label: 'Profile' },
  ];

  const adminMenuItems = [
    { id: 'home', icon: LayoutGrid, path: '/', label: 'Home' },
    { id: 'admin_panel', icon: Home, path: '/admin-dashboard', label: 'Admin' },
    { id: 'admin_transactions', icon: ListCheck, path: '/admin-transactions', label: 'Logs' },
    { id: 'admin_orders', icon: LayoutList, path: '/admin-orders', label: 'Manage' },
    // { id: 'admin-add-products', icon: ListPlus, path: '/admin-add-products', label: 'Add' },
  ];

  useEffect(() => {
    const role = localStorage.getItem(`${API_BASE_URL.slice(8, 15)}-role`);
    if (role) setUserRole(role);
  }, []);

  const handleNavigation = (id, path) => {
    setActiveTab(id);
    navigate(path);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const itemsToRender = userRole === "ADMIN" ? adminMenuItems : menuItems;

  return (
    <aside className="nav-sidebar">
      <div className="sidebar-brand" onClick={() => navigate('/')}>
        <div className="brand-icon">
          <Van size={22} fill="#00d084" color="#00d084"/>
        </div>
      </div>
      
      <div className="nav-menu">
        {itemsToRender.map((item) => (
          <button 
            key={item.id}
            onClick={() => handleNavigation(item.id, item.path)}
            className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
            data-tooltip={item.label}
          >
            <item.icon size={22}/>
            {item.id === "orders" && cartItems > 0 && (
              <span className='nav-badge'>{cartItems}</span>
            )}
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        {userRole === "ADMIN" && activeTab !== 'profile' && (
           <button onClick={() => navigate('/profile')} className="nav-btn" data-tooltip="Profile">
              <Users size={22}/>
           </button>
        )}
        <button onClick={logout} className="nav-btn logout" data-tooltip="Logout">
          <LogOut size={22}/>
        </button>
      </div>

      <style jsx>{`
        .nav-sidebar {
          width: 80px;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid #edf2f7;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 0;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .sidebar-brand {
          margin-bottom: 40px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .sidebar-brand:hover { transform: scale(1.1); }

        .brand-icon {
          width: 48px;
          height: 48px;
          background: #e6faf2;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00d084;
        }

        .nav-menu {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          align-items: center;
        }

        .nav-btn {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          border: none;
          background: transparent;
          color: #718096;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-label {
          position: absolute;
          left: 70px;
          background: #1a202c;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          opacity: 0;
          pointer-events: none;
          transform: translateX(-10px);
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .nav-btn:hover .nav-label {
          opacity: 1;
          transform: translateX(0);
        }

        .nav-btn:hover {
          color: #00d084;
          background: #f0fdf4;
        }

        .nav-btn.active {
          background: #00d084;
          color: white;
          box-shadow: 0 8px 20px rgba(0, 208, 132, 0.3);
        }

        .nav-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #ff4d4d;
          color: white;
          font-size: 10px;
          font-weight: 800;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-top: 20px;
          border-top: 1px solid #edf2f7;
          width: 100%;
          align-items: center;
        }

        .nav-btn.logout:hover {
          color: #ff4d4d;
          background: #fff5f5;
        }

        @media (max-width: 768px) {
          .nav-sidebar {
            width: 100%;
            height: 70px;
            flex-direction: row;
            padding: 0 20px;
            position: fixed;
            bottom: 0;
            top: auto;
            border-right: none;
            border-top: 1px solid #edf2f7;
            justify-content: space-between;
          }

          .sidebar-brand, .sidebar-footer, .nav-label {
            display: none;
          }

          .nav-menu {
            flex-direction: row;
            justify-content: space-around;
            gap: 0;
          }

          .nav-btn {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;