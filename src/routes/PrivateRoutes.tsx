import Dashboard from "@/pages/dashboard/component/Dashboard";
import { allRoutes } from "@/utils/routes";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import SettingsRoutes from "./SettingsRoutes";
import Customers from "@/pages/customer/component/Customers";
import Roles from "@/pages/roles/component/Roles";

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route path={allRoutes.DASHBOARD} element={<Dashboard />} />
      <Route path={allRoutes.CUSTOMERS} element={<Customers />} />
      <Route path={allRoutes.ROLES} element={<Roles />} />

      <Route
        path={`${allRoutes.SETTINGS}/*`}
        element={
          <ProtectedRoute
            isAllowed={
              // useHasPermission("CanViewSettings")
              true
            }
          >
            <SettingsRoutes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default PrivateRoutes;
