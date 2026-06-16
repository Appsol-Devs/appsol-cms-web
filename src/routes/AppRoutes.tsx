import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { allRoutes } from "@/utils/routes";
import PublicRoutes from "./PublicRoutes";
import Login from "@/pages/auth/login/Login";
import ForgotPassword from "@/pages/auth/login/ForgotPassword";
import ResetPassword from "@/pages/auth/login/ResetPassword";

const AppRoutes = () => {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path={allRoutes.LOGIN} element={<Login />} />
          <Route path={allRoutes.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={allRoutes.RESET_PASSWORD} element={<ResetPassword />} />
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
