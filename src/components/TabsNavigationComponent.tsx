import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";

interface ITab {
  name: string;
  path: string;
}

interface ITabsNavigation {
  navTabs: ITab[];
  parentPath: string;
}

const TabsNavigationComponent = ({ navTabs, parentPath }: ITabsNavigation) => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = navTabs.find(
    (tab) =>
      parentPath + tab.path === location.pathname ||
      location.pathname.includes(parentPath + tab.path),
  );

  const navigateToPath = (path: string) => navigate(parentPath + path);

  return (
    <div>
      <div className="flex p-2 flex-wrap gap-1 items-center bg-card text-onCard rounded-md shadow w-max">
        {navTabs.map((tab, idx) => (
          <div
            onClick={() => navigateToPath(tab.path)}
            key={idx}
            className={cn(
              " px-4 py-1 hover:cursor-pointer hover:opacity-80 hover:bg-surfaceVariant hover:text-onSurfaceVariant  rounded-t-lg text-sm",
              activeTab === tab
                ? "border-tertiary border-b-4 bg-secondary! text-onSecondary!"
                : "",
            )}
          >
            {tab.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabsNavigationComponent;
