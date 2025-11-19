import ActionButton from "@/components/ActionButtons";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import { User } from "lucide-react";
import UserBasicDetails from "./UserBasicDetails";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddUserMutation,
  useLazyGetAUserQuery,
  useUpdateUserMutation,
} from "../common/usersApi";
import { useForm } from "react-hook-form";
import type { IUser } from "@/pages/customer/common/customers";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload } from "@/lib/helpers";
import UserBasicDetailsSummary from "./UserBasicDetailsSummary";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import type { DropDownOption } from "@/components/DropdownComponent";

export type IUserFields = Omit<IUser, "_id"> & {
  role?: DropDownOption<string>;
  confirm_password?: string;
};
const UsersForm = () => {
  const { id } = useParams();
  const [createNewUser, { isLoading: isCreating }] = useAddUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [getAUser, { isLoading: isGetting }] = useLazyGetAUserQuery();
  const form = useForm<IUserFields>();

  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const { watch, getValues, reset } = form;
  const formValues = watch();

  const fetchUserData = async (customerId: string) => {
    if (!customerId) return;

    try {
      const res = await getAUser(customerId).unwrap();
      if (res) {
        setSelectedUser(res);
      }
    } catch (err) {
      if (!err) return;
      console.error(err);
    }
  };

  const resetFormWithCustomerData = (data: IUser) => {
    if (!data) return;
    // reset({
    //   ...data,
    //   customerType: data.customerType
    //     ? { label: data.customerType, value: data.customerType }
    //     : undefined,
    //   region: data.region
    //     ? { label: data.region, value: data.region }
    //     : undefined,
    //   gender: data.gender
    //     ? { label: data.gender, value: data.gender }
    //     : undefined,
    //   idType1: data.idType1
    //     ? { label: data.idType1, value: data.idType1 }
    //     : undefined,
    //   idType2: data.idType2
    //     ? { label: data.idType2, value: data.idType2 }
    //     : undefined,
    //   maritalStatus: data.maritalStatus
    //     ? { label: data.maritalStatus, value: data.maritalStatus }
    //     : undefined,
    //   title: data.title ? { label: data.title, value: data.title } : undefined,
    // });
  };

  useEffect(() => {
    if (id) {
      fetchUserData(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedUser) {
      resetFormWithCustomerData(selectedUser);
    }
  }, [selectedUser]);

  const handleDataSubmission = async (payload: IUser) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateUser({ _id: id, ...payload }).unwrap()
        : await createNewUser(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "User updated successfully."
            : "User created successfully.",
          type: "success",
        });
        navigate(-1);
      }
    } catch (error) {
      if (!error) return;
    }
  };

  const submitData = () => {
    const data = getValues();

    const requiredFields = [
      {
        field: data.password === data.confirm_password,
        message: "Passwords do not match",
        skip: id,
      },
      { field: data.firstName, message: "First Name is required." },
      { field: data.lastName, message: "Last Name is required." },
      { field: data.phone, message: "Phone Number is required." },
      { field: data.password, message: "Password is required." },
      { field: data.email, message: "Email is required." },
      { field: data.role, message: "Role is required." },
    ];

    for (const { field, message, skip } of requiredFields) {
      if (!field || !skip) {
        showToast({ title: "Info", message, type: "info", duration: 1000 });
        return;
      }
    }

    const payload: IUser = cleanPayload({
      role: data.role?.value,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });

    handleDataSubmission(payload);
  };

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div className="space-y-1">
      <PageTitle title="Add User" />
      <PageSummary
        icon={User}
        title="Create New User"
        description="Enter all the details of the user you want to create."
        actionComponent={
          <div className="flex items-center gap-2">
            <ActionButton type="save" useText="Save User" />
            <ConfirmationDialog
              onConfirmClicked={() => form.reset()}
              title="Clear Form"
              content={
                <div className="text-center">
                  <p>Are you sure you want to clear this form?</p>
                  <p>If you proceed, you will remove all entered data.</p>
                </div>
              }
              rightActionTitle="Proceed"
              trigger={<ActionButton type="remove" useText="Reset Form" />}
            />
          </div>
        }
      />
      <div className="w-full flex md:flex-row flex-col gap-4">
        <UserBasicDetails isLoading={isLoading} form={form} />
        <UserBasicDetailsSummary
          isLoading={isLoading}
          submitData={submitData}
          values={formValues}
        />
      </div>
    </div>
  );
};

export default UsersForm;
