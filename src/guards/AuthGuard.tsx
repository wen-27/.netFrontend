import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";

export function AuthGuard() {
  const location = useLocation();
  const token = useAuth((state) => state.token);

  if (!token) return <Navigate to="/auth/login" replace state={{ from: location }} />;
  return <Outlet />;
}
