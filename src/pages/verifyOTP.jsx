import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, ShieldCheck, Smartphone, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../VerifyOTP.css';
import { useLocation} from 'react-router-dom';
import { API_BASE_URL } from '../components/Config';
import axios from 'axios';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const userEmail = location.state?.email || "your email";
  const userName = location.state?.username || "User";
  const inputRefs = useRef([]);

  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      handleVerify();
    }
  }, [otp]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError(false);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError(false);
    setErrorMessage("");

    try{
      const response = await axios.post(`${API_BASE_URL}/verify_otp.php`, {
        email: userEmail,
        otp: otp.join("")            
      });

      console.log(response.data);

      if(response.data.success){
        console.log("Success");
        localStorage.clear();
        localStorage.setItem(API_BASE_URL.slice(8, 15), response.data.ecom_auth_key);
        localStorage.setItem(`${API_BASE_URL.slice(8, 15)}-role`, response.data.role);

        navigate('/');
      }else{
          setError(true);
          setLoading(false);
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0].focus();
      }
    }catch(otp_error){
      console.log(otp_error)
      setError(true);
      setErrorMessage("Internet");
      setLoading(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    }
  };

  return (
    <div className="login-split-page">
      <div className="auth-brand-half">
        <div className="brand-content-box">
          <div className="logo-square"><Zap size={32} fill="currentColor"/></div>
          <div className="text-group">
            <h1>Secure <br/>Verification.</h1>
            <p>Enter the 6-digit code sent to your device to continue.</p>
          </div>
          <div className="brand-badge-row">
            <div className="badge-pill"><ShieldCheck size={16}/> Secured by Cynite.</div>
          </div>
        </div>
      </div>

      <div className="auth-form-half">
        <div className="form-container-limit">
          <header className="auth-header">
            <div className={`otp-icon-circle ${error ? 'error-shake' : ''} ${loading ? 'loading-pulse' : ''}`}>
              {loading ? <Loader2 size={32} className="spinner" /> : <Smartphone size={32} />}
            </div>
            <h2>{loading ? 'Verifying...' : 'Enter OTP'}</h2>
            <p>Enter the code sent to your email <b>{userEmail}</b>.</p>
            <p>Check your email <b>Spam folder</b>.</p>
          </header>

          <form onSubmit={handleVerify} className="auth-form-main">
            <div className={`otp-input-wrapper ${error ? 'error-state' : ''}`}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  ref={el => inputRefs.current[index] = el}
                  value={data}
                  disabled={loading}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="otp-field"
                />
              ))}
            </div>

            {error && errorMessage.length == 0 && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>Invalid verification code. Please try again.</span>
              </div>
            )}

            {errorMessage.length > 1 && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>Please check your internet connection and try again.</span>
              </div>
            )}




            <button type="submit" className="login-trigger" disabled={loading || otp.includes('')}>
              {loading ? 'Processing...' : 'Verify Now'}
              {!loading && <ArrowRight size={20}/>}
            </button>
          </form>

          <div className="otp-footer">
            <button className="resend-btn" disabled={timer > 0 || loading} onClick={() => setTimer(59)}>
              <RefreshCw size={14} />
              {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}