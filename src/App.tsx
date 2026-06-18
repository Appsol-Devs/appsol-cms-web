import { Outlet } from "react-router-dom";
import Sidebar from "./pages/layout/sidebar/component/Sidebar";
import Header from "./pages/layout/header/component/Header";
import { isUserLoggedIn } from "./lib/utils";
import { useToggleSidebarForNotLargeScreens } from "./lib/hooks";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import { NotificationProvider } from "./pages/layout/notification/component/NotificationContextProvider";


function App() {
 
  if (!isUserLoggedIn) return null;

  useToggleSidebarForNotLargeScreens();
  const sidebarToggleState: boolean = useSelector(
    (state: RootState) => state.sidebar.isSidebarToggled,
  );

  const currentUserData = localStorage.getItem("currentUser");
  let token: string | null = null;

  if (currentUserData) {
    const parsedData = JSON.parse(currentUserData);
    token = parsedData?.user_validation_info?.token || null;
  }
  return (
    <NotificationProvider token={token}>
      <div className="h-screen bg-surface text-onSurface flex relative">
        <div
          className={`lg:block transition-all duration-300 ease-in-out ${
            !sidebarToggleState ? "lg:w-1/5" : "w-[70px] overflow-hidden"
          } `}
        >
          <div className="h-screen shadow-md">
            <Sidebar />
          </div>
        </div>
        <div
          className={`w-full h-screen relative overflow-y-auto hide-scrollbar ${
            sidebarToggleState ? "lg:w-[calc(100%-50px)]" : "lg:w-4/5"
          }`}
        >
          <div className="w-full sticky top-0 z-20">
            <Header />
          </div>
          <div className="min-h-[calc(100vh-56px)] p-5">
            <Outlet />
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;
