import type { ISidebar } from "../common/sidebar";
import { cn } from "@/lib/utils";
import { Tooltip } from "@mui/material";
import { ChevronRight, Dot, StretchHorizontal } from "lucide-react";

interface Props {
  isActiveLink: (link?: ISidebar | undefined) => boolean;
  route: ISidebar;
  isActiveParent: boolean | undefined;
  handleOpenSubRoutes: (route: ISidebar) => void;
  isSidebarCollapsed: boolean;
}

const SidebarMainMenu = ({
  isActiveLink,
  route: { icon: Icon, ...route },
  isActiveParent,
  handleOpenSubRoutes,
  isSidebarCollapsed,
}: Props) => {
  const menuContent = () => {
    return (
      <div
        className={cn(
          `${
            isActiveLink(route) || isActiveParent
              ? "bg-primary/90 text-onPrimary hover:bg-primary/30 hover:text-primary"
              : "hover:bg-primary/30 hover:text-primary hover:opacity-90 text-card-foreground"
          } w-full text-sm text-left px-2 py-2 rounded-md font-semibold hover:cursor-pointer transition flex items-center justify-between
                    `,
        )}
        onClick={() => handleOpenSubRoutes(route)}
      >
        <div className="flex items-center gap-1">
          {Icon ? (
            <Icon className="w-4.5 h-4.5" />
          ) : (
            <StretchHorizontal className="w-4 h-4" />
          )}
          {!isSidebarCollapsed && route.name}
        </div>
        <div className="flex gap-1 items-center">
          {isActiveLink(route) ||
            (isActiveParent && <Dot className="w-5 h-5 animate-pulse" />)}
          {route.subMenu && <ChevronRight className="w-4 h-4" />}
        </div>
      </div>
    );
  };
  return (
    <>
      {isSidebarCollapsed ? (
        <Tooltip placement="right" arrow title={route.name}>
          {menuContent()}
        </Tooltip>
      ) : (
        menuContent()
      )}
    </>
  );
};

export default SidebarMainMenu;
