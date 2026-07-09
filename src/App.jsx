import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAddProduct from './pages/admin/AdminAddProduct'
import CustomerView from './pages/customer/CustomerView'
import WishlistPage from './pages/customer/WishlistPage'
import OrderPage from './pages/customer/OrderPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerView />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/add" element={<AdminAddProduct />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App