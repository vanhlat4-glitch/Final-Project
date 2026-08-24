import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { ROLES } from "./constants/roles";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import AdminDashboard from "./pages/admin/Dashboard";
import ProviderManagement from "./pages/admin/ProviderManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import VehicleManagement from "./pages/admin/VehicleManagement";
import VehicleApproval from "./pages/admin/VehicleApproval";
import OrderManagement from "./pages/admin/OrderManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";
import AdminPromotionManagement from "./pages/admin/PromotionManagement";
import ReviewManagement from "./pages/admin/ReviewManagement";
import NotificationManagement from "./pages/admin/NotificationManagement";
import SupportManagement from "./pages/admin/SupportManagement";
import FinancialManagement from "./pages/admin/FinancialManagement";
import Report from "./pages/admin/Report";
import AccessControl from "./pages/admin/AccessControl";

import ProviderDashboard from "./pages/provider/Dashboard";
import PostCar from "./pages/provider/PostCar";
import CarList from "./pages/provider/CarList";
import ProviderOrders from "./pages/provider/ProviderOrders";
import ProviderPayments from "./pages/provider/ProviderPayments";
import ProviderPromotions from "./pages/provider/ProviderPromotions";
import ProviderReviews from "./pages/provider/ProviderReviews";
import ProviderSupport from "./pages/provider/ProviderSupport";
import ProviderReport from "./pages/provider/ProviderReport";
import ProviderFinance from "./pages/provider/ProviderFinance";

import Home from "./pages/customer/Home";
import SearchVehicle from "./pages/customer/SearchVehicle";
import VehicleDetail from "./pages/customer/VehicleDetail";
import Booking from "./pages/customer/Booking";
import Payment from "./pages/customer/Payment";
import OrderHistory from "./pages/customer/OrderHistory";
import OrderDetail from "./pages/customer/OrderDetail";
import Review from "./pages/customer/Review";
import CustomerPromotions from "./pages/customer/Promotion";
import CustomerSupport from "./pages/customer/Support";
import VehicleTracking from "./pages/customer/VehicleTracking";
import Profile from "./pages/customer/Profile";

function RootRedirect() {
  const { user, role, booting } = useAuth();
  if (booting) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${role}`} replace />;
}

function Guard({ role, children }) {
  return <ProtectedRoute role={role}>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin" element={<Guard role={ROLES.ADMIN}><AdminDashboard /></Guard>} />
          <Route path="/admin/providers" element={<Guard role={ROLES.ADMIN}><ProviderManagement /></Guard>} />
          <Route path="/admin/customers" element={<Guard role={ROLES.ADMIN}><CustomerManagement /></Guard>} />
          <Route path="/admin/vehicles" element={<Guard role={ROLES.ADMIN}><VehicleManagement /></Guard>} />
          <Route path="/admin/vehicles/approval" element={<Guard role={ROLES.ADMIN}><VehicleApproval /></Guard>} />
          <Route path="/admin/orders" element={<Guard role={ROLES.ADMIN}><OrderManagement /></Guard>} />
          <Route path="/admin/payments" element={<Guard role={ROLES.ADMIN}><PaymentManagement /></Guard>} />
          <Route path="/admin/promotions" element={<Guard role={ROLES.ADMIN}><AdminPromotionManagement /></Guard>} />
          <Route path="/admin/reviews" element={<Guard role={ROLES.ADMIN}><ReviewManagement /></Guard>} />
          <Route path="/admin/notifications" element={<Guard role={ROLES.ADMIN}><NotificationManagement /></Guard>} />
          <Route path="/admin/support" element={<Guard role={ROLES.ADMIN}><SupportManagement /></Guard>} />
          <Route path="/admin/finance" element={<Guard role={ROLES.ADMIN}><FinancialManagement /></Guard>} />
          <Route path="/admin/reports" element={<Guard role={ROLES.ADMIN}><Report /></Guard>} />
          <Route path="/admin/access-control" element={<Guard role={ROLES.ADMIN}><AccessControl /></Guard>} />

          {/* Provider */}
          <Route path="/provider" element={<Guard role={ROLES.PROVIDER}><ProviderDashboard /></Guard>} />
          <Route path="/provider/post-car" element={<Guard role={ROLES.PROVIDER}><PostCar /></Guard>} />
          <Route path="/provider/cars" element={<Guard role={ROLES.PROVIDER}><CarList /></Guard>} />
          <Route path="/provider/orders" element={<Guard role={ROLES.PROVIDER}><ProviderOrders /></Guard>} />
          <Route path="/provider/payments" element={<Guard role={ROLES.PROVIDER}><ProviderPayments /></Guard>} />
          <Route path="/provider/promotions" element={<Guard role={ROLES.PROVIDER}><ProviderPromotions /></Guard>} />
          <Route path="/provider/reviews" element={<Guard role={ROLES.PROVIDER}><ProviderReviews /></Guard>} />
          <Route path="/provider/support" element={<Guard role={ROLES.PROVIDER}><ProviderSupport /></Guard>} />
          <Route path="/provider/reports" element={<Guard role={ROLES.PROVIDER}><ProviderReport /></Guard>} />
          <Route path="/provider/finance" element={<Guard role={ROLES.PROVIDER}><ProviderFinance /></Guard>} />

          {/* Customer */}
          <Route path="/customer" element={<Guard role={ROLES.CUSTOMER}><Home /></Guard>} />
          <Route path="/customer/search" element={<Guard role={ROLES.CUSTOMER}><SearchVehicle /></Guard>} />
          <Route path="/customer/vehicles/:id" element={<Guard role={ROLES.CUSTOMER}><VehicleDetail /></Guard>} />
          <Route path="/customer/booking/:id" element={<Guard role={ROLES.CUSTOMER}><Booking /></Guard>} />
          <Route path="/customer/payment" element={<Guard role={ROLES.CUSTOMER}><Payment /></Guard>} />
          <Route path="/customer/orders" element={<Guard role={ROLES.CUSTOMER}><OrderHistory /></Guard>} />
          <Route path="/customer/orders/:id" element={<Guard role={ROLES.CUSTOMER}><OrderDetail /></Guard>} />
          <Route path="/customer/tracking/:id" element={<Guard role={ROLES.CUSTOMER}><VehicleTracking /></Guard>} />
          <Route path="/customer/reviews" element={<Guard role={ROLES.CUSTOMER}><Review /></Guard>} />
          <Route path="/customer/promotions" element={<Guard role={ROLES.CUSTOMER}><CustomerPromotions /></Guard>} />
          <Route path="/customer/support" element={<Guard role={ROLES.CUSTOMER}><CustomerSupport /></Guard>} />
          <Route path="/customer/profile" element={<Guard role={ROLES.CUSTOMER}><Profile /></Guard>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
