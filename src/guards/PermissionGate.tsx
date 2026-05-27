import { useAuth } from "../shared/hooks/useAuth";
import { Role } from "../shared/types/common";

type PermissionGateProps = {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGate({ allowedRoles, children, fallback = null }: PermissionGateProps) {
  const role = useAuth((state) => state.role);
  if (!role || !allowedRoles.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
