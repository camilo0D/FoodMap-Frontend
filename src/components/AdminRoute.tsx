import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getRoles, isAuthenticated } from "@/services/auth";

type Props = {
  children: ReactNode;
};

const AdminRoute = ({ children }: Props) => {
  const loggedIn = isAuthenticated();
  const roles = getRoles();

  if (!loggedIn) {
    return <Navigate to="/" replace />;
  }

  if (!roles.includes("admin")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
