import React, { useEffect, useState } from 'react';
import { User, Mail, MapPin, Phone, Edit3, Trash2, X, ArrowLeft, Loader2, Save, CheckCircle, LogOut, ChevronRight, Navigation, LocateFixed } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../components/Config';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showToast, setShowToast] = useState(false);
    
    // Geolocation State
    const [geoLoading, setGeoLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const [editData, setEditData] = useState({ 
        full_name: '', 
        phone: '', 
        address_line: '',
        latitude: null,
        longitude: null,
        city: ''
    });
    
    const token = localStorage.getItem(API_BASE_URL.slice(8, 15));

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/profile_actions.php?user_id=${token}`);
                console.log(res.data)

            if (res.data.success) {
                const userData = res.data.data;
                setUser(userData);
                setEditData({
                    full_name: userData.full_name || '',
                    phone: userData.phone || '',
                    address_line: userData.address_line || '',
                    latitude: userData.latitude || null,
                    longitude: userData.longitude || null,
                    city: userData.city || ''
                });
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) { navigate("/login"); return; }
        fetchProfile();
    }, []);

    const detectLocation = () => {
        setGeoLoading(true);
        setLocationError(null);
        if (!navigator.geolocation) {
            setLocationError("Geolocation not supported");
            setGeoLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setEditData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                setGeoLoading(false);
            },
            () => {
                setLocationError("Access denied. Enable GPS.");
                setGeoLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/profile_actions.php?user_id=${token}`, editData);
            if (res.data.success) {
                await fetchProfile();
                setIsEditModalOpen(false); 
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (err) {
            console.error("Update failed:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return (
        <div className="modern-loading">
            <Loader2 className="spin" size={40} color="#00d084" />
            <p>Syncing Profile...</p>
            <style>{`.modern-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#64748b;}.spin{animation:spin 1s linear infinite;}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div className="profile-container">
            <Sidebar active={"profile"} />
            
            <main className="profile-main">
                <header className="profile-header">
                    <div className="header-left">
                        <button className="icon-btn" onClick={() => navigate(-1)}><ArrowLeft size={20}/></button>
                        <h1>Account Settings</h1>
                    </div>
                    <button className="primary-edit-btn" onClick={() => setIsEditModalOpen(true)}>
                        <Edit3 size={18} /> Edit Profile
                    </button>
                </header>

                <div className="profile-content">
                    {/* User Hero */}
                    <div className="user-hero-card">
                        <div className="hero-avatar">
                            {user?.full_name?.charAt(0).toUpperCase() || <User />}
                        </div>
                        <div className="hero-info">
                            <h2>{user?.full_name || "Resident"}</h2>
                            <span className="role-tag">{user?.role || "BUYER"}</span>
                            <div className="loc-status">
                                <Navigation size={12} color={user?.latitude ? "#00d084" : "#94a3b8"} />
                                <span>{user?.latitude ? "Location Verified" : "No GPS Data"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="details-grid">
                        <InfoCard icon={<Mail size={20} />} label="Email Address" value={user?.email} />
                        <InfoCard icon={<Phone size={20} />} label="Phone Contact" value={user?.phone || "Not set"} />
                        <InfoCard 
                            icon={<MapPin size={20} />} 
                            label="Pickup Address" 
                            value={user?.address_line || "Set your collection point"} 
                            fullWidth
                        />
                    </div>

                    {/* Management */}
                    <div className="management-section">
                        <h3>Management</h3>
                        <div className="action-row" onClick={() => { localStorage.clear(); navigate("/login"); }}>
                            <div className="action-meta">
                                <div className="action-icon blue"><LogOut size={18} /></div>
                                <div><strong>Sign Out</strong><p>Exit your session</p></div>
                            </div>
                            <ChevronRight size={18} color="#cbd5e0" />
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="m-header">
                            <h3>Update Profile</h3>
                            <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleUpdate} className="m-form">
                            <div className="m-input">
                                <label>Full Name</label>
                                <input value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} required />
                            </div>
                            <div className="m-input">
                                <label>Phone Number</label>
                                <input value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                            </div>
                            <div className="m-input">
                                <label>Collection Address</label>
                                <textarea rows="2" value={editData.address_line} onChange={e => setEditData({...editData, address_line: e.target.value})} />
                                <button type="button" className={`gps-trigger ${editData.latitude ? 'synced' : ''}`} onClick={detectLocation}>
                                    {geoLoading ? <Loader2 className="spin" size={16}/> : <Navigation size={16}/>}
                                    {editData.latitude ? "GPS Captured" : "Auto-detect Location"}
                                </button>
                                {locationError && <p className="error-text">{locationError}</p>}
                            </div>
                            <button className="submit-btn" disabled={isUpdating}>
                                {isUpdating ? <Loader2 className="spin" size={20}/> : "Save Changes"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showToast && <div className="toast-notification"><CheckCircle size={18} /> Profile Synced</div>}

            <style>{`
                .profile-container { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
                .profile-main { flex: 1; padding: 2rem; max-width: 1000px; margin: 0 auto; width: 100%; }
                
                .profile-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
                .header-left { display: flex; align-items: center; gap: 1rem; }
                .header-left h1 { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 0; }
                
                .primary-edit-btn { background: #1e293b; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; gap: 0.5rem; align-items: center; transition: 0.2s; }
                .primary-edit-btn:hover { background: #00d084; transform: translateY(-2px); }

                .user-hero-card { background: white; padding: 2rem; border-radius: 24px; display: flex; align-items: center; gap: 1.5rem; border: 1px solid #f1f5f9; margin-bottom: 1.5rem; }
                .hero-avatar { width: 70px; height: 70px; background: linear-gradient(135deg, #00d084, #00a36c); border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800; color: white; box-shadow: 0 8px 16px -4px rgba(0,208,132,0.3); }
                .hero-info h2 { margin: 0; font-size: 1.25rem; color: #0f172a; }
                .role-tag { background: #ecfdf5; color: #059669; font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 20px; display: inline-block; margin: 0.5rem 0; }
                .loc-status { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #64748b; font-weight: 600; }

                .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
                .info-card { background: white; padding: 1.5rem; border-radius: 20px; border: 1px solid #f1f5f9; display: flex; gap: 1rem; }
                .info-card.full { grid-column: span 2; }
                .i-icon { background: #f0fdf4; color: #00d084; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .i-content label { display: block; font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem; }
                .i-content p { margin: 0; color: #334155; font-weight: 600; font-size: 0.95rem; }

                .management-section { background: white; border-radius: 24px; padding: 2rem; border: 1px solid #f1f5f9; margin-top: 1.5rem; }
                .management-section h3 { margin: 0 0 1.25rem; font-size: 1rem; color: #1e293b; }
                .action-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-radius: 16px; cursor: pointer; transition: 0.2s; }
                .action-row:hover { background: #f8fafc; }
                .action-meta { display: flex; gap: 1rem; align-items: center; }
                .action-icon { padding: 8px; border-radius: 10px; }
                .action-icon.blue { background: #eff6ff; color: #3b82f6; }

                .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
                .modal-card { background: white; width: 100%; max-width: 450px; padding: 2rem; border-radius: 28px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
                .m-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .close-btn { background: none; border: none; cursor: pointer; color: #94a3b8; }
                .m-input { margin-bottom: 1.25rem; }
                .m-input label { display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; }
                .m-input input, .m-input textarea { width: 100%; padding: 0.85rem; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 0.9rem; transition: 0.2s; box-sizing: border-box; }
                .m-input input:focus { border-color: #00d084; outline: none; background: white; }
                
                .gps-trigger { margin-top: 0.75rem; width: 100%; padding: 0.75rem; border: 2px dashed #e2e8f0; border-radius: 12px; background: none; font-weight: 700; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.85rem; }
                .gps-trigger.synced { background: #f0fdf4; border: 2px solid #00d084; color: #166534; }
                
                .submit-btn { width: 100%; background: #1e293b; color: white; border: none; height: 50px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .submit-btn:hover { background: #00d084; }

                .toast-notification { position: fixed; bottom: 2rem; right: 2rem; background: #1e293b; color: white; padding: 1rem 1.5rem; border-radius: 16px; display: flex; align-items: center; gap: 0.75rem; font-weight: 600; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); animation: slideIn 0.3s ease; }
                @keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                @media (max-width: 768px) {
                    .profile-container { flex-direction: column; }
                    .profile-main { padding: 1rem; }
                    .details-grid { grid-template-columns: 1fr; }
                    .info-card.full { grid-column: span 1; }
                    .user-hero-card { flex-direction: column; text-align: center; padding: 1.5rem; }
                    .toast-notification { left: 1rem; right: 1rem; bottom: 1rem; justify-content: center; }
                }
            `}</style>
        </div>
    );
}

function InfoCard({ icon, label, value, fullWidth }) {
    return (
        <div className={`info-card ${fullWidth ? 'full' : ''}`}>
            <div className="i-icon">{icon}</div>
            <div className="i-content">
                <label>{label}</label>
                <p>{value}</p>
            </div>
        </div>
    );
}