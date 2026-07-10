import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAddProduct from './pages/admin/AdminAddProduct'
import AdminLogin from './pages/admin/AdminLogin'
import CustomerView from './pages/customer/CustomerView'
import WishlistPage from './pages/customer/WishlistPage'
import OrderPage from './pages/customer/OrderPage'
import AdminRoute from './components/AdminRoute'
import AdminOrders from './pages/admin/AdminOrders'
import AdminEditProduct from './pages/admin/AdminEditProduct'
import ProductDetail from './pages/customer/ProductDetail'
import AdminImportExport from './pages/admin/AdminImportExport'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerView />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="/admin/add" element={
          <AdminRoute><AdminAddProduct /></AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminRoute><AdminOrders /></AdminRoute>
        } />
        <Route path="/admin/edit/:id" element={
          <AdminRoute><AdminEditProduct /></AdminRoute>
        } />4
        <Route path="/admin/import" element={
          <AdminRoute><AdminImportExport /></AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App