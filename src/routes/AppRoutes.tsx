import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { allRoutes } from "@/utils/routes";
import PublicRoutes from "./PublicRoutes";
import Login from "@/pages/auth/login/Login";

const AppRoutes = () => {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path={allRoutes.LOGIN} element={<Login />}></Route>
          <Route
            path={`${allRoutes.PORTAL}/*`}
            element={<PublicRoutes />}
          ></Route>
          <Route path="*" element={<Navigate to={allRoutes.LOGIN} />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppRoutes;
