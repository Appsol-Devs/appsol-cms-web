import PageNotFound from "@/pages/auth/error/PageNotFound";
import CustomersView from "@/pages/customer/component/core/CustomersView";
import CustomerDashboard from "@/pages/customer/component/customer-dashboard/CustomerDashboard";
import CustomerOutreach from "@/pages/customer/component/customer-outreach/CustomerOutreach";
import CustomerPayments from "@/pages/customer/component/customer-payment/CustomerPayments";
import CustomerSummary from "@/pages/customer/component/customer-summary/CustomerSummary";
import CustomerTickets from "@/pages/customer/component/customer-tickets/CustomerTickets";
import { allRoutes, customerRoutes } from "@/utils/routes";
import type { JSX } from "react";
import { Route, Routes } from "react-router-dom";

interface ICustomerRoute {
  element: JSX.Element;
  path: string;
  //   authorize?: IPermission;
}

const CustomerRoutes = () => {
  const ALL_CUSTOMER_ROUTES: ICustomerRoute[] = [
    { element: <CustomerSummary />, path: customerRoutes.OVERVIEW },
    { element: <CustomerOutreach />, path: customerRoutes.OUTREACHS },
    { element: <CustomerPayments />, path: customerRoutes.PAYMENTS },
    { element: <CustomerTickets />, path: customerRoutes.TICKETS },
    { element: <CustomerDashboard />, path: customerRoutes.DASHBOARD },
    { element: <PageNotFound />, path: allRoutes.NOT_FOUND },
    { element: <PageNotFound />, path: "*" },
  ];

  return (
    <>
      <Routes>
        <Route path="/" element={<CustomersView />}>
          {ALL_CUSTOMER_ROUTES.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
    </>
  );
};

export default CustomerRoutes;
