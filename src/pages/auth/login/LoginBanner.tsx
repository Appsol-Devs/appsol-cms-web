import { ChartArea, ShieldCheck, User2 } from "lucide-react";

const LoginBanner = () => {
  return (
    <div className="w-1/2 h-full p-10 relative text-white bg-[url('/assets/images/login-banner.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60"></div> {/* Overlay */}
      <div className="relative text-sm h-full flex flex-col w-full justify-between">
        <img
          className="w-14"
          src="/assets/images/logo/appsol_cmslighticon.png"
          alt="Appsol Logo Light mode"
        />

        <div className="space-y-2 text-primary">
          <p className="text-4xl font-semibold text-white">
            Manage customer subscriptions and interactions with confidence
          </p>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <p className="text-white">
              Secure authentication and role-based access control
            </p>
          </div>
          <div className="flex items-center gap-1">
            <ChartArea className="w-4 h-4" />
            <p className="text-white">
              Real-time insights into customer behavior
            </p>
          </div>
          <div className="flex items-center gap-1">
            <User2 className="w-4 h-4" />
            <p className="text-white">
              Centralized customer and customer interaction management
            </p>
          </div>
        </div>

        <div className="space-y-2 text-primary">
        </div>
      </div>
    </div>
  );
};

export default LoginBanner;
