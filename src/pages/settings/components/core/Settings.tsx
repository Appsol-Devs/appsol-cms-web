import { Outlet } from "react-router-dom";

const Settings = () => {
  return (
    <div>
      <div>Allsections</div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Settings;
