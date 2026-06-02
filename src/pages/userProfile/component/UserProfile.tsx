import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  User,
  Mail,
  Phone,
  Shield,
  VerifiedIcon,
  BadgeX,
  Activity,
  Clock,
} from "lucide-react";

import PageTitle from "@/components/PageTitle";
import PageSummary from "@/components/PageSummary";
import DetailItem from "@/components/ui/DetailItem";
import StatusBadge from "@/components/ui/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/helpers";

const UserProfile = () => {
  const { user } = useSelector((state: RootState) => state.user);

  if (!user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No user data available. Please log in.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <PageTitle title="My Profile" />

      <PageSummary
        icon={User}
        title={`${user.firstName} ${user.lastName}`}
        description="Manage your personal account details and preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-2">
              <Avatar className="w-32 h-32 border-4 border-gray-50 shadow-md">
                <AvatarImage
                  src={"/avatar.png"}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-bold text-gray-500 bg-gray-100">
                  {getInitials(user.firstName, user.lastName) ||
                    user.firstName?.charAt(0) + user.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm">
                {user.isVerified ? (
                  <VerifiedIcon
                    className="w-6 h-6 text-blue-500"
                    fill="currentColor"
                    color="white"
                  />
                ) : (
                  <BadgeX className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>

            <h2 className="text-sm font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-xs text-gray-500 mb-2">{user.email}</p>

            <div className="flex flex-wrap gap-2 justify-center w-full">
              <StatusBadge active={user.isActive} />
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {user.role?.name || "User"}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" /> Security & Session
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Verification Status
                </p>
                <p
                  className={`text-xs font-medium ${user.isVerified ? "text-green-600" : "text-amber-600"}`}
                >
                  {user.isVerified ? "Verified Account" : "Unverified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Active Session
                </p>
                <p
                  className={`text-xs font-medium ${user.isActive ? "text-green-600" : "text-gray-600"}`}
                >
                  {user.isActive ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Account Details</h3>
            </div>

            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <DetailItem label="First Name" value={user.firstName} />
              <DetailItem label="Last Name" value={user.lastName} />

              <div className="md:col-span-2 border-t border-gray-100"></div>

              <DetailItem
                icon={<Mail className="w-4 h-4" />}
                label="Email Address"
                value={user.email}
              />
              <DetailItem
                icon={<Phone className="w-4 h-4" />}
                label="Phone Number"
                value={user.phone}
              />

              <div className="md:col-span-2 border-t border-gray-100"></div>

             
              <DetailItem
                label="Account Status"
                value={<span className="capitalize">{user.status}</span>}
              />

              <div className="md:col-span-2 border-t border-gray-100"></div>

              <DetailItem
                icon={<Activity className="w-4 h-4" />}
                label="Total Logins"
                value={user.loginCount?.toString()}
              />
              <DetailItem
                icon={<Clock className="w-4 h-4" />}
                label="Last Login Date"
                value={
                  user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "N/A"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
