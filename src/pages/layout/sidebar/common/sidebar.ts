import { allRoutes } from "@/utils/routes";
import {
  ChartArea,
  ChartBar,
  Cog,
  LayoutDashboardIcon,
  Phone,
  PhoneCall,
  Receipt,
  Ticket,
  Users,
  Users2,
} from "lucide-react";
import type { SVGProps } from "react";

export type ISideMenu = {
  title: string;
  icon?: React.FC<SVGProps<SVGSVGElement>>;
  path?: string;
  children?: ISideMenu[];
};

export const allSideMenus: ISideMenu[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    path: allRoutes.DASHBOARD,
  },
  {
    title: "Customers",
    icon: Users,
    path: allRoutes.CUSTOMERS,
  },
  {
    title: "Agents",
    icon: Users2,
    path: allRoutes.AGENTS,
  },
  {
    title: "Billings",
    icon: Receipt,
    path: allRoutes.BILLINGS,
  },
  {
    title: "Tickets",
    icon: Ticket,
    path: allRoutes.TICKETS,
  },
  {
    title: "Leads",
    icon: ChartArea,
    path: allRoutes.LEADS,
  },
  {
    title: "Enquiries",
    icon: PhoneCall,
    path: allRoutes.ENQUIRIES,
  },
  {
    title: "Complaints",
    icon: Phone,
    path: allRoutes.COMPLAINTS,
  },
  {
    title: "Analytics",
    icon: ChartBar,
    path: allRoutes.ANALYTICS,
  },
  {
    title: "Settings",
    icon: Cog,
    path: allRoutes.SETTINGS,
  },
];
