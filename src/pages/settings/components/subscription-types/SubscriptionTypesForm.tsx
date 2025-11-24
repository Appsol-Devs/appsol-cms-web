import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload } from "@/lib/helpers";
import { CalendarCheck2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import type { ISubscriptionType } from "../../common/settings";
import {
  useAddSubscriptionTypeMutation,
  useLazyGetASubscriptionTypeQuery,
  useUpdateSubscriptionTypeMutation,
} from "../../common/settingsApi";
import SubscriptionTypesFormContent from "./SubscriptionTypesFormContent";

export type ISubscriptionTypeFields = Omit<ISubscriptionType, "_id"> & {};

const SubscriptionTypesForm = () => {
  const { id } = useParams();

  const [createNewMutation, { isLoading: isCreating }] =
    useAddSubscriptionTypeMutation();
  const [updateMutation, { isLoading: isUpdating }] =
    useUpdateSubscriptionTypeMutation();
  const [getSelectedData, { isLoading: isGetting }] =
    useLazyGetASubscriptionTypeQuery();
  const form = useForm<ISubscriptionTypeFields>();
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState<ISubscriptionType | null>(
    null
  );

  const fetchData = async (id: string) => {
    if (!id) return;

    try {
      const res = await getSelectedData(id).unwrap();
      if (res) {
        setSelectedData(res);
      }
    } catch (err) {
      if (!err) return;
      console.error(err);
    }
  };

  const resetFormWithData = (data: ISubscriptionType) => {
    if (!data) return;
    reset({
      ...data,
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      durationInMonths: data.durationInMonths,
    });
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedData) {
      resetFormWithData(selectedData);
    }
  }, [selectedData]);

  const handleDataSubmission = async (payload: ISubscriptionType) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateMutation({ _id: id, ...payload }).unwrap()
        : await createNewMutation(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Subscription type updated successfully."
            : "Subscription type created successfully.",
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

    // const isUpdate = id ? true : false;

    const requiredFields = [
      { field: data.name, message: "Name is required." },
      {
        field: data.durationInMonths,
        message: "Duration in month(s) is required.",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Info", message, type: "info", duration: 1000 });
        return;
      }
    }

    const payload: ISubscriptionType = cleanPayload({
      name: data.name,
      description: data.description,
      durationInMonths: Number(data.durationInMonths),
      isActive: id ? data.isActive : undefined,
    });

    // console.log(payload);
    handleDataSubmission(payload);
  };

  const summarySections: ISummarySection[] = [
    {
      title: "Information",
      icon: <CalendarCheck2 className="w-4 h-4" />,
      data: [
        { label: "Name", value: values?.name, required: true },
        {
          label: "Duration in months",
          value: values?.durationInMonths,
          required: true,
        },
        { label: "Description", value: values?.description },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div>
      <MutationFormTemplate<ISubscriptionTypeFields>
        form={form}
        pageSummary={{
          title: id
            ? "Update Subscription Type"
            : "Create New Subscription Type",
          description: `Enter all the details of the subscription type you want to ${
            id ? "update" : "create"
          }.`,
          icon: CalendarCheck2,
        }}
        formContent={
          <SubscriptionTypesFormContent
            isUpdate={!!id}
            form={form}
            isLoading={isLoading}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update Subscription Type - ${selectedData?.name ?? ""} `
            : "Add Subscription Type"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Subscription Type Details Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Subscription Type",
        }}
      />
    </div>
  );
};

export default SubscriptionTypesForm;
