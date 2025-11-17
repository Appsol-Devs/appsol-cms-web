import { allRoutes } from "@/utils/routes";
import {
  BriefcaseBusiness,
  CalendarCheck2,
  ChartArea,
  ChartBar,
  Computer,
  Headset,
  LayoutDashboardIcon,
  Phone,
  PhoneCall,
  Receipt,
  Settings,
  Spotlight,
  StepForward,
  Ticket,
  User,
  Users,
  Users2,
} from "lucide-react";
import type { SVGProps } from "react";

export interface ISidebar {
  name: string;
  path?: string;
  subMenu?: ISubMenu[];
  // authorize?: IPermission;
  icon?: React.FC<SVGProps<SVGSVGElement>>;
  key?: string;
}

export interface ISubMenu {
  name: string;
  path: string;
  icon?: React.FC<SVGProps<SVGSVGElement>>;
}

export const sidebarMainMenus: ISidebar[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboardIcon,
    path: allRoutes.DASHBOARD,
  },
  {
    name: "Customers",
    icon: Users,
    path: allRoutes.CUSTOMERS,
  },
  {
    name: "Agents",
    icon: Users2,
    path: allRoutes.AGENTS,
  },
  {
    name: "Billings",
    icon: Receipt,
    path: allRoutes.BILLINGS,
  },
  {
    name: "Tickets",
    icon: Ticket,
    path: allRoutes.TICKETS,
  },
  {
    name: "Leads",
    icon: ChartArea,
    path: allRoutes.LEADS,
  },
  {
    name: "Enquiries",
    icon: PhoneCall,
    path: allRoutes.ENQUIRIES,
  },
  {
    name: "Complaints",
    icon: Phone,
    path: allRoutes.COMPLAINTS,
  },
  {
    name: "Analytics",
    icon: ChartBar,
    path: allRoutes.ANALYTICS,
  },
  {
    name: "Settings",
    // path: `${allRoutes.PORTAL}${allRoutes.SETTINGS}`,
    icon: Settings,
    subMenu: [
      {
        name: "Roles",
        path: `${allRoutes.ROLES}?type=settings`,
        icon: User,
      },
      {
        name: "Softwares",
        path: `${allRoutes.SOFTWARES}?type=settings`,
        icon: Computer,
      },
      {
        name: "Complaint Types",
        path: `${allRoutes.COMPLAINT_TYPES}?type=settings`,
        icon: Phone,
      },
      {
        name: "Complaint Categories",
        path: `${allRoutes.COMPLAINT_CATEGORIES}?type=settings`,
        icon: Headset,
      },
      {
        name: "Subscription Types",
        path: `${allRoutes.SUBSCRIPTION_TYPES}?type=settings`,
        icon: CalendarCheck2,
      },
      {
        name: "Call Statuses",
        path: `${allRoutes.CALL_STATUSES}?type=settings`,
        icon: PhoneCall,
      },
      {
        name: "Setup Statuses",
        path: `${allRoutes.SETUP_STATUSES}?type=settings`,
        icon: BriefcaseBusiness,
      },
      {
        name: "Lead Statuses",
        path: `${allRoutes.LEAD_STATUSES}?type=settings`,
        icon: Spotlight,
      },
      {
        name: "Lead Next Steps",
        path: `${allRoutes.LEAD_NEXT_STEPS}?type=settings`,
        icon: StepForward,
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
