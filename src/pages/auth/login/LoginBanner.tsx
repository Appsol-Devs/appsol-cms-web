import { ChartArea, Lock, ShieldCheck, Sparkles, User2 } from "lucide-react";

const LoginBanner = () => {
  return (
    <div className="w-1/2 h-full p-10 relative text-white bg-[url('/assets/images/login-banner.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60"></div> {/* Overlay */}
      <div className="relative text-sm h-full flex flex-col w-full justify-between">
        <p>Application Logo</p>

        <div className="space-y-2">
          <p className="text-2xl font-semibold">
            Manage customer subscriptions and interactions with confidence
          </p>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <p>Secure authentication and role-based access control</p>
          </div>
          <div className="flex items-center gap-1">
            <ChartArea className="w-4 h-4" />
            <p>Real-time insights into customer behavior</p>
          </div>
          <div className="flex items-center gap-1">
            <User2 className="w-4 h-4" />
            <p>Centralized customer and customer interaction management</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Lock className="w-4 h-4" />
            <p>ISO-grade data protection</p>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            <p>Uptime SLS 99.9%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBanner;
