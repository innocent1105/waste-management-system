import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, Trash2, Plus, Minus, Ticket, 
  CreditCard, ChevronRight, ShoppingCart,UserCheck, ArrowRight, X, Sparkles 
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import TransactionLoading from '../components/TransactionLoading';
import { API_BASE_URL } from '../components/Config';
import TransactionFailed from '../components/TransactionError';
import ProfileNudge from '../components/ProfileNudge';
const FullCart = ({ user_token, cart, setCart, updateQty, removeFromCart, setIsCartFullView, currency }) => {
  const [promoCode, setPromoCode] = useState("");
  const localStorageKey = "ecom-dashboard";
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState("");
  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const tax = 0; 
  const total = subtotal + tax;

  const [loading, setLoading] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [noProfile, setNoProfile] = useState(false);
  const [error, setError] = useState("");
  const [numberError, setNumberError] = useState(false);

  const pollingRef = useRef(false);
  const timeoutRef = useRef(null);
  const checkTransaction = async (transaction_reference, order_id) => {
    try {
      console.log("checking...")
      const res_ = await axios.post(`${API_BASE_URL}/check_transaction.php`, {
        user_token: user_token,
        phone_number: accountNumber,
        reference_id: transaction_reference,
        order_id: order_id
      });

      console.log(res_.data)
      return res_.data;
    } catch (error) {
      console.error("Transaction check failed:", error);
      return null;
    }
  };

  const startPolling = (transaction_reference, order_id) => {
  if (pollingRef.current) return;

  pollingRef.current = true;

  const poll = async () => {
    if (!pollingRef.current) return;

    const result = await checkTransaction(transaction_reference, order_id);

    if (result && result.status === "successful") {
      pollingRef.current = false;
      clearTimeout(timeoutRef.current);
      console.log("Payment confirmed");
      localStorage.setItem(localStorageKey, JSON.stringify([]));
      navigate("/transaction-success");
      return;
    }

    if (result && result.status === "failed"){
      setError("failed");
      setLoading(false);
    }

    timeoutRef.current = setTimeout(poll, 3000);
  };

  poll();
};

  const stopPolling = () => {
    pollingRef.current = false;
    clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);


  const placeOrder = async () => {
    if(cart.length == 0) return;

    if(accountNumber.length != 10){
      setNumberError(true);
      return;
    }

    setError("");
    setNumberError(false);
    setLoading(true);
    setNoProfile(false);
    try {
      const res = await axios.post(`${API_BASE_URL}/place_order.php`, {
        user_token : user_token,
        phone_number : accountNumber
      });

      console.log(res.data);
      const response = res.data;
      if(response.message == 32){
        setNoProfile(true);
      }
      if(response.success){
        startPolling(response.transaction_reference, response.order_id);
      }else{
        setError(response.message);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Database fetch error:", err);
      setLoading(false);
      setError(err);
    } finally {
      return;
    }
  }






  if(cart && cart !== undefined){
    if (cart.length === 0 && !loading) {
      return (
        <div className="full-cart-view empty">
          <div className="empty-state">
            <div className="empty-icon"><ShoppingCart size={48} /></div>
            <h2>Your basket is empty</h2>
            <p>Add some fresh drops to get started.</p>
            <div className="back-btn" onClick={() => setIsCartFullView(false)}>
              Back to Shop
            </div>
          </div>
        </div>
      );
    }
  }else{
    console.log("cart error");
  }

  return (
    <div className="full-cart-view">
      <header className="cart-nav">
        <button onClick={() => setIsCartFullView(false)} className="back-circle">
          <ArrowLeft size={20} />
        </button>
        <h1>Checkout Details</h1>
        <div className="item-count-badge">{cart && cart !== undefined ? cart.length : 0} Types of Items</div>
      </header>

      {noProfile && (
        <ProfileNudge user={""} />
      )}  




      {error.length > 1 && (
        <TransactionFailed onRetry={()=>{
          setError("");
          stopPolling(); 
        }}/>
      )}

      {loading ? (
        <div>
          <TransactionLoading phoneNumber={accountNumber} amount={total} />
        </div>
      ) : (
        <div>
       
        
      <div className="cart-content-layout">
        <div className="cart-items-section">
          {cart.map(item => (
            <div className="cart-row" key={item.id}>
              <div className="row-img" onClick={()=>{
                navigate(`/product/${item.id}`);
              }}>
                <img src={`${API_BASE_URL}/uploads/products/${item.img}`} alt={item.name} />
              </div>
              <div className="row-info" onClick={()=>{
                navigate(`/product/${item.id}`);
              }}>
                <h3>{item.name}</h3>
                <span className="row-cat">{item.cat}</span>
              </div>
              <div className="row-controls">
                <div className="qty-pill">
                  <button onClick={() => updateQty(item.id, -1)}><Minus size={16}/></button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)}><Plus size={16}/></button>
                </div>
              </div>
              <div className="row-price">
                {currency}{(item.price * item.qty).toLocaleString()}
              </div>
              <button className="row-remove" onClick={() => removeFromCart(item.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <aside className="order-summary-card">
          <div className="summary-header">
            <h3>Order Summary</h3>
          </div>
          
          <div className="summary-details">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{currency}{subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-line">
              <span>Delivery fee</span>
              <span>{currency}{tax.toLocaleString()}</span>
            </div>
            
            {/* <div className="promo-box">
              <Ticket size={18} className="promo-icon" />
              <input 
                type="text" 
                placeholder="Promo Code" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button>Apply</button>
            </div> */}

            <hr className="summary-divider" />
            
            <div className="summary-line total">
              <span>Grand Total</span>
              <span className="total-amount">{currency}{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="payment-methods">
            <p>Payment Method</p>
            <div className="method-pill">
              <CreditCard size={18} />
              <span>Mobile Money</span>
            </div>
          </div>

          <br></br>
          {numberError && (
            <div className='numberError'>
              Invalid account number. Please try another one.
            </div>
          )}
          <div className="payment-methods">
            <p>Account Number</p>
              <input 
                value={accountNumber} 
                onChange={(e)=>{setAccountNumber(e.target.value)}} 
                type='number' 
                className="account-number"
                placeholder='e.g 0960XXXXXX'
              />
          </div>

            
          <button onClick={()=>{
            placeOrder();
          }} className="confirm-order-btn">
            Confirm and Pay {currency}{total.toLocaleString()}
          </button>
        </aside>
      </div>
        </div>
      )}
    </div>
  );
};

export default FullCart;