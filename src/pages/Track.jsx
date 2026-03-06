import React, { useEffect, useState, useRef } from 'react';
import { Search, Bell, Truck, Phone, Settings, MapPin, User, Navigation, Plus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import axios from 'axios';

import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../components/Config';
import '../Transaction.css'; 

// --- Leaflet Icon Fix & Custom Icons ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1048/1048329.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

// --- Routing Engine Component ---
function RoutingControl({ userPos, truckPos }) {
    const map = useMap();
    const routingRef = useRef(null);

    useEffect(() => {
        if (!map || !userPos || !truckPos) return;

        routingRef.current = L.Routing.control({
            waypoints: [L.latLng(userPos[0], userPos[1]), L.latLng(truckPos[0], truckPos[1])],
            lineOptions: { styles: [{ color: '#00d084', weight: 5, opacity: 0.7 }] },
            createMarker: () => null,
            addWaypoints: false,
            draggableWaypoints: false,
            show: false 
        }).addTo(map);

        return () => {
            if (routingRef.current) map.removeControl(routingRef.current);
        };
    }, [map, userPos, truckPos]);

    return null;
}

export default function Home() {
    const navigate = useNavigate();
    const [userPos, setUserPos] = useState([-15.3975, 28.3328]); 
    const [truckPos, setTruckPos] = useState(null);
    const [activeOrder, setActiveOrder] = useState(false);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserPos([position.coords.latitude, position.coords.longitude]);
            });
        }
    }, []);

    useEffect(() => {
        const fetchTruck = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/get_truck_location.php`);
                if (res.data.success) {
                    setTruckPos([res.data.lat, res.data.lng]);
                    setActiveOrder(true);
                }
            } catch (err) {
                console.error("Tracking error", err);
            }
        };

        fetchTruck();
        const interval = setInterval(fetchTruck, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="tracker-container">
            <Sidebar active={"home"} />
            
            <main className="main-content">
        

                <div className="map-wrapper">
                    <MapContainer 
                        center={userPos} 
                        zoom={15} 
                        zoomControl={false}
                        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        
                        <Marker position={userPos}>
                            <Popup>Your Location</Popup>
                        </Marker>

                        {truckPos && (
                            <>
                                <Marker position={truckPos} icon={truckIcon}>
                                    <Popup>Truck #1 - En Route</Popup>
                                </Marker>
                                <RoutingControl userPos={userPos} truckPos={truckPos} />
                            </>
                        )}

                        <ChangeView center={userPos} />
                    </MapContainer>

                    <div className="tracking-overlay">
                        <div className="status-card request-card animate-in">
                            <div className="card-header">
                                <div className="truck-icon-bg">
                                    <Truck size={24} color="#fff" />
                                </div>
                                <div className="status-text-group">
                                    <h2 className="status-title">
                                        {activeOrder ? "Live Tracking" : "Waste Collection"}
                                    </h2>
                                    <p style={{fontSize: '13px', color: '#666', margin: 0}}>
                                        {activeOrder ? "Truck is arriving soon" : "Reliable disposal at your doorstep"}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="location-box-mini">
                                <MapPin size={14} color="#00d084" />
                                <span>{activeOrder ? "Optimized route found" : "Location detected automatically"}</span>
                            </div>

                            <button 
                                className="main-btn" 
                                onClick={() => navigate('/orders')}
                                style={{ background: '#00d084', marginTop: '10px' }}
                            >  Order Details
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Custom Scoped Styles */}
            <style jsx>{`
                .tracker-container { display: flex; height: 100vh; background: #f8f9fa; overflow: hidden; }
                .main-content { flex: 1; display: flex; flex-direction: column; padding: 0px; position: relative; }
                .map-wrapper { flex: 1; position: relative; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 4px solid white; }
                .tracking-overlay { position: absolute; bottom: 30px; left: 30px; z-index: 1000; width: 340px; }
                .status-card { background: white; padding: 24px; border-radius: 24px; box-shadow: 0 15px 40px rgba(0,0,0,0.12); }
                .hub-header { display: flex; justify-content: space-between; align-items: center; padding: 0 0 20px 0; }
                .welcome-text { font-size: 22px; font-weight: 800; color: #1a1a1a; }
                .welcome-text-2 { display: none; }
                .text-green { color: #00d084; }
                .action-pill { background: white; border: 1px solid #eee; padding: 6px; border-radius: 16px; display: flex; align-items: center; gap: 5px; }
                .header-icon-btn { background: transparent; border: none; width: 38px; height: 38px; border-radius: 10px; cursor: pointer; position: relative; }
                .notification-dot { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: #ff4d4d; border: 2px solid white; border-radius: 50%; }
                .divider-v { width: 1px; height: 24px; background: #eee; margin: 0 10px; }
                .user-profile-group { display: flex; align-items: center; gap: 12px; }
                .avatar-frame { width: 36px; height: 36px; border-radius: 10px; overflow: hidden; background: #e6faf2; }
                .avatar-frame img { width: 100%; height: 100%; object-fit: cover; }
                .u-name { font-size: 13px; font-weight: 700; color: #1a1a1a; }
                .u-status { font-size: 11px; color: #00d084; font-weight: 600; }
                .truck-icon-bg { background: #00d084; padding: 12px; border-radius: 14px; }
                .main-btn { width: 100%; color: white; border: none; padding: 14px; border-radius: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.3s; }
                
                @media (max-width: 768px) {
                    .main-content { padding: 10px; }
                    .header-left { display: none; }
                    .welcome-text-2 { display: block; font-size: 18px; font-weight: 800; margin-bottom: 10px; }
                    .header-right { flex-direction: column; align-items: flex-start; width: 100%; }
                    .action-pill { width: 100%; justify-content: space-between; }
                    .tracking-overlay { left: 10px; right: 10px; width: auto; bottom: 80px; }
                    .user-info-meta { display: none; }
                }
            `}</style>
        </div>
    );
}

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}