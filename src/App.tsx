import { Outlet } from "react-router-dom";
import Sidebar from "./pages/layout/sidebar/component/Sidebar";
import Header from "./pages/layout/header/component/Header";

function App() {
  return (
    <div className="w-full min-h-screen bg-surface text-onSurface flex ">
      <div className="w-1/5">
        <Sidebar />
      </div>
      <div className=" w-4/5">
        <div className="w-full sticky top-0">
          <Header />
        </div>
        <div className="overflow-y-scroll min-h-[calc(100vh-56px)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
