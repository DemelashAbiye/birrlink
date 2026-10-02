import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Public
import Login from './pages/Login';
import Register from './pages/Register';
import PublicVerify from './pages/PublicVerify';
import OperatorTrust from './pages/OperatorTrust';
import DigitalReceipt from './pages/DigitalReceipt';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Shared
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// Supplier
import NewInvoice from './pages/NewInvoice';
import MyRetailers from './pages/MyRetailers';

// Retailer
import MyScore from './pages/MyScore';

// Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminFinanceRequests from './pages/AdminFinanceRequests';
import AdminOverdue from './pages/AdminOverdue';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Pages — Open to all visitors with zero login prompts */}
      <Route path="/"             element={<Layout><Dashboard /></Layout>} />
      <Route path="/dashboard"    element={<Layout><Dashboard /></Layout>} />
      <Route path="/about"        element={<Layout><AboutPage /></Layout>} />
      <Route path="/contact"      element={<Layout><ContactPage /></Layout>} />
      <Route path="/verify"       element={<PublicVerify />} />
      <Route path="/verify/:id"   element={<PublicVerify />} />
      <Route path="/receipt"      element={<DigitalReceipt />} />
      <Route path="/receipt/:id"  element={<DigitalReceipt />} />
      <Route path="/trust"        element={<OperatorTrust />} />

      {/* Auth Pages (for Demelash / Admin Operator) */}
      <Route path="/login"        element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register"     element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* B2B / Invoices (Protected) */}
      <Route path="/invoices"         element={<ProtectedRoute roles={['supplier','retailer','admin']}><Invoices /></ProtectedRoute>} />
      <Route path="/invoices/new"     element={<ProtectedRoute roles={['supplier']}><NewInvoice /></ProtectedRoute>} />
      <Route path="/invoices/:id"     element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
      <Route path="/retailers"        element={<ProtectedRoute roles={['supplier']}><MyRetailers /></ProtectedRoute>} />
      <Route path="/score"            element={<ProtectedRoute roles={['retailer']}><MyScore /></ProtectedRoute>} />
      <Route path="/notifications"    element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile"          element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin"            element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users"      element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/requests"   element={<ProtectedRoute roles={['admin']}><AdminFinanceRequests /></ProtectedRoute>} />
      <Route path="/admin/overdue"    element={<ProtectedRoute roles={['admin']}><AdminOverdue /></ProtectedRoute>} />
      <Route path="/admin/invoices/:id" element={<ProtectedRoute roles={['admin']}><InvoiceDetail /></ProtectedRoute>} />

      {/* Catch-all redirect to public homepage */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
