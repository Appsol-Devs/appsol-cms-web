import ActionButton from "@/components/ActionButtons";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import { User, Mail, Phone, Calendar, Shield, VerifiedIcon, BadgeX, Trash2, } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteUserMutation, useLazyGetAUserQuery } from "../common/usersApi";
import { useEffect, useState } from "react";
import { allRoutes } from "@/utils/routes";
import { showToast } from "@/components/ui/CustomToast";
import DetailItem from "@/components/ui/DetailItem";
import type { IUser } from "@/pages/customer/common/customers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/helpers";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ConfirmationDialog";





const UsersView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deleteUser,] = useDeleteUserMutation();
  const [getUserDetails, { isLoading: isFetching }] = useLazyGetAUserQuery();
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [getUser] = useLazyGetAUserQuery();
  const [creator, setCreator] = useState("");

  const fetchUser = async (userId: string) => {
    try {
      const user = await getUser(userId).unwrap();
      setCreator(user.firstName + " " + user.lastName);
    }
    catch (error) {
      console.error("Failed to fetch creator details", error);
    }
  }
  useEffect(() => {
    if (id) {
      getUserDetails(id)
        .unwrap()
        .then((res) => {
          if (res) {
            setSelectedUser(res);
          }
        })
        .catch((err) => console.error("Failed to fetch user", err));
    }
  }, [id, getUserDetails]);

  const handleUserDeletion = async (userId: string) => {
    if (!userId) return;

    try {
      await deleteUser({ id: userId }).unwrap();
      showToast({
        title: "Success",
        message: "User deleted successfully.",
        type: "success",
      });
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete user", error);
      showToast({ title: "Error", message: "Failed to delete user", type: "error" });
    }
  };

  useEffect(() => {
    if (selectedUser && selectedUser.createdBy)
      fetchUser(String(selectedUser.createdBy))
  }, [selectedUser, selectedUser?.createdBy]);



  if (isFetching || !selectedUser) {
    return <div className="p-8 text-center text-gray-500">Loading user details...</div>;
  }


  return (
    <div className="space-y-2">
      <PageTitle title="User Management" />

      <PageSummary
        icon={User}
        title={`${selectedUser.firstName} ${selectedUser.lastName}`}
        description={`Manage access and details for ${selectedUser.firstName} ${selectedUser.lastName}`}
        actionComponent={
          <div className="flex items-center gap-3">
            <ActionButton
              onClick={() => navigate(allRoutes.PORTAL + allRoutes.UPDATE_USER(id as string))}
              type="edit"
              useText="Edit User"
            />
            <ConfirmationDialog
              alertType="delete"
              title="Delete User Account?"
              rightActionTitle="Delete"
              content={
                <p className="text-gray-500 text-center">
                  This action cannot be undone. This will permanently delete
                  the user <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> and remove their data.
                </p>
              }

              onConfirmClicked={() => handleUserDeletion(id as string)}

              trigger={
                <Button variant="destructive" className="bg-red-700! text-white">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="text-xs">Delete User</span>
                </Button>
              }
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-2">

              <Avatar className="w-32 h-32 border-4 border-gray-50 shadow-md">
                <AvatarImage
                  src={selectedUser.imageUrl}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  className="object-cover"
                />

                <AvatarFallback className="text-4xl font-bold text-gray-500 bg-gray-100">
                  {getInitials(selectedUser.firstName, selectedUser.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm">
                {selectedUser.isVerified ? (
                  <VerifiedIcon className="w-6 h-6 text-blue-500" fill="currentColor" color="white" />
                ) : (
                  <BadgeX className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>

            <h2 className="text-sm font-bold text-gray-900">
              {selectedUser.firstName} {selectedUser.lastName}
            </h2>
            <p className="text-xs text-gray-500 mb-2">{selectedUser.email}</p>

            <div className="flex flex-wrap gap-2 justify-center w-full">
              <StatusBadge active={selectedUser.isActive} />
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {selectedUser.role?.name || "User"}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" /> Security & Device
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 uppercase">Verification Status</p>
                <p className={`text-xs font-medium ${selectedUser.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                  {selectedUser.isVerified ? "Verified Account" : "Unverified"}
                </p>
              </div>

            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Account Details</h3>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

              <DetailItem label="First Name" value={selectedUser.firstName} />
              <DetailItem label="Last Name" value={selectedUser.lastName} />


              <div className="md:col-span-2 border-t border-gray-100 my-2"></div>

              <DetailItem
                icon={<Mail className="w-4 h-4" />}
                label="Email Address"
                value={selectedUser.email}
              />
              <DetailItem
                icon={<Phone className="w-4 h-4" />}
                label="Phone Number"
                value={selectedUser.phone}
              />

              <div className="md:col-span-2 border-t border-gray-100 my-2"></div>


              <DetailItem
                label="Role"
                value={selectedUser.role?.name}
              />

              <div className="md:col-span-2 border-t border-gray-100 my-2"></div>

              <DetailItem
                icon={<Calendar className="w-4 h-4" />}
                label="Registered On"
                value={formatDate(selectedUser.createdAt)}
              />
              <DetailItem
                icon={<Calendar className="w-4 h-4" />}
                label="Last Updated"
                value={formatDate(selectedUser.updatedAt)}
              />
              <DetailItem
                label="Created By"
                value={creator || "System"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default UsersView;