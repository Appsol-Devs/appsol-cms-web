import type { ILoginResponse } from "@/pages/auth/login/common/login";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";

function getGreeting() {
  const hours = new Date().getHours();
  if (hours < 12) return "Good Morning!";
  if (hours < 18) return "Good Afternoon!";
  return "Good Evening!";
}

const DashboardGreetings = () => {
  const user = useSelector(
    (state: RootState) => state.user.user as ILoginResponse | null
  );
  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Guest";

  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="font-semibold text-sm">Hey {userName} - </p>
        <p className="text-sm">{getGreeting()} Welcome back.</p>
      </div>
    </div>
  );
};

export default DashboardGreetings;
