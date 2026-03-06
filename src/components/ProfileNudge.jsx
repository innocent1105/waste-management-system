import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Phone, ArrowRight, X, Sparkles } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function ProfileCompletionOverlay({ user }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && (!user.shipping_address || !user.phone)) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            setIsExiting(false);
        }, 400); 
    };

    if (!isVisible) return null;

    const fields = [user?.full_name, user?.email, user?.phone, user?.shipping_address];
    const completed = fields.filter(val => val && val.trim() !== "").length;
    const progress = (completed / fields.length) * 100;

    return (
        <div className={`overlay-backdrop ${isExiting ? 'fade-out' : ''}`}>
            <div className={`big-nudge-card ${isExiting ? 'slide-down' : ''}`}>
                {/* <button className="close-x" onClick={handleClose}>
                    <X size={22} />
                </button> */}

                <div className="card-left-brand">
                    <div className="brand-icon-stack">
                        <div className="icon-circle">
                            <ShieldCheck size={42} className="shield-anim" />
                        </div>
                    </div>
                    
                    <div className="progress-section">
                        <div className="progress-label">
                            <span>Profile Strength</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="card-right-content">
                    <div className="content-header">
                        <span className="premium-tag"><Sparkles size={12} /> Account Security</span>
                        <h2 className="title-gradient">Finalize Your Profile</h2>
                        <p className="subtitle">
                            You're almost there! Complete your details to unlock secure payments and priority collection.
                        </p>
                    </div>
                    
                    <div className="requirement-list">
                        <div className={`req-item ${user?.phone ? 'done' : 'pending'}`}>
                            <div className="req-status-icon">
                                {user?.phone ? '✓' : <Phone size={14} />}
                            </div>
                            <div className="req-text">
                                <strong>Phone Number</strong>
                                <span>Required for collections updates</span>
                            </div>
                        </div>

                        <div className={`req-item ${user?.shipping_address ? 'done' : 'pending'}`}>
                            <div className="req-status-icon">
                                {user?.shipping_address ? '✓' : <MapPin size={14} />}
                            </div>
                            <div className="req-text">
                                <strong>Waste collection Address</strong>
                                <span>Required for faster collections</span>
                            </div>
                        </div>
                    </div>

                    <div className="action-footer">
                        <button className="primary-setup-btn" onClick={() => navigate('/profile')}>
                            Complete Now <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}