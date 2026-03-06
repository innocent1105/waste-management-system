import React, { useState } from 'react';
import { Mail, ArrowRight, Zap, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Login.css';
import { API_BASE_URL } from '../components/Config';
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
      console.log(API_BASE_URL)
      
console.log("logging")
    try {
      const response = await axios.post(`${API_BASE_URL}/login.php`, { email });
        
      console.log(response.data)
      if (response.data.success) {
        navigate('/verify-otp', { state: { email: email } });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.log(err)
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
            <h1>Waste <br/>Management System.</h1>
            <p>A modern solution for efficient waste management.</p>
          </div>
          <div className="brand-badge-row">
            <div className="badge-pill"><ShieldCheck size={16}/> Secured by Cynite Technologies.</div>
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
            <div className={`input-block ${error ? 'has-error' : ''}`}>
              <label>Email Address</label>
              <div className="field-wrapper">
                <Mail size={18} className="field-icon"/>
                <input 
                  type="email" 
                  placeholder="name@gmail.com" 
                  value={email}
                  required
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
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
                <>Sending Code <Loader2 size={20} className="spinner" /></>
              ) : (
                <>Get Login Code <ArrowRight size={20}/></>
              )}
            </button>
          </form>

          <p className="auth-footer-note">
            We'll send a one-time verification code to your inbox to keep your account secure.
          </p>
        </div>
      </div>
    </div>
  );
}