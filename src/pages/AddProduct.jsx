import React, { useState, useEffect } from 'react';
import { Package, Upload, X, ArrowLeft, Save, DollarSign, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../components/Config';
import Sidebar from '../components/Sidebar';
import '../AddProduct.css';

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', category_id: '', price: '', stock: '', description: '', in_stock: 'In Stock'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem(`${API_BASE_URL.slice(8, 15)}-role`);
    if (role !== "ADMIN") navigate("/login");
  }, []);
  


  const handleFileChange = (e) => {
    setSelectedFiles([...selectedFiles, ...e.target.files]);
  };
 
  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category_id', formData.category_id);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('description', formData.description);
    data.append('in_stock', formData.in_stock);

    for (let i = 0; i < selectedFiles.length; i++) {
      data.append('product_images[]', selectedFiles[i]);
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/add_product.php`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert("Product added successfully!");
        navigate(-1);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pos-wrapper">
      <Sidebar active="dashboard" />
      
      <main className="main-hub">
        <header className="hub-header">
           <button onClick={() => navigate(-1)} className="back-circle"><ArrowLeft size={20}/></button>
           <h2 style={{fontSize: '18px'}}>New Product</h2>
           <div className="header-meta"></div>
        </header>

        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="form-grid">
            {/* Left Side: Info */}
            <div className="form-card">
              <div className="input-group">
                <label>Product Name</label>
                <input type="text" placeholder="e.g. Aero Wireless" required 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="flex-row-gap">
                <div className="input-group">
                  <label>Product category </label>
                  <input type="text" placeholder="e.g Clothing" required 
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Price ({'K'})</label>
                  <input type="number" step="0.01" placeholder="0.00" required 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>

              <div className="flex-row-gap">
                <div className="input-group">
                  <label>Stock Quantity</label>
                  <input type="number" placeholder="0" required 
                    onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Status</label>
                  <select onChange={(e) => setFormData({...formData, in_stock: e.target.value})}>
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea rows="4" placeholder="Product details..." 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
            </div>

            <div className="form-card">
              <label>Product Images</label>
              <div className="upload-zone">
                <input type="file" multiple id="file-upload" hidden onChange={handleFileChange} />
                <label htmlFor="file-upload" className="upload-label">
                  <Upload size={32} />
                  <span>Click to upload multiple images</span>
                </label>
              </div>

              <div className="preview-list">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="preview-thumb">
                    <img src={URL.createObjectURL(file)} alt="preview" />
                    <button type="button" onClick={() => removeFile(idx)}><X size={14}/></button>
                  </div>
                ))}
              </div>

              <button type="submit" className="upload-product-btn" disabled={loading}>
                {loading ? "Processing..." : "Upload"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}