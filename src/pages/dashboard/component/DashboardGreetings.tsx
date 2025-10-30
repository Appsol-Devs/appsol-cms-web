import type { ILoginResponse } from "@/pages/auth/login/common/login";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";

const DashboardGreetings = () => {
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning!";
    if (hours < 18) return "Good Afternoon!";
    return "Good Evening!";
  };

  const user: ILoginResponse = useSelector(
    (state: RootState) => state.user.user as ILoginResponse
  );

  const userName = user?.firstName + " " + user?.lastName;

  //   const formatDate = () => {
  //     const now = new Date();
  //     return now.toLocaleDateString("en-US", {
  //       weekday: "long",
  //       month: "long",
  //       day: "numeric",
  //       year: "numeric",
  //     });
  //   };

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
