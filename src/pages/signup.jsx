import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../SignUp.css';
import axios from 'axios';
import { API_BASE_URL } from '../components/Config';

export default function SignUp() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'BUYER'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
const handleSubmit = async (e) => {
  e.preventDefault();
  
  setLoading(true);
  setError(false); 

  try {
    const response = await axios.post(`${API_BASE_URL}/register.php`, formData);
    console.log(response.data);
    if (response.data.success) {
        navigate('/login', { 
            state: { email: formData.email, username: formData.full_name } 
        });
    } else {
      setError(true); 
      setErrorMessage(response.data.message);
    }
  } catch (err) {
    console.error("Submission Error:", err);
    setErrorMessage("Please check your internet connection and try again.");
  } finally {
    setLoading(false);
    return;
  }
};
  return (
    <div className="auth-split-screen">
      <div className="auth-black-panel">
        <div className="panel-inner">
          <div className="hero-text">
            <h1>Waste <br/>Collection.</h1>
            <p>Eco-friendly waste management solutions.</p>
          </div>
          <div className="panel-footer">
            <div className="security-tag">
              <ShieldCheck size={18}/> <span>Enterprise Grade Security</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-white-panel">
        <div className="form-content-wrapper">
          <header className="auth-header">
            <h2>Create Account</h2>
            <p>Already have an account? <span className="auth-link" onClick={() => navigate('/login')}>Login</span></p>
          </header>

            {error && (
                <div className='auth-form-error'>
                    {errorMessage}
                </div>
            )}
          <form onSubmit={handleSubmit} className="auth-form-flow">
            <div className="auth-input-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="icon-lead"/>
                <input 
                  type="text" 
                  placeholder="Joe" 
                  required 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
            </div>

            <div className="auth-grid-row">
              <div className="auth-input-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="icon-lead"/>
                  <input 
                    type="email" 
                    placeholder="name@gmail.com" 
                    required 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Phone</label>
                <div className="input-with-icon">
                  <Phone size={18} className="icon-lead"/>
                  <input 
                    type="tel" 
                    placeholder="+260..." 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="icon-lead"/>
                <input 
                  type={showPass ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            {loading ? (
                <div className="auth-submit-btn">
                    Please wait...
                </div>
            ) : (
                <button type="submit" className="auth-submit-btn">
                    Create Account <ArrowRight size={20}/>
                </button>
            )}
          </form>

          <p className="auth-footer-text">
            By signing up, you agree to our <strong>Terms</strong> and <strong>Privacy Policy</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}