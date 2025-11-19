import ActionButton from "@/components/ActionButtons";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import { User } from "lucide-react";

const UsersView = () => {
  return (
    <div className="space-y-2">
      <PageTitle title="User Management" />
      <PageSummary
        icon={User}
        title="User"
        description="List of users"
        actionComponent={
          <div className="flex items-center gap-2">
            <ActionButton type="edit" useText="Edit User" />
            <ActionButton type="delete" useText="Delete User" />
          </div>
        }
      />
    </div>
  );
};

export default UsersView;
