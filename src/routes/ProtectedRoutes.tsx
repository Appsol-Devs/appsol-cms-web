import { allRoutes } from "@/utils/routes";
import { Navigate } from "react-router-dom";

interface IRouteProps {
  isAllowed: boolean;
  redirectPath?: string;
  children: any;
}

const ProtectedRoute = ({
  isAllowed,
  redirectPath = "/portal" + allRoutes.UNAUTHORIZED,
  children,
}: IRouteProps) => {
  if (!isAllowed) return <Navigate to={redirectPath} replace />;
  return children && children;
};

export default ProtectedRoute;
