import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ role, children }) {
  const { user, role: currentRole, booting } = useAuth();

  if (booting) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && currentRole !== role) return <Navigate to={`/${currentRole}`} replace />;

  return children;
}
