import { useLocation, useNavigate } from "react-router-dom";
import { allSideMenus } from "../common/sidebar";
import { cn } from "@/lib/utils";
import { allRoutes } from "@/utils/routes";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigateToPath = (path?: string) => {
    if (path) {
      navigate(allRoutes.PORTAL + path);
    }
  };

  return (
    <div className="bg-card text-onCard h-full">
      <div className="h-14 shadow-md">Logo</div>
      <div>
        <div className="px-4 py-2 flex flex-col gap-1">
          {allSideMenus.map(({ icon: Icon, ...menu }, index) => {
            const isActive =
              location?.pathname === allRoutes.PORTAL + menu.path;
            return (
              <div
                onClick={() => navigateToPath(menu.path)}
                key={index}
                className={cn(
                  "text-onCard flex items-center py-1.5 px-4 text-sm gap-1.5 rounded-md hover:cursor-pointer hover:bg-primary hover:text-onPrimary",
                  isActive && "bg-primary text-onPrimary",
                  !isActive && "bg-inherit"
                )}
              >
                {Icon && <Icon className="w-4" />}
                <p>{menu.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
