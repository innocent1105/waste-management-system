import React, { useEffect, useState } from 'react';
import { 
  Truck, CheckCircle2, Loader2, Smartphone, MapPin, 
  ShieldCheck, Info, ArrowLeft, Trash2, ArrowRight 
} from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../components/Config';
import { useNavigate } from "react-router-dom";
import ProfileCompletionOverlay from '../components/ProfileNudge';

export default function OrderPlacement() {
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState('idle');  // idle
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [addressNudge, setAddressNudge] = useState(false);
  const user_id = localStorage.getItem(API_BASE_URL.slice(8, 15));

  const serviceDetails = {
    type: "Standard Residential Collection",
    price: 1,
    frequency: "One-time Pickup",
    location: "My current location"
  };

  useEffect(() => {
    console.log("Current UI State:", orderStatus);
  }, [orderStatus]); // This runs every time orderStatus actually changes

  const formattedTotal = serviceDetails.price.toLocaleString();

const handlePlaceOrder = async () => {
    // Validates 10 digits (09xxxxxxxx)
    if (phoneNumber.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    setOrderStatus('processing');
    setErrorMessage(""); // Clear previous errors
    
    try {
      const res = await axios.post(`${API_BASE_URL}/place_order.php`, {
        user_token: user_id,
        phone_number: phoneNumber,
        service_type: serviceDetails.type,
        amount: serviceDetails.price
      });

      console.log("Place Order Response:", res.data);
      if (res.data.success) {
        setOrderStatus('awaiting_payment'); 
        startPaymentVerification(res.data.transaction_reference, res.data.order_id);
      } else {
        setOrderStatus('idle');
        // Check specifically for address error from backend
        if (res.data.message === "missing_address") {
            setAddressNudge(true);
        }
        setErrorMessage(res.data.message || "Failed to initiate request.");
      }
    } catch (err) {
      setOrderStatus('idle');
      setErrorMessage("Network error. Please try again.");
    }
    // Note: orderStatus will still be 'idle' here in the console, 
    // but the UI will have updated to 'processing' or 'awaiting_payment'
  };

  const startPaymentVerification = (ref, orderId) => {
    let checkCount = 0;
    setOrderStatus('awaiting_payment'); // Optional: show a loader

    const interval = setInterval(async () => {
      checkCount++;
      try {
        const response = await axios.post(`${API_BASE_URL}/check_transaction.php`, { 
            reference_id: ref,     
            order_id: orderId,     
            user_token: user_id    
        });

        console.log("Status Check:", response.data);

        if (response.data.status === 'successful') {
          clearInterval(interval);
          setOrderStatus('success');
          // Optional: redirect after success
          // setTimeout(() => navigate('/orders'), 2000);
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          setOrderStatus('idle');
          setErrorMessage("Payment failed or was declined.");
        }

      } catch (e) { 
        console.error("Verification error:", e); 
      }

      // 40 checks * 3 seconds = 2 minutes timeout
      if (checkCount > 40) {
        clearInterval(interval);
        setErrorMessage("Payment timed out. If you paid, please check your history.");
      }
    }, 3000);
};


  return (
    <div className="dashboard-layout">
      <Sidebar active={"orders"} />

      <main className="order-main-content">
        <header className="order-top-bar">
          <button className="back-link" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className="secure-badge-top">
            <ShieldCheck size={14} color="#00d084" /> Secure Collection Request
          </div>
        </header>


        {addressNudge && (
          <ProfileCompletionOverlay />
        )}


        <div className="order-grid">
          <div className="order-action-section">
            <div className="content-card">
              
              {orderStatus === 'idle' && (
                <div className="fade-in">
                  <div className="section-title">
                    <div className="icon-bg-green"><Smartphone size={24} color="#fff" /></div>
                    <div>
                      <h3>Confirm Payment</h3>
                      <p>Enter your Mobile Money number to pay</p>
                    </div>
                  </div>

                  <div className="input-group">
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Airtel / MTN / Zamtel Number</label>
                    <div className="phone-input-wrapper">
                      <span className="country-code">+26</span>
                      <input 
                        type="tel" 
                        placeholder="09xx xxx xxx" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    {errorMessage && <p style={{color: 'red', fontSize: '12px', marginTop: '8px'}}>{errorMessage}</p>}
                  </div>

                  <div className="notice-card">
                    <Info size={18} />
                    <p>You will receive a popup on your phone. Enter your PIN to authorize <b>K{formattedTotal}</b>.</p>
                  </div>

                  <button onClick={handlePlaceOrder} className="primary-pay-btn">
                    Request Collection <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {orderStatus === 'processing' && (
                <div className="status-center">
                  <Loader2 className="spin" size={48} />
                  <h3>Creating Request...</h3>
                  <p>Talking to the network provider</p>
                </div>
              )}

              {orderStatus === 'awaiting_payment' && (
                <div className="status-center">
                  <div className="phone-pulse">
                    <Smartphone size={40} />
                    <div className="ring"></div>
                  </div>
                  <h3>Check your phone</h3>
                  <p>Request sent to <b>{phoneNumber}</b></p>
                  <div className="waiting-pill">Waiting for PIN entry...</div>
                </div>
              )}

              {orderStatus === 'success' && (
                <div className="status-center success-ui">
                  <div className="check-circle"><CheckCircle2 size={50} /></div>
                  <h3>Collection Scheduled!</h3>
                  <p>A truck has been assigned to your location.</p>
                  <div className="next-steps">
                    <div className="step-row"><Truck size={16}/> <span>Truck arrives in ~25 mins</span></div>
                    <div className="step-row"><MapPin size={16}/> <span>{serviceDetails.location}</span></div>
                  </div>
                  <button className="track-btn" onClick={() => navigate('/track')}>
                    Track Truck on Map
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="order-summary-section">
            <div className="summary-sticky">
              <h3 className="summary-title">Service Details</h3>
              
              <div className="service-card-mini">
                 <div className="trash-icon-container"><Trash2 size={24} color="#00d084" /></div>
                 <div>
                    <h4>{serviceDetails.type}</h4>
                    <span>{serviceDetails.frequency}</span>
                 </div>
              </div>

              <div className="detail-list">
                 <div className="detail-row">
                    <span>Service Fee</span>
                    <span className="price-tag">K{formattedTotal}</span>
                 </div>
                 <div className="detail-row">
                    <span>Tax (VAT)</span>
                    <span>K0.00</span>
                 </div>
                 <div className="total-divider"></div>
                 <div className="detail-row grand-total">
                    <span>Total Amount</span>
                    <span>K{formattedTotal}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .dashboard-layout { display: flex; height: 100vh; background: #f4f7f6; overflow: hidden; }
        .order-main-content { flex: 1; overflow-y: auto; padding: 0 40px 40px; }
        .order-top-bar { display: flex; justify-content: space-between; align-items: center; padding: 30px 0; }
        .back-link { background: none; border: none; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #555; cursor: pointer; }
        .secure-badge-top { font-size: 12px; color: #888; display: flex; align-items: center; gap: 6px; font-weight: 700; }

        .order-grid { display: grid; grid-template-columns: 1fr 400px; gap: 40px; max-width: 1200px; margin: 0 auto; }
        .content-card { background: white; border-radius: 28px; padding: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); min-height: 500px; border: 1px solid #eee; }

        .section-title { display: flex; gap: 20px; align-items: center; margin-bottom: 40px; }
        .icon-bg-green { background: #00d084; padding: 12px; border-radius: 16px; }
        .section-title h3 { font-size: 22px; font-weight: 800; margin: 0; }
        .section-title p { color: #777; margin: 0; }

        .phone-input-wrapper { display: flex; align-items: center; background: #f8fafc; border: 2px solid #edf2f7; border-radius: 18px; height: 64px; margin-top: 10px; transition: 0.3s; }
        .phone-input-wrapper:focus-within { border-color: #00d084; background: #fff; }
        .country-code { padding: 0 20px; font-weight: 800; color: #4a5568; border-right: 1px solid #edf2f7; }
        .phone-input-wrapper input { border: none; background: transparent; width: 100%; padding: 0 20px; font-size: 20px; font-weight: 700; outline: none; }

        .notice-card { background: #fffbeb; border-radius: 16px; padding: 20px; display: flex; gap: 15px; margin: 30px 0; border: 1px solid #fef3c7; }
        .notice-card p { font-size: 14px; color: #92400e; margin: 0; line-height: 1.5; }

        .primary-pay-btn { width: 100%; background: #1a202c; color: white; border: none; height: 64px; border-radius: 20px; font-size: 18px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; transition: 0.3s; }
        .primary-pay-btn:hover { background: #00d084; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,208,132,0.2); }

        /* Summary Panel */
        .summary-sticky { background: #fff; border-radius: 28px; padding: 35px; border: 1px solid #eee; }
        .summary-title { font-size: 18px; font-weight: 800; margin-bottom: 25px; }
        .service-card-mini { display: flex; gap: 15px; align-items: center; background: #f8fafc; padding: 20px; border-radius: 20px; margin-bottom: 25px; }
        .service-card-mini h4 { margin: 0; font-size: 15px; font-weight: 800; }
        .service-card-mini span { font-size: 12px; color: #718096; }

        .detail-list { display: flex; flex-direction: column; gap: 12px; }
        .detail-row { display: flex; justify-content: space-between; font-size: 14px; color: #718096; }
        .price-tag { font-weight: 700; color: #2d3748; }
        .total-divider { height: 1px; background: #edf2f7; margin: 10px 0; }
        .grand-total { font-size: 22px; font-weight: 900; color: #00d084; }

        .location-box { margin-top: 30px; padding-top: 25px; border-top: 1px solid #edf2f7; display: flex; gap: 12px; }
        .loc-label { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #a0aec0; margin: 0; }
        .loc-val { font-size: 13px; font-weight: 600; color: #4a5568; margin: 4px 0 0; }

        /* Success States */
        .status-center { text-align: center; }
        .check-circle { color: #00d084; margin-bottom: 20px; }
        .next-steps { background: #f7fafc; padding: 20px; border-radius: 18px; margin: 25px 0; display: flex; flex-direction: column; gap: 10px; }
        .step-row { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 14px; font-weight: 600; color: #4a5568; }
        .track-btn { width: 100%; background: #00d084; color: white; border: none; height: 56px; border-radius: 16px; font-weight: 700; cursor: pointer; }

        .spin { animation: spin 1s linear infinite; color: #00d084; margin-bottom: 20px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .phone-pulse { position: relative; color: #00d084; margin-bottom: 30px; display: inline-block; }
        .ring { position: absolute; top: -15px; left: -15px; right: -15px; bottom: -15px; border: 3px solid #00d084; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(0.7); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
      `}</style>
      <style jsx>{`
  /* Layout Base */
  .dashboard-layout { 
    display: flex; 
    height: 100vh; 
    background: #f4f7f6; 
    overflow: hidden; 
  }

  .order-main-content { 
    flex: 1; 
    overflow-y: auto; 
    padding: 0 40px 40px; 
    transition: all 0.3s ease;
  }

  .order-top-bar { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    padding: 30px 0; 
  }

  /* Responsive Grid */
  .order-grid { 
    display: grid; 
    grid-template-columns: 1fr 400px; 
    gap: 40px; 
    max-width: 1200px; 
    margin: 0 auto; 
  }

  /* Cards & Forms */
  .content-card { 
    background: white; 
    border-radius: 28px; 
    padding: 50px; 
    box-shadow: 0 10px 30px rgba(0,0,0,0.04); 
    min-height: 500px; 
    border: 1px solid #eee; 
  }

  /* ... (Keep your existing desktop button and input styles here) ... */

  /* --- MOBILE RESPONSIVE QUERIES --- */

  @media (max-width: 1024px) {
    .order-grid {
      grid-template-columns: 1fr; /* Stack columns on tablets */
      gap: 20px;
    }
    
    .order-summary-section {
      order: -1; /* Move summary to the top on mobile so they see what they pay for first */
    }
    
    .summary-sticky {
      position: static; /* Remove sticky on mobile */
    }
  }

  @media (max-width: 768px) {
    .dashboard-layout {
      flex-direction: column; /* Stack sidebar and content */
    }

    .order-main-content {
      padding: 0 20px 100px; /* Extra bottom padding for mobile nav if needed */
    }

    .order-top-bar {
      padding: 20px 0;
    }

    .content-card {
      padding: 30px 20px; /* Reduce padding for smaller screens */
      border-radius: 20px;
      min-height: auto;
    }

    .section-title h3 {
      font-size: 18px;
    }

    .phone-input-wrapper {
      height: 56px;
    }

    .phone-input-wrapper input {
      font-size: 16px;
    }

    .primary-pay-btn {
      height: 56px;
      font-size: 16px;
    }

    /* Make the grand total stick out more on mobile */
    .grand-total {
      font-size: 18px;
    }

    .back-link span {
      display: none; /* Hide "Back to Dashboard" text, keep icon only if space is tight */
    }
  }

  /* Floating Action Button Style for mobile Payment */
  @media (max-width: 480px) {
    .order-header h2 {
      font-size: 20px;
    }
    
    .country-code {
      padding: 0 10px;
    }

    .notice-card {
      padding: 12px;
    }
    
    .notice-card p {
      font-size: 12px;
    }
  }

  /* Animations */
  .fade-in { animation: fadeIn 0.4s ease-in; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .spin { animation: spin 1s linear infinite; color: #00d084; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  .phone-pulse { position: relative; color: #00d084; margin-bottom: 30px; display: inline-block; }
  .ring { position: absolute; top: -15px; left: -15px; right: -15px; bottom: -15px; border: 3px solid #00d084; border-radius: 50%; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0% { transform: scale(0.7); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
`}</style>
    </div>
  );
}