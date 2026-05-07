import React, { useState } from 'react';
import { Phone, Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Login.css';
import { API_BASE_URL } from '../components/Config';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/login.php`, { 
        phone: phone,
        password: password 
      });
      
      if (response.data.success) {
        console.log(response.data)
        localStorage.setItem(API_BASE_URL.slice(8, 15), response.data.ecom_auth_key);
        localStorage.setItem(`${API_BASE_URL.slice(8, 15)}-role`, response.data.role);

        navigate('/'); 
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-page">
      <div className="auth-brand-half">
        <div className="brand-content-box">
          <div className="text-group">
            <h1>Waste <br/>Collection.</h1>
            <p>Eco-friendly waste management solutions.</p>
          </div>
          <div className="brand-badge-row">
            <div className="badge-pill"><ShieldCheck size={16}/> Secured by Cynite.</div>
            <div className="badge-pill">v2.4.0</div>
          </div>
        </div>
      </div>

      <div className="auth-form-half">
        <div className="form-container-limit">
          <header className="auth-header">
            <h2>Welcome Back</h2>
            <p>New here? <span className="link-text" onClick={() => navigate('/signup')}>Create an account</span></p>
          </header>

          <form onSubmit={handleSubmit} className="auth-form-main">
            {/* Phone Number Input */}
            <div className={`input-block ${error ? 'has-error' : ''}`}>
              <label>Phone Number</label>
              <div className="field-wrapper">
                <Phone size={18} className="field-icon"/>
                <input 
                  type="text" 
                  placeholder="097..." 
                  value={phone}
                  required
                  disabled={loading}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if(error) setError(''); 
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className={`input-block ${error ? 'has-error' : ''}`}>
              <label>Password</label>
              <div className="field-wrapper">
                <Lock size={18} className="field-icon"/>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  required
                  disabled={loading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if(error) setError(''); 
                  }}
                />
              </div>
              
              {error && (
                <div className="error-banner">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button type="submit" className="login-trigger" disabled={loading}>
              {loading ? (
                <>Logging in... <Loader2 size={20} className="spinner" /></>
              ) : (
                <>Sign In <ArrowRight size={20}/></>
              )}
            </button>
          </form>

          <p className="auth-footer-note">
            Secure login powered by Pascom Innovations.
          </p>
        </div>
      </div>
    </div>
  );
}