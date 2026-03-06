import { Routes, Route } from "react-router-dom"
import './App.css';
import ProductScreen from "./pages/home"
import TransactionsScreen from "./pages/transactions";
import CartPage from "./pages/cartPage";
import ProfilePage from "./pages/profile";
import Product from "./pages/product";
import SignUp from "./pages/signup";
import Login from "./pages/login";
import VerifyOTP from "./pages/verifyOTP";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTransactions from "./pages/AdminTransactions";
import AdminOrders from "./pages/AdminOrders";
import AddProduct from "./pages/AddProduct";
import TransactionSuccess from "./pages/TransactionSuccess";
import OrderDetails from "./pages/OrderDetails";
import UserOrders from "./pages/Orders";
import UserOrderDetails from "./pages/UserOrderDetails";
import TransactionDetails from "./pages/TransactionDetails";
import Notifications from "./pages/Notifications";
import OrderPlacement from "./pages/OrderPlacement";
import Track from "./pages/Track";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductScreen />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin-transactions" element={<AdminTransactions />} />
      <Route path="/admin-orders" element={<AdminOrders />} />
      <Route path="/admin-add-products" element={<AddProduct />} />
      <Route path="/order-details/:id" element={<OrderDetails />} />
      <Route path="/user-order-details/:id" element={<UserOrderDetails />} />
      <Route path="/track" element={<Track />} />

      <Route path="/notifications" element={<Notifications />} />
      <Route path="/transactions" element={<TransactionsScreen />} />
      <Route path="/transaction-details" element={<TransactionDetails />} />
      <Route path="/orders" element={<UserOrders />} />
      <Route path="/order-placement" element={<OrderPlacement />} />
      <Route path="/transaction-success" element={<TransactionSuccess />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
    </Routes>
  )
}

export default App
