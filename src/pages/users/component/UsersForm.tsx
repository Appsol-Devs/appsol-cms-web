import type { DropDownOption } from "@/components/DropdownComponent";
import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload, resetMutationForm } from "@/lib/helpers";
import type { DefaultValues } from "react-hook-form";
import type { IUser } from "@/pages/customer/common/customers";
import { BookOpenText, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddUserMutation,
  useLazyGetAUserQuery,
  useUpdateUserMutation,
} from "../common/usersApi";
import UsersFormContent from "./UsersFormContent";

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
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const fetchUserData = async (id: string) => {
    if (!id) return;

    try {
      const res = await getAUser(id).unwrap();
      if (res) {
        setSelectedUser(res);
      }
    } catch (err) {
      if (!err) return;
      console.error(err);
    }
  };

  const getEmptyUserValues = (): IUserFields => ({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    role: undefined,
  });

  const resetFormWithData = (data: IUser) => {
    if (!data) return;
    reset({
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      password: "",
      confirm_password: "",
      role: data.role
        ? { label: data.role.name, value: data.role._id as string }
        : undefined,
    });
  };

  const handleResetForm = () => {
    if (id && selectedUser) {
      resetFormWithData(selectedUser);
      return;
    }
    resetMutationForm<IUserFields>(
      form,
      getEmptyUserValues() as DefaultValues<IUserFields>,
    );
  };

  useEffect(() => {
    if (id) {
      fetchUserData(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedUser) {
      resetFormWithData(selectedUser);
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

    const passwordsMatch = data.password === data.confirm_password;

    const isUpdate = id ? true : false;

    const requiredFields = [
      {
        field: passwordsMatch,
        message: "Passwords do not match",
        skip: isUpdate,
      },
      { field: data.firstName, message: "First Name is required." },
      { field: data.lastName, message: "Last Name is required." },
      { field: data.phone, message: "Phone Number is required." },
      {
        field: data.password,
        message: "Password is required.",
        skip: isUpdate,
      },
      { field: data.email, message: "Email is required." },
      { field: data.role, message: "Role is required." },
    ];

    for (const { field, message, skip } of requiredFields) {
      if (!field && !skip) {
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
      password: id ? undefined : data.password,
    });

    // console.log(payload);
    handleDataSubmission(payload);
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Basic Information",
      icon: <BookOpenText className="w-4 h-4" />,
      data: [
        { label: "First Name", value: values?.firstName, required: true },
        { label: "Last Name", value: values?.lastName, required: true },
        {
          label: "Phone Number",
          value: values?.phone,
          required: true,
        },
      ],
    },
    {
      title: "Identification & Security Information",
      icon: <Shield className="w-4 h-4" />,
      data: [
        {
          label: "Role",
          value: values?.role?.label as string,
          required: true,
        },
        {
          label: "Email",
          value: values?.email as string,
          required: true,
        },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div>
      <MutationFormTemplate<IUserFields>
        form={form}
        pageSummary={{
          title: id ? "Update User" : "Create New User",
          description: `Enter all the details of the user you want to ${
            id ? "update" : "create"
          }.`,
          icon: BookOpenText,
        }}
        formContent={
          <UsersFormContent isUpdate={!!id} form={form} isLoading={isLoading} />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update User - ${selectedUser?.firstName ?? ""} ${
                selectedUser?.lastName ?? ""
              }`
            : "Add User"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "User Details Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save User",
        }}
        onResetForm={handleResetForm}
      />
    </div>
  );
};

export default UsersForm;
