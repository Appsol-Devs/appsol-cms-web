import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import DetailItem from "@/components/ui/DetailItem";
import StatusBadge from "@/components/ui/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/helpers";
import type { ILoginResponse } from "@/pages/auth/login/common/login";
import {
  Activity,
  BadgeX,
  Clock,
  Edit,
  Mail,
  Phone,
  Shield,
  User,
  VerifiedIcon,
} from "lucide-react";

interface UserProfileViewProps {
  user: ILoginResponse;
  onEdit: () => void;
}

const UserProfileView = ({ user, onEdit }: UserProfileViewProps) => {
  return (
    <div className="space-y-2">
      <PageTitle title="My Profile" />

      <PageSummary
        icon={User}
        title={`${user.firstName} ${user.lastName}`}
        description="Manage your personal account details and preferences."
        actionComponent={
          <Button
            onClick={onEdit}
            className="rounded-full bg-primary! text-primary-foreground! text-xs!"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-2">
              <Avatar className="w-32 h-32 border-4 border-muted shadow-md">
                <AvatarImage
                  src={user.imageUrl || undefined}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-bold text-muted-foreground bg-muted">
                  {getInitials(user.firstName, user.lastName) ||
                    `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 bg-card rounded-full p-1 shadow-sm">
                {user.isVerified ? (
                  <VerifiedIcon
                    className="w-6 h-6 text-blue-500"
                    fill="currentColor"
                    color="white"
                  />
                ) : (
                  <BadgeX className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </div>

            <h2 className="text-sm font-bold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-xs text-muted-foreground mb-2">{user.email}</p>

            <div className="flex flex-wrap gap-2 justify-center w-full">
              <StatusBadge active={user.isActive} />
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {user.role?.name || "User"}
              </span>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" /> Security &
              Session
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Verification Status
                </p>
                <p
                  className={`text-xs font-medium ${user.isVerified ? "text-green-600" : "text-amber-600"}`}
                >
                  {user.isVerified ? "Verified Account" : "Unverified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Active Session
                </p>
                <p
                  className={`text-xs font-medium ${user.isActive ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {user.isActive ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b bg-muted/30">
              <h3 className="font-semibold">Account Details</h3>
            </div>

            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <DetailItem label="First Name" value={user.firstName} />
              <DetailItem label="Last Name" value={user.lastName} />

              <div className="md:col-span-2 border-t border-border" />

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

              <div className="md:col-span-2 border-t border-border" />

              <DetailItem
                label="Account Status"
                value={<span className="capitalize">{user.status}</span>}
              />

              <div className="md:col-span-2 border-t border-border" />

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

export default UserProfileView;
