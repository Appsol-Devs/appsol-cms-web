import ActionButton from "@/components/ActionButtons";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import { Shield, Trash2, Briefcase, KeyRound, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteRoleMutation, useLazyGetARoleQuery } from "../common/rolesApi";
import { useEffect, useState } from "react";
import { allRoutes } from "@/utils/routes";
import { showToast } from "@/components/ui/CustomToast";
import DetailItem from "@/components/ui/DetailItem";
import type { IRole } from "@/pages/auth/login/common/login";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/helpers";
import { Button } from "@/components/ui/button";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const RolesView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deleteRole] = useDeleteRoleMutation();
  const [getRoleDetails, { isLoading: isFetching }] = useLazyGetARoleQuery();
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);

  useEffect(() => {
    if (id) {
      getRoleDetails(id)
        .unwrap()
        .then((res) => {
          if (res) {
            setSelectedRole(res);
          }
        })
        .catch((err) => console.error("Failed to fetch role", err));
    }
  }, [id, getRoleDetails]);

  const handleRoleDeletion = async (roleId: string) => {
    if (!roleId) return;

    try {
      await deleteRole({ id: roleId }).unwrap();
      showToast({
        title: "Success",
        message: "Role deleted successfully.",
        type: "success",
      });
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete role", error);
      showToast({ title: "Error", message: "Failed to delete role", type: "error" });
    }
  };

  if (isFetching || !selectedRole) {
    return <div className="p-8 text-center text-gray-500">Loading role details...</div>;
  }

  return (
    <div className="space-y-4">
      <PageTitle title="Role Management" />

      <PageSummary
        icon={Shield}
        title={`${selectedRole.name}`}
        description="Manage permissions and role details"
        actionComponent={
          <div className="flex items-center gap-3">
            <ActionButton
              onClick={() => navigate(allRoutes.PORTAL + allRoutes.UPDATE_ROLE(id as string))}
              type="edit"
              useText="Edit Role"
            />
            <ConfirmationDialog
              alertType="delete"
              title="Delete Role?"
              rightActionTitle="Delete"
              content={
                <p className="text-gray-500 text-center">
                  This action cannot be undone. This will permanently delete
                  the role <strong>{selectedRole.name}</strong>. Users assigned to this role may lose access.
                </p>
              }
              onConfirmClicked={() => handleRoleDeletion(id as string)}
              trigger={
                <Button variant="destructive" className="bg-red-700! text-white">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="text-xs">Delete Role</span>
                </Button>
              }
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
               <Briefcase className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {selectedRole.name}
            </h2>
            <p className="text-sm text-gray-500 mb-4 px-4">
               {selectedRole.description}
            </p>

            <div className="w-full border-t border-gray-100 pt-4 mt-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Total Permissions</span>
                    <Badge variant="secondary" className="text-blue-700 bg-blue-50">
                        {selectedRole.permissions?.length || 0}
                    </Badge>
                </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Role Information</h3>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <DetailItem label="Role Name" value={selectedRole.name} />
              <DetailItem label="Description" value={selectedRole.description} />
              
              <div className="md:col-span-2 border-t border-gray-100 my-2"></div>

              <DetailItem
                icon={<Calendar className="w-4 h-4" />}
                label="Created On"
                value={formatDate(selectedRole.createdAt)}
              />
              <DetailItem
                icon={<Calendar className="w-4 h-4" />}
                label="Last Updated"
                value={formatDate(selectedRole.updatedAt)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Assigned Permissions</h3>
            </div>
            
            <div className="p-6">
                {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedRole.permissions.map((perm: any, index: number) => (
                             <Badge key={index} variant="outline" className="py-1.5 px-3 text-gray-600 border-gray-300">
                                {typeof perm === 'string' ? perm : perm.name}
                             </Badge>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                        No permissions assigned to this role.
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesView;