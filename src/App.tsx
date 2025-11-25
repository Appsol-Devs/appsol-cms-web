import { Outlet } from "react-router-dom";
import Sidebar from "./pages/layout/sidebar/component/Sidebar";
import Header from "./pages/layout/header/component/Header";
import { isUserLoggedIn } from "./lib/utils";

function App() {
  // const navigate = useNavigate();
  // const isUserVerified = useSelector(
  //   (state: RootState) => state.user.user?.isVerified as boolean
  // );

  if (!isUserLoggedIn) return null;
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
