import Dashboard from "@/pages/dashboard/component/Dashboard";
import { allRoutes } from "@/utils/routes";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import SettingsRoutes from "./SettingsRoutes";
import Roles from "@/pages/roles/component/Roles";
import Softwares from "@/pages/settings/components/softwares/Softwares";
import ComplaintTypes from "@/pages/settings/components/complaint-types/ComplaintTypes";
import ComplaintCategories from "@/pages/settings/components/complaint-category/ComplaintCategories";
import SetupStatuses from "@/pages/settings/components/setup-status/SetupStatuses";
import LeadStatuses from "@/pages/settings/components/lead-status/LeadStatuses";
import LeadStatusesForm from "@/pages/settings/components/lead-status/LeadStatusesForm";
import LeadNextSteps from "@/pages/settings/components/lead-next-step/LeadNextSteps";
import CallStatuses from "@/pages/settings/components/call-status/CallStatuses";
import SubscriptionTypes from "@/pages/settings/components/subscription-types/SubscriptionTypes";
import Users from "@/pages/users/component/Users";
import UsersView from "@/pages/users/component/UsersView";
import UsersForm from "@/pages/users/component/UsersForm";
import SoftwaresForm from "@/pages/settings/components/softwares/SoftwaresForm";
import ComplaintTypesForm from "@/pages/settings/components/complaint-types/ComplaintTypesForm";
import ComplaintCategoriesForm from "@/pages/settings/components/complaint-category/ComplaintCategoriesForm";
import SubscriptionTypesForm from "@/pages/settings/components/subscription-types/SubscriptionTypesForm";
import Complaints from "@/pages/complaint/component/Complaints";
import ComplaintsForm from "@/pages/complaint/component/ComplaintsForm";
import ComplaintsView from "@/pages/complaint/component/ComplaintsView";
import Tickets from "@/pages/ticket/component/Tickets";
import TicketForm from "@/pages/ticket/component/TicketForm";
import TicketView from "@/pages/ticket/component/TicketView";
import Leads from "@/pages/leads/component/Leads";
import LeadsForm from "@/pages/leads/component/LeadsForm";
import LeadsView from "@/pages/leads/component/LeadsView";
import CallStatusesForm from "@/pages/settings/components/call-status/CallStatusesForm";
import SetupStatusesForm from "@/pages/settings/components/setup-status/SetupStatusesForm";
import LeadNextStepsForm from "@/pages/settings/components/lead-next-step/LeadNextStepsForm";
import CustomerRoutes from "./CustomerRoutes";
import Customers from "@/pages/customer/component/core/Customers";
import CustomersForm from "@/pages/customer/component/core/CustomersForm";
import RolesForm from "@/pages/roles/component/RolesForm";
import RolesView from "@/pages/roles/component/RolesView";
import OutReach from "@/pages/outreach/component/OutReach";
import OutReachForm from "@/pages/outreach/component/OutReacForm";
import ViewOutReach from "@/pages/outreach/component/ViewOutReach";
import CustomerOutReaches from "@/pages/customer-outreaches/component/CustomerOutReaches";
import CustomerOutReachView from "@/pages/customer-outreaches/component/CustomerOutReachView";
import CustomerOutreachForm from "@/pages/customer-outreaches/component/CustomerOutReachForm";
import Subscriptions from "@/pages/subscriptions/component/Subscriptions";
import SubscriptionsForm from "@/pages/subscriptions/component/SubscriptionsForm";
import SubscriptionsView from "@/pages/subscriptions/component/SubscriptionsView";
import PaymentForm from "@/pages/payments/component/PaymentForm";
import Payments from "@/pages/payments/component/Payments";
import PaymentsView from "@/pages/payments/component/PaymentsView";

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route path={allRoutes.DASHBOARD} element={<Dashboard />} />
      <Route path={allRoutes.CUSTOMERS} element={<Customers />} />
      <Route path={allRoutes.ADD_CUSTOMER} element={<CustomersForm />} />
      <Route
        path={allRoutes.UPDATE_CUSTOMER(":id")}
        element={<CustomersForm />}
      />
      <Route path={allRoutes.SOFTWARES} element={<Softwares />} />
      <Route path={allRoutes.ADD_SOFTWARE} element={<SoftwaresForm />} />
      <Route
        path={allRoutes.UPDATE_SOFTWARE(":id")}
        element={<SoftwaresForm />}
      />
      <Route path={allRoutes.LEADS} element={<Leads />} />
      <Route path={allRoutes.ADD_LEAD} element={<LeadsForm />} />
      <Route path={allRoutes.UPDATE_LEAD(":id")} element={<LeadsForm />} />
      <Route path={allRoutes.VIEW_LEAD(":id")} element={<LeadsView />} />
      <Route path={allRoutes.COMPLAINT_TYPES} element={<ComplaintTypes />} />
      <Route
        path={allRoutes.ADD_COMPLAINT_TYPE}
        element={<ComplaintTypesForm />}
      />
      <Route
        path={allRoutes.UPDATE_COMPLAINT_TYPE(":id")}
        element={<ComplaintTypesForm />}
      />
      <Route path={allRoutes.COMPLAINTS} element={<Complaints />} />
      <Route path={allRoutes.ADD_COMPLAINT} element={<ComplaintsForm />} />
      <Route
        path={allRoutes.UPDATE_COMPLAINT(":id")}
        element={<ComplaintsForm />}
      />
      <Route
        path={allRoutes.VIEW_COMPLAINT(":id")}
        element={<ComplaintsView />}
      />
      <Route path={allRoutes.TICKETS} element={<Tickets />} />
      <Route path={allRoutes.ADD_TICKET} element={<TicketForm />} />
      <Route
        path={allRoutes.UPDATE_TICKET(":id")}
        element={<TicketForm />}
      />
      <Route
        path={allRoutes.VIEW_TICKET(":id")}
        element={<TicketView />}
      />
      <Route
        path={allRoutes.COMPLAINT_CATEGORIES}
        element={<ComplaintCategories />}
      />
      <Route
        path={allRoutes.ADD_COMPLAINT_CATEGORIES}
        element={<ComplaintCategoriesForm />}
      />
      <Route
        path={allRoutes.UPDATE_COMPLAINT_CATEGORIES(":id")}
        element={<ComplaintCategoriesForm />}
      />
      <Route path={allRoutes.SETUP_STATUSES} element={<SetupStatuses />} />
      <Route
        path={allRoutes.ADD_SETUP_STATUS}
        element={<SetupStatusesForm />}
      />
      <Route
        path={allRoutes.UPDATE_SETUP_STATUS(":id")}
        element={<SetupStatusesForm />}
      />
      <Route path={allRoutes.CALL_STATUSES} element={<CallStatuses />} />
      <Route path={allRoutes.ADD_CALL_STATUS} element={<CallStatusesForm />} />
      <Route
        path={allRoutes.UPDATE_CALL_STATUS(":id")}
        element={<CallStatusesForm />}
      />
      <Route
        path={allRoutes.SUBSCRIPTION_TYPES}
        element={<SubscriptionTypes />}
      />
      <Route
        path={allRoutes.ADD_SUBSCRIPTION_TYPE}
        element={<SubscriptionTypesForm />}
      />
      <Route
        path={allRoutes.UPDATE_SUBSCRIPTION_TYPE(":id")}
        element={<SubscriptionTypesForm />}
      />
      <Route path={allRoutes.LEAD_STATUSES} element={<LeadStatuses />} />
      <Route path={allRoutes.ADD_LEAD_STATUS} element={<LeadStatusesForm />} />
      <Route
        path={allRoutes.UPDATE_LEAD_STATUS(":id")}
        element={<LeadStatusesForm />}
      />
      <Route path={allRoutes.LEAD_NEXT_STEPS} element={<LeadNextSteps />} />
      <Route
        path={allRoutes.ADD_LEAD_NEXT_STEP}
        element={<LeadNextStepsForm />}
      />
      <Route
        path={allRoutes.UPDATE_LEAD_NEXT_STEP(":id")}
        element={<LeadNextStepsForm />}
      />
      <Route path={allRoutes.ROLES} element={<Roles />} />
      <Route path={allRoutes.USERS} element={<Users />} />
      <Route path={allRoutes.ADD_USER} element={<UsersForm />} />
      <Route path={allRoutes.UPDATE_USER(":id")} element={<UsersForm />} />
      <Route path={allRoutes.VIEW_USER(":id")} element={<UsersView />} />
      <Route path={allRoutes.DELETE_USER(":id")} element={<UsersForm />} />
      <Route
        path={`${allRoutes.VIEW_CUSTOMER(":id")}/*`}
        element={<CustomerRoutes />}
      />
      <Route path={allRoutes.UPDATE_ROLE(":id")} element={<RolesForm />} />
      <Route path={allRoutes.ADD_ROLE} element={<RolesForm />} />
      <Route path={allRoutes.DELETE_ROLE(":id")} element={<RolesForm />} />
      <Route path={allRoutes.VIEW_ROLE(":id")} element={<RolesView />} />


      <Route path={allRoutes.OUT_REACH_TYPES} element={<OutReach />} />
      <Route
        path={allRoutes.ADD_OUTREACH_TYPE}
        element={<OutReachForm />}
      />
      <Route
        path={allRoutes.UPDATE_OUTREACH_TYPE(":id")}
        element={<OutReachForm />}
      />
      <Route
        path={allRoutes.DELETE_OUTREACH_TYPE(":id")}
        element={<OutReachForm />}
      />
      <Route
        path={allRoutes.VIEW_OUTREACH_TYPE(":id")}
        element={<ViewOutReach />}
      />
      <Route
        path={allRoutes.UPDATE_CUSTOMER_OUTREACH(":id")}
        element={<CustomerOutreachForm />}
      />
      <Route
        path={allRoutes.ADD_CUSTOMER_OUTREACH}
        element={<CustomerOutreachForm />}
      />
      <Route
        path={allRoutes.CUSTOMER_OUTREACHS}
        element={<CustomerOutReaches />}
      />
      <Route
        path={allRoutes.VIEW_CUSTOMER_OUTREACH(":id")}
        element={<CustomerOutReachView />}
      />
      <Route path={allRoutes.SUBSCRIPTIONS} element={<Subscriptions />} />
      <Route path={allRoutes.ADD_SUBSCRIPTION} element={<SubscriptionsForm />} />
      <Route
        path={allRoutes.UPDATE_SUBSCRIPTION(":id")}
        element={<SubscriptionsForm />}
      />
      <Route
        path={allRoutes.VIEW_SUBSCRIPTION(":id")}
        element={<SubscriptionsView />}
      />
      <Route
        path={allRoutes.ADD_SUBSCRIPTION_PAYMENT(":subscriptionId")}
        element={<PaymentForm />}
      />
      <Route path={allRoutes.PAYMENTS} element={<Payments />} />
      <Route
        path={allRoutes.VIEW_PAYMENT(":id")}
        element={<PaymentsView />}
      />

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
