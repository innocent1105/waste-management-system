import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingBag, Heart, Star, 
  ShieldCheck, Truck, ChevronRight, Minus, Plus 
} from 'lucide-react';
import '../ProductScreen.css';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import { API_BASE_URL } from '../components/Config';

export default function ProductScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currency = "K";
  const localStorageKey = "ecom-dashboard";
  
  const [user_id, setUserId] = useState(null);
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [inCart, setInCart] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem(API_BASE_URL.slice(8, 15));
    if(!token) {
      console.warn("No user found");
      navigate("/login"); 
    } else {
      setUserId(token);
    }

    const localCart = JSON.parse(localStorage.getItem(localStorageKey));
    if (localCart) setCart(localCart);
  }, []);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/view_product.php?id=${id}&user_id=${user_id}`);
        setProduct(res.data);
        setActiveImg(res.data.gallery?.[0] || res.data.img);
        console.log(res.data.in_cart);
        console.log(res.data)
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);




  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(cart));
  }, [cart]);

  const handleQtyChange = (delta) => {
    setQty(prev => Math.max(1, prev + delta));
  };

  const addToCart = async () => {
    if (!product) return;
    setInCart(true);
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...product, qty: qty }];
    });

    // B. Sync to Database
    try {
      if (!user_id) {
        console.warn("User not logged in. Saved to local only.");
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/add_to_cart.php`, {
        user_id: user_id,
        product_id: product.id,
        quantity: qty, 
      });

      if (response.data.success) {
        console.log("Cart synced with database");
        setQty(1); 
      }
    } catch (cartError) {
      console.error("Failed to sync cart to DB:", cartError.message);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/", { replace: true });
  };

  return (
    <div className="product-page">
      <nav className="p-header">
        <button onClick={handleBack} className="p-icon-btn">
          <ArrowLeft size={22} />
        </button>
        <div className="p-header-actions">
          
        </div>
      </nav>

      {loading ? (
        <div className="p-layout">
          <div className='loading-modal'>
             <div className="loader"></div>
          </div>
        </div>
      ) : (
        <div className="p-layout">
          <section className="p-gallery">
            <div className="p-main-view">
              <img src={`${API_BASE_URL}/uploads/products/${activeImg}`} alt={product.name} className="fade-in" key={activeImg} />
            </div>

            <div className="p-thumbs">
              <div className='images-flow'>
                {product.gallery?.map((img, i) => (
                  <div
                    key={i}
                    className={`p-thumb ${activeImg === img ? 'active' : ''}`}
                    onClick={() => setActiveImg(img)}
                  >
                    <img src={`${API_BASE_URL}/uploads/products/${img}`} alt={`thumb-${i}`} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="p-info">
            <div className="p-sticky-content">
              <div className="p-meta">
                <span className="p-tag">{product.cat || 'New Arrival'}</span>
                <div className="p-rating"><Star size={14} fill="currentColor" /> 4.9</div>
              </div>

              <h1 className="p-title">{product.name}</h1>
              <p className="p-price">{currency}{Number(product.price).toLocaleString()}</p>

              <div className="p-description">
                <p>{product.description || "Excellence in every detail."}</p>
              </div>

              {!inCart && (
                <div className="p-actions-grid">
                  <button className="p-buy-btn" onClick={addToCart}>
                    Add to Cart <ChevronRight size={18} />
                  </button>
                </div>
              )}
              

              <div className="p-trust-badges">
                <div className="p-badge"><Truck size={18} /> <span>Free Delivery</span></div>
                <div className="p-badge"><ShieldCheck size={18} /> <span>Authentic</span></div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}