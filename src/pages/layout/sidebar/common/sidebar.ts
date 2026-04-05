import { allRoutes } from "@/utils/routes";
import {
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarClock,
  Computer,
  CreditCard,
  Headset,
  LayoutDashboardIcon,
  Lock,
  Phone,
  PhoneCall,
  Receipt,
  Settings,
  Spotlight,
  StepForward,
  Ticket,
  User,
  Users,
} from "lucide-react";
import type { SVGProps } from "react";

export interface ISidebar {
  name: string;
  path?: string;
  subMenu?: ISubMenu[];
  // authorize?: IPermission;
  icon?: React.FC<SVGProps<SVGSVGElement>>;
  key?: string;
  mainPath?: string;
}

export interface ISubMenu {
  name: string;
  path: string;
  icon?: React.FC<SVGProps<SVGSVGElement>>;
  mainPath?: string;
}

export const sidebarMainMenus: ISidebar[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboardIcon,
    path: allRoutes.DASHBOARD,
    mainPath: `${allRoutes.PORTAL}${allRoutes.DASHBOARD}`,
  },
  {
    name: "Customers",
    mainPath: `${allRoutes.PORTAL}${allRoutes.CUSTOMERS}`,
    icon: Users,
    path: allRoutes.CUSTOMERS,
  },
  // {
  //   name: "Agents",
  //   icon: Users2,
  //   path: allRoutes.AGENTS,
  // },
  {
    mainPath: `${allRoutes.PORTAL}${allRoutes.SUBSCRIPTIONS}`,
    name: "Subscriptions",
    icon: Receipt,
    path: allRoutes.SUBSCRIPTIONS,
  },
  {
    mainPath: `${allRoutes.PORTAL}${allRoutes.PAYMENTS}`,
    name: "Payments",
    icon: CreditCard,
    path: allRoutes.PAYMENTS,
  },
  {
    name: "Tickets",
    mainPath: `${allRoutes.PORTAL}${allRoutes.TICKETS}`,
    icon: Ticket,
    path: allRoutes.TICKETS,
  },
  {
    name: "Schedules",
    mainPath: `${allRoutes.PORTAL}${allRoutes.RESCHEDULES}`,
    icon: CalendarClock,
    path: allRoutes.RESCHEDULES,
  },
  {
    name: "Leads",
    icon: Spotlight,
    mainPath: `${allRoutes.PORTAL}${allRoutes.LEADS}`,
    path: allRoutes.LEADS,
  },
  {
    name: "Complaints",
    mainPath: `${allRoutes.PORTAL}${allRoutes.COMPLAINTS}`,
    icon: Phone,
    path: allRoutes.COMPLAINTS,
  },
  {
    mainPath: `${allRoutes.PORTAL}${allRoutes.FEATURE_REQUESTS}`,
    name: "Feature Requests",
    icon: Lock,
    path: allRoutes.FEATURE_REQUESTS,
  },
  {
    mainPath: `${allRoutes.PORTAL}${allRoutes.CUSTOMER_SETUPS}`,
    name: "Customer Setups",
    icon: Lock,
    path: allRoutes.CUSTOMER_SETUPS,
  },
  {
    mainPath: `${allRoutes.PORTAL}${allRoutes.CUSTOMER_OUTREACHS}`,
    name: "Customer OutReaches",
    icon: Headset,
    path: allRoutes.CUSTOMER_OUTREACHS,
  },
  {
    name: "Settings",
    icon: Settings,
    subMenu: [
      {
        name: "Roles",
        path: `${allRoutes.ROLES}`,
        icon: User,
      },
      {
        name: "Users",
        path: allRoutes.USERS,
        icon: Users,
        mainPath: `${allRoutes.PORTAL}${allRoutes.USERS}`,
      },
      {
        name: "Softwares",
        path: `${allRoutes.SOFTWARES}`,
        icon: Computer,
      },
      {
        name: "Complaint Types",
        path: `${allRoutes.COMPLAINT_TYPES}`,
        icon: Phone,
      },
      {
        name: "Complaint Categories",
        path: `${allRoutes.COMPLAINT_CATEGORIES}`,
        icon: Headset,
      },
      {
        name: "Subscription Types",
        path: `${allRoutes.SUBSCRIPTION_TYPES}`,
        icon: CalendarCheck2,
      },
      {
        name: "Call Statuses",
        path: `${allRoutes.CALL_STATUSES}`,
        icon: PhoneCall,
      },
      {
        name: "Setup Statuses",
        path: `${allRoutes.SETUP_STATUSES}`,
        icon: BriefcaseBusiness,
      },
      {
        name: "Lead Statuses",
        path: `${allRoutes.LEAD_STATUSES}`,
        icon: Spotlight,
      },
      {
        name: "Lead Next Steps",
        path: `${allRoutes.LEAD_NEXT_STEPS}`,
        icon: StepForward,
      },
      {
        name: "OutReach Types",
        path: `${allRoutes.OUT_REACH_TYPES}`,
        icon: User,
      },
    ],
  },
];

export const sidebarConfigMenus: ISidebar[] = [
  { name: "General Config", path: "/config/general" },
  { name: "User Management", path: "/config/users" },
];

export const sidebarSettingMenus: ISidebar[] = [
  { name: "Profile", path: "/settings/profile" },
  { name: "Preferences", path: "/settings/preferences" },
];
