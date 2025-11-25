import { useState } from "react";
import {
  ChevronRight,
  Cog,
  Dot,
  Settings,
  StretchHorizontal,
} from "lucide-react";
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

export default function Sidebar() {
  const [activeView, setActiveView] = useState<
    "main" | "sub" | "config" | "settings"
  >("main");
  const [currentRoutes, setCurrentRoutes] =
    useState<ISidebar[]>(sidebarMainMenus);
  const [parentName, setParentName] = useState<string>("");
  const navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname;

  const handleOpenSubRoutes = (route: ISidebar) => {
    if (route.subMenu) {
      setParentName(route.name);
      setCurrentRoutes(route.subMenu);
      setActiveView("sub");
    } else if (route.path) {
      navigate(allRoutes.PORTAL + route.path);
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

  return (
    <div className="relative h-full bg-card text-onCard shadow-sm">
      <div className="flex flex-col h-full">
        <div className="h-14 p-2 border">Logo</div>
        {/* Header with Back Button */}

        {/* Animated Routes List */}
        <div className="flex-1 overflow-y-auto relative">
          <div
            key={activeView + parentName}
            className="absolute inset-0 p-4 transition-transform duration-300 space-y-0.5 ease-in-out"
          >
            {activeView === "main" ? (
              <p className="text-xs uppercase font-bold mb-2">Main</p>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <BackButton onClick={handleBack} />
                <p className="text-xs uppercase font-bold">{parentName}</p>
              </div>
            )}
            {currentRoutes.map(({ icon: Icon, ...route }, idx) => {
              const isActiveParent =
                route.subMenu &&
                route.subMenu.some(
                  (subRoute) =>
                    subRoute.path === currentPath ||
                    (subRoute.path && currentPath.includes(subRoute.path))
                );

              const isActive =
                (route.path && currentPath === route.path) ||
                (route.path && currentPath.includes(route.path));

              return (
                <div
                  key={idx}
                  className={cn(
                    `${
                      isActive || isActiveParent
                        ? "bg-primary/30 text-primary hover:bg-primary/30 hover:text-primary"
                        : "hover:bg-primary/30 hover:text-primary hover:opacity-90 text-card-foreground"
                    } w-full text-sm text-left px-2 py-2 rounded-md font-semibold hover:cursor-pointer transition flex items-center justify-between
                `
                  )}
                  onClick={() => handleOpenSubRoutes(route)}
                >
                  <div className="flex items-center gap-1">
                    {Icon ? (
                      <Icon className="w-4 h-4" />
                    ) : (
                      <StretchHorizontal className="w-4 h-4" />
                    )}
                    {route.name}
                  </div>
                  <div className="flex gap-1 items-center">
                    {isActive ||
                      (isActiveParent && (
                        <Dot className="w-5 h-5 animate-pulse" />
                      ))}
                    {route.subMenu && <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
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
