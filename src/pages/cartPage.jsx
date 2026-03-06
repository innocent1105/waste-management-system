import React from 'react';
import { 
  ArrowLeft, Trash2, Minus, Plus, CreditCard, 
  ShieldCheck, Truck, ChevronRight, Ticket 
} from 'lucide-react';
import '../CartPage.css';

export default function CartPage({ cart, updateQty, removeFromCart, onBack, currency = "K" }) {
  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const tax = subtotal * 0.15; // 15% Tax
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + tax + shipping;

  return (
    <div className="cart-page-wrapper">
      {/* 1. Header & Progress */}
      <header className="cart-page-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} /> <span>Back to Store</span>
        </button>
        <div className="checkout-steps">
          <span className="step active">01 Bag</span>
          <div className="step-line"></div>
          <span className="step">02 Shipping</span>
          <div className="step-line"></div>
          <span className="step">03 Payment</span>
        </div>
      </header>

      <div className="cart-main-content">
        {/* 2. Left Side: Items List */}
        <section className="cart-items-column">
          <div className="column-head">
            <h1>Shopping Bag</h1>
            <p>{cart.length} unique items in your cart</p>
          </div>

          <div className="items-container">
            {cart.length > 0 ? (
              cart.map(item => (
                <div key={item.id} className="cart-item-row">
                  <div className="item-img-box">
                    <img src={item.img} alt={item.name} />
                  </div>
                  
                  <div className="item-info-box">
                    <div className="info-main">
                      <h3>{item.name}</h3>
                      <p>{item.cat}</p>
                    </div>
                    <div className="item-controls">
                      <div className="qty-picker">
                        <button onClick={() => updateQty(item.id, -1)}><Minus size={14}/></button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}><Plus size={14}/></button>
                      </div>
                      <button className="remove-icon-btn" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="item-price-box">
                    <h4>{currency}{(item.price * item.qty).toLocaleString()}</h4>
                    <p>{currency}{item.price} each</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-cart-state">
                <h2>Your bag is empty</h2>
                <button onClick={onBack}>Start Shopping</button>
              </div>
            )}
          </div>

          <div className="cart-guarantees">
            <div className="g-item"><ShieldCheck size={20}/> <span>2 Year Warranty</span></div>
            <div className="g-item"><Truck size={20}/> <span>Free Express Shipping</span></div>
          </div>
        </section>

        {/* 3. Right Side: Order Summary */}
        <aside className="cart-summary-column">
          <div className="summary-card">
            <h3>Order Summary</h3>
            
            <div className="promo-input-box">
              <Ticket size={18} />
              <input type="text" placeholder="Promo code" />
              <button>Apply</button>
            </div>

            <div className="summary-details">
              <div className="s-row">
                <span>Subtotal</span>
                <span>{currency}{subtotal.toLocaleString()}</span>
              </div>
              <div className="s-row">
                <span>Estimated Tax (15%)</span>
                <span>{currency}{tax.toLocaleString()}</span>
              </div>
              <div className="s-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : currency + shipping}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="s-row total">
                <span>Total</span>
                <span className="total-amount">{currency}{total.toLocaleString()}</span>
              </div>
            </div>

            <button className="checkout-btn">
              <span>Checkout Now</span>
              <ChevronRight size={20} />
            </button>

            <div className="payment-methods-icons">
              <p>Secure payments with</p>
              <div className="icons-row">
                <CreditCard size={24} />
                <div className="payment-logo">VISA</div>
                <div className="payment-logo">PAYPAL</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}