import Dashboard from "@/pages/dashboard/component/Dashboard";
import { allRoutes } from "@/utils/routes";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import SettingsRoutes from "./SettingsRoutes";

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route path={allRoutes.DASHBOARD} element={<Dashboard />} />

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
