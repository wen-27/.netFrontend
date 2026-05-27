import { Navigate, Outlet } from "react-router-dom";
import { ForbiddenState } from "../shared/components/feedback/ForbiddenState";
import { useAuth } from "../shared/hooks/useAuth";
import { Role } from "../shared/types/common";

type RoleGuardProps = {
  allowedRoles: Role[];
};

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const role = useAuth((state) => state.role);
  if (!role) return <Navigate to="/auth/login" replace />;
  if (!allowedRoles.includes(role)) return <ForbiddenState />;
  return <Outlet />;
}
