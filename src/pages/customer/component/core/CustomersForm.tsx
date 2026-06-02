import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload } from "@/lib/helpers";
import {
  customerFieldToId,
  customerFieldToLabel,
  customerSchema,
  type ICustomer,
  type ICustomerFields,
} from "@/pages/customer/common/customers";
import { BookOpenText, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useAddCustomerMutation,
  useLazyGetACustomerQuery,
  useUpdateCustomerMutation,
} from "../../common/customersApi";
import { useConvertLeadMutation } from "@/pages/leads/common/leadsApi";
import CustomersFormContent from "./CustomersFormContent";
import { zodResolver } from "@hookform/resolvers/zod";
import { allRoutes } from "@/utils/routes";

type CustomerFormLocationState = {
  customerData?: Partial<ICustomer>;
  fromLeadId?: string;
  leadAlreadyConverted?: boolean;
};
// export type ICustomerFields = Omit<ICustomer, "_id"> & {
//   name?: string;
//   companyName?: string;
//   email?: string;
//   phone?: string;
//   location?: string;
//   dateConverted?: string | null;
//   notes?: string;
//   status?: string;
//   geolocation?: number;
//   softwareId?: DropDownOption<string>;
// };

const CustomersForm = () => {
  const { id } = useParams();

  const [createNewCustomer, { isLoading: isCreating }] =
    useAddCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();
  const location = useLocation();
  const locationState = location.state as CustomerFormLocationState | null;
  const [getACustomer, { isLoading: isGetting }] = useLazyGetACustomerQuery();
  const [convertLead] = useConvertLeadMutation();
  const existingData = locationState?.customerData;
  const fromLeadId = locationState?.fromLeadId;
  const leadAlreadyConverted = locationState?.leadAlreadyConverted ?? false;

  const formattedDefaultValues: Partial<ICustomerFields> = existingData
    ? {
        name: existingData.name ?? "",
        companyName: existingData.companyName ?? "",
        email: existingData.email ?? "",
        phone: existingData.phone ?? "",
        location: existingData.location ?? "",
        dateConverted:
          existingData.dateConverted ??
          new Date().toISOString().split("T")[0],
        notes: existingData.notes ?? "",
        status: existingData.status ?? "active",
        geolocation: existingData.geolocation,
        softwareId:
          existingData.softwareId ??
          existingData.software?._id ??
          undefined,
      }
    : {};
  const form = useForm<ICustomerFields>({
    resolver: zodResolver(customerSchema),
    defaultValues: formattedDefaultValues || {},
  });
  const { watch, handleSubmit, reset } = form;
  const values = watch();
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(
    null,
  );


  const fetchCustomerData = async (id: string) => {
    if (!id) return;

    try {
      const res = await getACustomer(id).unwrap();
      if (res) {
        setSelectedCustomer(res);
        resetFormWithData(res);
      }
    } catch (err) {
      if (!err) return;
      console.error(err);
    }
  };
  const resetFormWithData = (data: ICustomer) => {
    if (!data) return;

    const softwareId =
      typeof data.softwareId === "string"
        ? data.softwareId
        : data.software?._id;

    reset({
      name: data.name ?? "",
      companyName: data.companyName ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      location: data.location ?? "",
      dateConverted: data.dateConverted ?? undefined,
      notes: data.notes ?? undefined,
      status: data.status ?? undefined,
      geolocation: data.geolocation,
      softwareId: softwareId ?? undefined,
    });
  };

  useEffect(() => {
    if (id) {
      fetchCustomerData(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedCustomer) {
      resetFormWithData(selectedCustomer);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (id || !existingData) return;
    reset(formattedDefaultValues);
  }, [id, existingData, reset]);

  const handleDataSubmission = async (payload: ICustomer) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateCustomer({ ...payload, _id: id }).unwrap()
        : await createNewCustomer(payload).unwrap();

      if (res) {
        if (!id && fromLeadId && !leadAlreadyConverted) {
          try {
            await convertLead(fromLeadId).unwrap();
          } catch (convertError) {
            console.error("Customer created but lead convert failed", convertError);
            showToast({
              title: "Warning",
              message:
                "Customer was saved, but linking the lead as converted failed.",
              type: "info",
            });
          }
        }

        showToast({
          title: "Success",
          message: id
            ? "Customer updated successfully."
            : fromLeadId
              ? "Customer created from lead successfully."
              : "Customer created successfully.",
          type: "success",
        });

        if (!id && res._id) {
          navigate(allRoutes.PORTAL + allRoutes.VIEW_CUSTOMER(res._id));
        } else {
          navigate(-1);
        }
      }
    } catch (error) {
      if (!error) return;
    }
  };

const submitData = handleSubmit(
  (data) => {
    const payload: ICustomer = cleanPayload({
      name: data.name,
      companyName: data.companyName,
      dateConverted: data.dateConverted,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
      location: data.location,
      geolocation: data.geolocation,
      status: data.status,
      softwareId: customerFieldToId(data.softwareId),
      ...(fromLeadId && { leadId: fromLeadId }),
    });

    handleDataSubmission(payload);
  },
  

);

  const summarySections: ISummarySection[] = [
    {
      title: "Basic Information",
      icon: <BookOpenText className="w-4 h-4" />,
      data: [
        { label: "Name", value: values?.name, required: true },
        { label: "Email", value: values?.email, required: true },
        {
          label: "Phone Number",
          value: values?.phone,
          required: true,
        },
      ],
    },
    {
      title: "Business Information",
      icon: <Home className="w-4 h-4" />,
      data: [
        {
          label: "Company Name",
          value: values?.companyName as string,
          required: true,
        },
        {
          label: "Location",
          value: values?.location as string,
          required: true,
        },
        {
          label: "Date Converted",
          value: values?.dateConverted as string,
        },
        {
          label: "Notes",
          value: values?.notes as string,
        },
        {
          label: "Related Software",
          value: customerFieldToLabel(values?.softwareId),
        },
        // {
        //   label:"Geolocation",
        //   value: values?.geolocation as string,
        // }
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div>
      <MutationFormTemplate<ICustomerFields>
        form={form}
        pageSummary={{
          title: id
            ? "Update Customer"
            : fromLeadId
              ? "Create Customer from Lead"
              : "Create New Customer",
          description: fromLeadId
            ? "Review and complete the customer profile converted from this lead."
            : `Enter all the details of the customer you want to ${
                id ? "update" : "create"
              }.`,
          icon: BookOpenText,
        }}
        formContent={
          <CustomersFormContent
            isUpdate={!!id}
            form={form}
            isLoading={isLoading}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Customer - ${selectedCustomer?.companyName ?? ""}`
            : "Add Customer"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Customer Details Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Customer",
        }}
      />
    </div>
  );
};

export default CustomersForm;
