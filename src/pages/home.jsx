import React, { useEffect, useState } from 'react';
import { Bell, Truck, Settings, MapPin, Navigation, Plus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import axios from 'axios';
import { API_BASE_URL } from '../components/Config';

import 'leaflet/dist/leaflet.css';
import Sidebar from '../components/Sidebar';
import '../Transaction.css'; 

export default function Home() {
    const navigate = useNavigate();
    const [userPos, setUserPos] = useState([-15.3975, 28.3328]); 
    const [hasActiveOrder, setHasActiveOrder] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Get the user ID from localStorage (matching your logic)
    const user_token = localStorage.getItem(API_BASE_URL.slice(8, 15)); 

    useEffect(() => {
        // 1. Get Location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserPos([position.coords.latitude, position.coords.longitude]);
            });
        }

        // 2. Check Order Status via POST
        const checkStatus = async () => {
            if (!user_token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/check_active_order.php`, {
                    user_token: user_token
                });
                console.log("Active Order Check:", response.data);

                if (response.data.success && response.data.hasActiveOrder) {
                    setHasActiveOrder(true);
                }
            } catch (error) {
                console.error("Connection error", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkStatus();
    }, [user_token]);

    return (
        <div className="tracker-container">
            <Sidebar active={"home"} />
            
            <main className="main-content">
                <header className="hub-header">
                    <div className="header-left">
                        <h1 className="welcome-text">Waste <span className="text-green">Collection</span></h1>
                    </div>
                    <div className="header-right">
                        <h1 className="welcome-text-2">Waste <span className="text-green">Collection</span></h1>
                        <div className="action-pill">
                            <button className="header-icon-btn"><Bell size={20} /><span className="notification-dot"></span></button>
                            <button className="header-icon-btn"><Settings size={20} /></button>
                            <div className="divider-v"></div>
                            <div className="user-profile-group">
                                <div className="avatar-frame">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Albert" alt="User" />
                                </div>
                                <div className="user-info-meta">
                                    <span className="u-name">John Doe</span>
                                    <span className="u-status">Premium User</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="map-wrapper">
                    <MapContainer center={userPos} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        <ChangeView center={userPos} />
                        <Marker position={userPos} />
                    </MapContainer>

                    <div className="tracking-overlay">
                        <div className="status-card animate-in">
                            <div className="card-header">
                                <div className="truck-icon-bg"><Truck size={24} color="#fff" /></div>
                                <div className="status-text-group">
                                    <h2 className="status-title">{hasActiveOrder ? "Tracking Active" : "New Collection"}</h2>
                                    <p style={{fontSize: '13px', color: '#666', margin: 0}}>
                                        {hasActiveOrder ? "Your collector is en route" : "Reliable disposal at your doorstep"}
                                    </p>
                                </div>
                            </div>

                            <div className="location-box-mini">
                                <MapPin size={14} color="#00d084" />
                                <span>GPS Location Active</span>
                            </div>

                            {!isLoading && (
                                hasActiveOrder ? (
                                    <button className="main-btn" onClick={() => navigate('/track')} style={{ background: '#1a1a1a' }}>
                                        <Navigation size={20} /> View Live Map
                                    </button>
                                ) : (
                                    <button className="main-btn" onClick={() => navigate('/order-placement')} style={{ background: '#00d084' }}>
                                        <Plus size={20} /> Place Order
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Styles are the same as your responsive design provided earlier */}
            <style jsx>{`
    /* 1. Layout & Core Containers */
    .tracker-container { 
        display: flex; 
        height: 100vh; 
        width: 100vw;
        background: #f8f9fa; 
        overflow: hidden;
    }

    .main-content { 
        flex: 1; 
        display: flex; 
        flex-direction: column; 
        padding: 24px; 
        position: relative; 
        transition: all 0.3s ease;
    }

    /* 2. Header Styles */
    .hub-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        background: transparent;
    }

    .welcome-text { font-size: 24px; font-weight: 800; color: #1a1a1a; margin: 0; letter-spacing: -0.5px; }
    .welcome-text-2 { display: none; }
    .text-green { color: #00d084; }

    .header-right { display: flex; align-items: center; gap: 15px; }

    .action-pill {
        background: white;
        border: 1px solid #eee;
        padding: 6px 12px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    .header-icon-btn {
        background: #f8f9fa;
        border: none;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        color: #555;
        cursor: pointer;
        position: relative;
        transition: 0.2s;
    }

    .header-icon-btn:hover { background: #eef2f5; color: #00d084; }
    
    .notification-dot {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 8px;
        height: 8px;
        background: #ff4d4d;
        border: 2px solid white;
        border-radius: 50%;
    }

    .divider-v { width: 1px; height: 24px; background: #eee; margin: 0 8px; }

    .user-profile-group { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .avatar-frame { width: 38px; height: 38px; border-radius: 12px; overflow: hidden; background: #e6faf2; border: 1px solid #eee; }
    .avatar-frame img { width: 100%; height: 100%; object-fit: cover; }
    .u-name { font-size: 14px; font-weight: 700; color: #1a1a1a; line-height: 1.2; }
    .u-status { font-size: 11px; color: #00d084; font-weight: 600; }

    /* 3. Map Wrapper */
    .map-wrapper { 
        flex: 1; 
        position: relative; 
        border-radius: 24px; 
        overflow: hidden; 
        box-shadow: 0 12px 40px rgba(0,0,0,0.08); 
        border: 6px solid white; 
    }

    /* 4. Tracking Overlay Card */
    .tracking-overlay { 
        position: absolute; 
        bottom: 30px; 
        left: 30px; 
        z-index: 1000; 
        width: 350px; 
    }

    .status-card { 
        background: white; 
        padding: 24px; 
        border-radius: 28px; 
        box-shadow: 0 20px 50px rgba(0,0,0,0.15); 
    }

    .card-header { display: flex; gap: 16px; align-items: center; margin-bottom: 18px; }
    .truck-icon-bg { 
        background: #00d084; 
        padding: 14px; 
        border-radius: 18px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 8px 15px rgba(0, 208, 132, 0.2);
    }
    
    .status-title { font-size: 20px; font-weight: 800; color: #1a1a1a; margin: 0; }
    .location-box-mini { 
        background: #f0fdf4; 
        padding: 12px 16px; 
        border-radius: 14px; 
        display: flex; 
        align-items: center; 
        gap: 10px; 
        font-size: 13px; 
        color: #008a58; 
        font-weight: 600; 
        margin-bottom: 20px; 
    }

    /* 5. Buttons */
    .main-btn { 
        width: 100%; 
        border: none; 
        padding: 16px; 
        border-radius: 16px; 
        font-weight: 700; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 12px; 
        cursor: pointer; 
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        font-size: 15px; 
        color: white;
    }

    .main-btn:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
    .main-btn:active { transform: translateY(-1px); }

    /* Live Pulse for Track Button */
    .btn-active-track {
        background: #1a1a1a;
        animation: pulse-black 2s infinite;
    }

    @keyframes pulse-black {
        0% { box-shadow: 0 0 0 0 rgba(26, 26, 26, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(26, 26, 26, 0); }
        100% { box-shadow: 0 0 0 0 rgba(26, 26, 26, 0); }
    }

    /* 6. Mobile Responsiveness */
    @media (max-width: 768px) {
        .main-content { padding: 12px; }
        
        .header-left { display: none; }
        .welcome-text-2 { display: block; font-size: 20px; font-weight: 800; color: #1a1a1a; margin-bottom: 10px; }
        
        .header-right { width: 100%; align-items: flex-start; }
        .action-pill { width: 100%; justify-content: space-between; border-radius: 14px; }
        
        .user-info-meta { display: none; } /* Hide names on small phones */

        .map-wrapper { border: none; border-radius: 20px; }

        .tracking-overlay { 
            left: 15px; 
            right: 15px; 
            width: auto; 
            bottom: 85px; /* Stay above bottom navigation if you have one */
        }

        .status-card { padding: 20px; border-radius: 24px; }
        .status-title { font-size: 18px; }
    }

    /* Animations */
    .animate-in { animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
    @keyframes slideUp { 
        from { transform: translateY(40px); opacity: 0; } 
        to { transform: translateY(0); opacity: 1; } 
    }
`}</style>
        </div>
    );
}

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => { map.setView(center); }, [center, map]);
    return null;
}