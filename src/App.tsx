import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./pages/layout/sidebar/component/Sidebar";
import Header from "./pages/layout/header/component/Header";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import { isUserLoggedIn } from "./lib/utils";
import { allRoutes } from "./utils/routes";

function App() {
  const navigate = useNavigate();
  const isUserVerified = useSelector(
    (state: RootState) => state.user.user?.isVerified as boolean
  );

  // if (!isUserLoggedIn) return null;
  // if (!isUserVerified) navigate(`${allRoutes.PORTAL}${allRoutes.VERIFICATION}`);

  return (
    <div className="w-full min-h-screen bg-surface text-onSurface flex ">
      <div className="w-1/5">
        <Sidebar />
      </div>
      <div className=" w-4/5">
        <div className="w-full sticky top-0">
          <Header />
        </div>
        <div className="overflow-y-scroll min-h-[calc(100vh-56px)] p-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
