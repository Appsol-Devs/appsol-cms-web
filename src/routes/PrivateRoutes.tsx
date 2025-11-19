import Dashboard from "@/pages/dashboard/component/Dashboard";
import { allRoutes } from "@/utils/routes";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import SettingsRoutes from "./SettingsRoutes";
import Roles from "@/pages/roles/component/Roles";
import Customers from "@/pages/customer/component/Customers";
import CustomersView from "@/pages/customer/component/CustomersView";
import Softwares from "@/pages/settings/components/softwares/Softwares";
import ComplaintTypes from "@/pages/settings/components/complaint-types/ComplaintTypes";
import ComplaintCategories from "@/pages/settings/components/complaint-category/ComplaintCategories";
import SetupStatuses from "@/pages/settings/components/setup-status/SetupStatuses";
import LeadStatuses from "@/pages/settings/components/lead-status/LeadStatuses";
import LeadNextSteps from "@/pages/settings/components/lead-next-step/LeadNextSteps";
import CallStatuses from "@/pages/settings/components/call-status/CallStatuses";
import SubscriptionTypes from "@/pages/settings/components/subscription-types/SubscriptionTypes";
import Users from "@/pages/users/component/Users";
import UsersView from "@/pages/users/component/UsersView";
import UsersForm from "@/pages/users/component/UsersForm";

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route path={allRoutes.DASHBOARD} element={<Dashboard />} />
      <Route path={allRoutes.CUSTOMERS} element={<Customers />} />
      <Route
        path={allRoutes.VIEW_CUSTOMER(":id")}
        element={<CustomersView />}
      />
      <Route path={allRoutes.SOFTWARES} element={<Softwares />} />
      <Route path={allRoutes.COMPLAINT_TYPES} element={<ComplaintTypes />} />
      <Route
        path={allRoutes.COMPLAINT_CATEGORIES}
        element={<ComplaintCategories />}
      />
      <Route path={allRoutes.SETUP_STATUSES} element={<SetupStatuses />} />
      <Route path={allRoutes.CALL_STATUSES} element={<CallStatuses />} />
      <Route
        path={allRoutes.SUBSCRIPTION_TYPES}
        element={<SubscriptionTypes />}
      />
      <Route path={allRoutes.LEAD_STATUSES} element={<LeadStatuses />} />
      <Route path={allRoutes.LEAD_NEXT_STEPS} element={<LeadNextSteps />} />
      <Route path={allRoutes.ROLES} element={<Roles />} />
      <Route path={allRoutes.USERS} element={<Users />} />
      <Route path={allRoutes.ADD_USER} element={<UsersForm />} />
      <Route path={allRoutes.UPDATE_USER(":id")} element={<UsersForm />} />
      <Route path={allRoutes.VIEW_USER(":id")} element={<UsersView />} />

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
