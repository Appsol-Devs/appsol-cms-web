import { Navigate, Route, Routes } from "react-router-dom";
import { allRoutes } from "@/utils/routes";
import type { JSX } from "react";
import Softwares from "@/pages/settings/components/softwares/Softwares";
import Settings from "@/pages/settings/components/core/Settings";
import ProtectedRoute from "./ProtectedRoutes";
import Unauthorized from "@/pages/auth/error/Unauthorized";

interface ISettingsRoutes {
  element: JSX.Element;
  path: string;
  authorize?: string[];
}

const SettingsRoutes = () => {
  const ALL_SETTINGS_ROUTES: ISettingsRoutes[] = [
    { element: <Softwares />, path: allRoutes.SOFTWARES },
  ];

  return (
    <Routes>
      <Route path="/" element={<Settings />}>
        {ALL_SETTINGS_ROUTES.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.authorize ? (
                <ProtectedRoute
                  redirectPath={
                    allRoutes.PORTAL +
                    allRoutes.SETTINGS +
                    allRoutes.UNAUTHORIZED
                  }
                  isAllowed={true}
                  // isAllowed={useHasPermission(route.authorize)}
                >
                  {route.element}
                </ProtectedRoute>
              ) : (
                route.element
              )
            }
          />
        ))}
        <Route path={allRoutes.UNAUTHORIZED} element={<Unauthorized />} />
        <Route path="*" element={<Navigate to={allRoutes.UNAUTHORIZED} />} />
      </Route>
    </Routes>
  );
};

export default SettingsRoutes;
