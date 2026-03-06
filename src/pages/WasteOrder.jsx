import React, { useEffect, useState } from 'react';
import { Search, Bell, Truck, Phone, Settings, MapPin, User, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import Sidebar from '../components/Sidebar';
import '../Transaction.css'; 

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RoutingMachine = ({ userPos, truckPos }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !userPos || !truckPos) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(truckPos[0], truckPos[1]),
                L.latLng(userPos[0], userPos[1])
            ],
            lineOptions: {
                styles: [{ color: '#00d084', weight: 5, opacity: 0.7 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            show: false, 
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            createMarker: () => null,
        }).addTo(map);

        return () => {
            if (map && routingControl) {
                map.removeControl(routingControl);
            }
        };
    }, [map, userPos, truckPos]);

    return null;
};

// --- Custom Markers ---
const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048329.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1673/1673188.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

export default function Home() {
    const [activeOrder, setActiveOrder] = useState(true);
    
    // Initial Coordinates (Example: Lusaka)
    const [truckPos, setTruckPos] = useState([-15.3875, 28.3228]);
    const [userPos, setUserPos] = useState([-15.3975, 28.3328]);

    // Simulated Real-time Movement (Optional)
    useEffect(() => {
        if (activeOrder) {
            const interval = setInterval(() => {
                setTruckPos(prev => [
                    prev[0] - 0.0001, // Simulate moving south towards user
                    prev[1] + 0.0001  // Simulate moving east
                ]);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [activeOrder]);

    return (
        <div className="tracker-container">
            <Sidebar active={"home"} />
            
            <main className="main-content">
                <header className="hub-header">
                    <div className="search-container">
                        <Search size={18} color="#999" />
                        <input type="text" placeholder="Search for services or track collection..." />
                    </div>
                    <div className="header-actions">
                        <button className="icon-btn"><Bell size={20} /></button>
                        <div className="user-profile-mini">
                            <div className="avatar-small">JD</div>
                        </div>
                    </div>
                </header>

                <div className="map-wrapper">
                    <MapContainer 
                        center={userPos} 
                        zoom={14} 
                        zoomControl={false}
                        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                    >
                        {/* Map Style: Using Carto Light for a modern SaaS look */}
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        
                        <RoutingMachine userPos={userPos} truckPos={truckPos} />

                        <Marker position={userPos} icon={userIcon}>
                            <Popup><b>Your Location</b><br/>Collection Point A</Popup>
                        </Marker>

                        <Marker position={truckPos} icon={truckIcon}>
                            <Popup><b>Waste Collection Truck</b><br/>Status: In Transit</Popup>
                        </Marker>
                    </MapContainer>

                    {/* Floating Tracking Overlay */}
                    <div className="tracking-overlay">
                        {activeOrder ? (
                            <div className="status-card animate-in">
                                <div className="card-header">
                                    <div className="truck-icon-bg">
                                        <Truck size={24} color="#fff" />
                                    </div>
                                    <div className="status-text-group">
                                        <div className="eta-badge">Arriving in 8 mins</div>
                                        <h2 className="status-title">Collection in progress</h2>
                                    </div>
                                </div>
                                
                                <div className="location-info">
                                    <MapPin size={16} className="text-green" /> 
                                    <span>Heading to: <b>Independence Ave, Plot 42</b></span>
                                </div>

                                <div className="driver-mini-card">
                                    <div className="driver-avatar">
                                        <User size={16} />
                                    </div>
                                    <div className="driver-meta">
                                        <span className="driver-name">Bwalya Mwewa</span>
                                        <span className="truck-plate">ABG 4452 • Waste Management</span>
                                    </div>
                                </div>

                                <div className="btn-group">
                                    <button className="main-btn">
                                        <Navigation size={18} /> View Detailed Route
                                    </button>
                                    <button className="secondary-btn">
                                        <Phone size={20} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="status-card empty">
                                <p>No active collections today.</p>
                                <button className="main-btn">Request Pick-up</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .tracker-container { display: flex; height: 100vh; background: #f8f9fa; transition-duration : 0.3s }
                .main-content { flex: 1; display: flex; flex-direction: column; padding: 20px; position: relative; }
                .hub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .search-container { background: white; display: flex; align-items: center; padding: 10px 20px; border-radius: 12px; width: 400px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                .search-container input { border: none; outline: none; margin-left: 10px; width: 100%; font-size: 14px; }
                
                .map-wrapper { flex: 1; position: relative; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 4px solid white; }
                
                .tracking-overlay { position: absolute; bottom: 30px; left: 30px; z-index: 1000; width: 340px; }
                .status-card { background: white; padding: 20px; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.15); }
                .card-header { display: flex; gap: 15px; align-items: center; margin-bottom: 15px; }
                .truck-icon-bg { background: #00d084; padding: 12px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
                
                .eta-badge { background: #e6faf2; color: #00d084; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 4px; }
                .status-title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0; }
                
                .location-info { font-size: 13px; color: #666; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
                .driver-mini-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 12px; margin-bottom: 15px; }
                .driver-avatar { width: 32px; height: 32px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .driver-meta { display: flex; flex-direction: column; }
                .driver-name { font-size: 13px; font-weight: 600; }
                .truck-plate { font-size: 11px; color: #888; }
                
                .btn-group { display: flex; gap: 10px; }
                .main-btn { flex: 1; background: #1a1a1a; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.2s; }
                .main-btn:hover { background: #333; }
                .secondary-btn { background: #f0f0f0; border: none; padding: 12px; border-radius: 12px; cursor: pointer; }
                
                .animate-in { animation: slideUp 0.5s ease-out; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
}