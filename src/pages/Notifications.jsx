import React, { useEffect, useState } from 'react';
import { Bell, Package, Info, AlertTriangle, CheckCircle, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../components/Config';
import "../Notifications.css";

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem(API_BASE_URL.slice(8, 15));

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/notifications.php?user_id=${token}`);
                if (res.data.success) {
                    setNotifications(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [token, navigate]);

    // Helper to get Icon based on 
    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'order': return <Package className="nt-icon order" />;
            case 'alert': return <AlertTriangle className="nt-icon alert" />;
            case 'success': return <CheckCircle className="nt-icon success" />;
            default: return <Info className="nt-icon info" />;
        }
    };

    return (
        <div className="pos-wrapper">
            <Sidebar active={"notifications"} />

            <main className="main-hub">
                <header className="hub-header-notif">
                    <div className="header-flex">
                        <button className="back-circle" onClick={() => navigate("/")}>
                            <ArrowLeft size={20} />
                        </button>
                    </div>
                    <div className='note-header-text'>Notifications</div>
                </header>

                <section className="notifications-container">
                    {loading ? (
                        <div className="skeleton-list">
                            {[1, 2, 3].map(n => <div key={n} className="skeleton-card" style={{height: '80px', marginBottom: '10px'}}></div>)}
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="notif-list">
                            {notifications.map((n) => (
                                <div key={n.id} className={`notif-card ${n.status === 'unread' ? 'unread' : ''}`}>
                                    <div className="notif-icon-wrapper">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="notif-content">
                                        <div className="notif-header">
                                            <h4>{n.title}</h4>
                                            <span className="notif-time">
                                                <Clock size={12} /> {new Date(n.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p>{n.message}</p>
                                    </div>
                                    <button className="notif-delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-notif">
                            <h3>All caught up!</h3>
                            <p>No new notifications at the moment.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}