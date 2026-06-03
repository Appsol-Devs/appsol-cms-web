import type { ISummarySection } from "@/components/form/MutationFormSummary";
import MutationFormTemplate from "@/components/form/MutationFormTemplate";
import { showToast } from "@/components/ui/CustomToast";
import { cleanPayload, resetMutationForm } from "@/lib/helpers";
import type { DefaultValues } from "react-hook-form";
import { Phone, Notebook, File } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import type { IOutReachType } from "@/pages/customer/common/customers";
import { useAddOutReachTypeMutation, useLazyGetOutReachTypeQuery, useUpdateOutReachTypeMutation } from "../common/OutReachApi";
import OutReachFormContent from "./OutReachFormContent";

export type IOutReachTypeFields = Omit<IOutReachType, "_id" | "isActive"> & {
  isActive?: boolean;
  name?: string;
  description?: string;
};

const OutReachForm = () => {
  const { id } = useParams();

  const [addOutReachType, { isLoading: isCreating }] =
    useAddOutReachTypeMutation();
  const [updateOutReachType, { isLoading: isUpdating }] =
    useUpdateOutReachTypeMutation();
  const [getOutReachType, { isLoading: isGetting }] =
    useLazyGetOutReachTypeQuery();
  const form = useForm<IOutReachTypeFields>();
  const { watch, getValues, reset } = form;
  const values = watch();

  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState<IOutReachType | null>(null);

  const fetchOutReach = async (id: string) => {
    if (!id) return;

    try {
      const res = await getOutReachType(id).unwrap();
      if (res) {
        setSelectedData(res);
      }
    } catch (err) {
      if (!err) return;
      console.error(err);
    }
  };

  const getEmptyValues = (): IOutReachTypeFields => ({
    name: "",
    description: "",
    colorCode: undefined,
    isActive: true,
  });

  const resetFormWithData = (data: IOutReachType) => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      description: data.description ?? "",
      isActive: data.isActive,
      colorCode: data.colorCode,
    });
  };

  const handleResetForm = () => {
    if (id && selectedData) {
      resetFormWithData(selectedData);
      return;
    }
    resetMutationForm<IOutReachTypeFields>(
      form,
      getEmptyValues() as DefaultValues<IOutReachTypeFields>,
    );
  };

  useEffect(() => {
    if (id) {
      fetchOutReach(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedData) {
      resetFormWithData(selectedData);
    }
  }, [selectedData]);

  const handleDataSubmission = async (payload: IOutReachType) => {
    if (!payload) return;
    try {
      const res = id
        ? await updateOutReachType({ _id: id, ...payload }).unwrap()
        : await addOutReachType(payload).unwrap();

      if (res) {
        showToast({
          title: "Success",
          message: id
            ? "Outreach updated successfully."
            : "Outreach created successfully.",
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
      { field: data.name, message: "Name is required." },
      // { field: data.description, message: "Description is required." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field) {
        showToast({ title: "Info", message, type: "info", duration: 1000 });
        return;
      }
    }

    const payload: IOutReachType = cleanPayload({
      ...data,
      name: data.name,
      description: data.description,
      isActive: id ? data.isActive : true,
      colorCode: data.colorCode


    }) as unknown as IOutReachType;

    handleDataSubmission(payload);
  };

  const summarySections: ISummarySection[] = [

    {
      title: "Name",
      icon: <File className="w-4 h-4" />,
      data: [
        { label: "Name", value: values?.name, required: true },
      ],
    },
    {
      title: "OutReach Description",
      icon: <Notebook className="w-4 h-4" />,
      data: [
        { label: "Description", value: values?.description, required: true },
      ],
    },
  ];

  const isLoading = isGetting || isCreating || isUpdating;

  return (
    <div>
      <MutationFormTemplate<IOutReachTypeFields>
        form={form}
        pageSummary={{
          title: id ? "Update Outreach" : "Create New Outreach",
          description: `Enter all the details of the Outreach you want to ${id ? "update" : "create"
            }.`,
          icon: Phone,
        }}
        formContent={
          <OutReachFormContent
            form={form}
            isLoading={isLoading}
            isUpdate={!!id}
          />
        }
        submitData={submitData}
        pageTitle={
          id
            ? `Update OutReach - ${selectedData?.outreachTypeCode ?? ""} `
            : "Add OutReach"
        }
        loading={isLoading}
        mutationFormSummary={{
          summaryData: summarySections,
          summaryMainTitle: "Outreach Summary",
          summarySaveButtonText: id ? "Save Changes" : "Save Outreach",
        }}
        onResetForm={handleResetForm}
      />
    </div>
  );
};

export default OutReachForm;
