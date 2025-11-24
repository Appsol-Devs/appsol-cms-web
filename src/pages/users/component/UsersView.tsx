import ActionButton from "@/components/ActionButtons";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import { User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLazyGetAUserQuery } from "../common/usersApi";
import { useEffect, useState } from "react";
import type { IUser } from "@/pages/customer/common/customers";
import { allRoutes } from "@/utils/routes";

const UsersView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [getUserDetails] = useLazyGetAUserQuery();
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  useEffect(() => {
    if (id) {
      getUserDetails(id)
        .unwrap()
        .then((res) => {
          if (res) {
            setSelectedUser(res);
          }
        });
    }
  }, [id]);

  return (
    <div className="space-y-2">
      <PageTitle title="User Management" />
      <PageSummary
        icon={User}
        title="User"
        description="List of users"
        actionComponent={
          <div className="flex items-center gap-2">
            <ActionButton
              onClick={() =>
                navigate(allRoutes.PORTAL + allRoutes.UPDATE_USER(id as string))
              }
              type="edit"
              useText="Edit User"
            />
            <ActionButton type="delete" useText="Delete User" />
          </div>
        }
      />
    </div>
  );
};

export default UsersView;
