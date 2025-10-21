import { Navigate, Route, Routes } from "react-router-dom";
import App from "../App";
import { allRoutes } from "@/utils/routes";
import PrivateRoutes from "./PrivateRoutes";

const PublicRoutes = () => {
  const isLoggedIn = true;

  return (
    <Routes>
      <Route>
        {isLoggedIn ? (
          <>
            <Route path="/" element={<App />}>
              <Route path="/*" element={<PrivateRoutes />} />
            </Route>
          </>
        ) : (
          <Route path="*" element={<Navigate to={allRoutes.LOGIN} />} />
        )}
      </Route>
    </Routes>
  );
};

export default PublicRoutes;
