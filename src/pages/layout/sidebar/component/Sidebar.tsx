import { useState } from "react";
import { Cog, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import BackButton from "@/components/BackButton";
import {
  sidebarConfigMenus,
  sidebarMainMenus,
  sidebarSettingMenus,
  type ISidebar,
} from "../common/sidebar";
import { allRoutes } from "@/utils/routes";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import SidebarToggler from "./SidebarToggler";
import SidebarMainMenu from "./SidebarMainMenu";

export default function Sidebar({
  isMobile = false,
  onClose,
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const [activeView, setActiveView] = useState<
    "main" | "sub" | "config" | "settings"
  >("main");
  const [currentRoutes, setCurrentRoutes] =
    useState<ISidebar[]>(sidebarMainMenus);
  const [parentName, setParentName] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const sidebarToggleState: boolean = useSelector(
    (state: RootState) => state.sidebar.isSidebarToggled,
  );

  const handleOpenSubRoutes = (route: ISidebar) => {
    if (route.subMenu) {
      setParentName(route.name);
      setCurrentRoutes(route.subMenu);
      setActiveView("sub");
    } else if (route.path) {
      navigate(allRoutes.PORTAL + route.path);
      if (isMobile && onClose) onClose(); 
    }
  };

  const handleBack = () => {
    setCurrentRoutes(sidebarMainMenus);
    setParentName("");
    setActiveView("main");
  };

  const handleConfigClick = () => {
    setParentName("Configuration");
    setCurrentRoutes(sidebarConfigMenus);
    setActiveView("config");
  };

  const handleSettingsClick = () => {
    setParentName("Settings");
    setCurrentRoutes(sidebarSettingMenus);
    setActiveView("settings");
  };

  const isActiveLink = (link?: ISidebar) => {
    if (!link?.path) return false;
    if (
      currentPath.startsWith(link?.path) ||
      (link.mainPath && currentPath.startsWith(link?.mainPath))
    ) {
      return true;
    }
    return false;
  };

  const isSidebarCollapsed = isMobile ? false : sidebarToggleState;

  return (
    <div className="relative h-full bg-card text-onCard shadow-md border-2">
      <div className="flex flex-col h-full">
        <div
          className={cn(
            "h-14 p-2 flex items-center transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "justify-center" : "justify-between",
          )}
        >
          <img
            className="h-8"
            src={
              isSidebarCollapsed
                ? "/assets/images/logo/appsol_cmslighticon.png"
                : "/assets/images/logo/appsol_cmslight.png"
            }
            alt="Appsol Logo Light mode"
          />

          <div className={` ${isSidebarCollapsed ? "left-2" : ""}`}>
            {!isMobile && (
              <SidebarToggler show={!isSidebarCollapsed} />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto relative">
          <div
            key={activeView + parentName}
            className="absolute inset-0 p-4 transition-transform duration-300 space-y-0.5 ease-in-out"
          >
            {activeView === "main" ? (
              <p className="text-xs uppercase font-bold mb-2">Main</p>
            ) : (
              <div
                className={cn(
                  "flex items-center gap-2 mb-2",
                  isSidebarCollapsed && "justify-center",
                )}
              >
                <BackButton onClick={handleBack} />
                {!isSidebarCollapsed && (
                  <p className="text-xs uppercase font-bold">{parentName}</p>
                )}
              </div>
            )}
            {currentRoutes.map((route, idx) => {
              const isActiveParent =
                route.subMenu &&
                route.subMenu.some(
                  (subRoute) =>
                    subRoute.path === currentPath ||
                    (subRoute.path && currentPath.includes(subRoute.path)),
                );

              return (
                <SidebarMainMenu
                  key={idx}
                  handleOpenSubRoutes={handleOpenSubRoutes}
                  isActiveLink={isActiveLink}
                  isActiveParent={isActiveParent}
                  isSidebarCollapsed={isSidebarCollapsed}
                  route={route}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="hidden absolute bottom-0 left-0 w-full border-t border-gray-700 p-4 xs:flex gap-2">
          <button
            onClick={handleConfigClick}
            className="flex flex-1 items-center justify-center bg-secondary px-2 py-1 text-xs rounded-sm text-secondary-foreground gap-2 hover:text-gray-300"
          >
            <Cog size={14} /> Config
          </button>
          <button
            onClick={handleSettingsClick}
            className="flex flex-1 justify-center bg-secondary px-2 py-1 text-xs rounded-sm text-secondary-foreground items-center gap-2 hover:text-gray-300"
          >
            <Settings size={14} />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}