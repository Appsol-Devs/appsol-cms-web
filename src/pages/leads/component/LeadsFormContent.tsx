import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { DatePicker } from "@/components/DatePicker";
import { Separator } from "@/components/ui/separator";
import { Headset, Home, Lock, StepForward } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";
import type { ILeadFields } from "./LeadsForm";
import {
  useLazyGetLeadNextStepsQuery,
  useLazyGetSoftwaresQuery,
} from "@/pages/settings/common/settingsApi";
import type { DropDownOption } from "@/components/DropdownComponent";
import type { ISoftware } from "@/pages/settings/common/settings";
import { lookup_params } from "@/lib/api";
import DropDownComponent from "@/components/DropdownComponent";
import { useGenerateDropdownOptionsFromEnum } from "@/lib/helpers";
import { useEffect, useState } from "react";
import {
  LEAD_PRIORITY_ENUM,
  LEAD_STATUS_ENUM,
} from "@/lib/enums";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<ILeadFields, any, ILeadFields>;
  isUpdate?: boolean;
  isConverted?: boolean;
}

const LeadsFormContent = ({ isLoading, form, isConverted }: IField) => {
  // const isVerified = form.watch("isVerified");
  const [getleadNextStages] = useLazyGetLeadNextStepsQuery();
  const [getSoftwares] = useLazyGetSoftwaresQuery();

  const [leadNextStepOptions, setLeadNextStepOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [softwareOptions, setSoftwareOptions] = useState<
    DropDownOption<string>[]
  >([]);

  const { control, register } = form;

  const leadPriorityOptions =
    useGenerateDropdownOptionsFromEnum(LEAD_PRIORITY_ENUM);

  const leadStatusOptions =
    useGenerateDropdownOptionsFromEnum(LEAD_STATUS_ENUM);

  useEffect(() => {
    getSoftwares(lookup_params)
      .unwrap()
      .then((res) => {
        if (res?.contents) {
          setSoftwareOptions(
            res.contents.map((item: ISoftware) => ({
              label: item.name ?? "",
              value: item._id ?? "",
            }))
          );
        }
      });
  }, []);

  useEffect(() => {
    getleadNextStages(lookup_params)
      .unwrap()
      .then((res) => {
        if (res && res.contents) {
          const options: DropDownOption<string>[] = res.contents.map(
            (item) => ({
              label: item.name ?? "",
              value: item._id ?? "",
            }),
          );
          setLeadNextStepOptions(options);
        }
      });
  }, []);

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Headset className="w-4 h-4" /> Lead Basic Information
              </p>
              <p className="text-xs text-rx-secondary">
                Required Information <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div>
          <div className="grid grid-cols-2 gap-4">
            <CustomInputField<ILeadFields>
              type="text"
              label="Name"
              name="name"
              placeholder="e.g., Acheampong Ana"
              required
              disabled={isLoading}
              register={register}
            />
            <CustomInputField<ILeadFields>
              register={register}
              required
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Please enter a valid email address.",
                },
              }}
              disabled={isLoading}
              type="email"
              name="email"
              label="Email"
              placeholder="e.g., acheampongana@gmail.com"
            />
            <CustomInputField<ILeadFields>
              type="text"
              label="Phone Number"
              name="phone"
              placeholder="e.g., 0240000000"
              required
              disabled={isLoading}
              register={register}
            />
            <CustomInputField<ILeadFields>
              type="text"
              label="Lead Source"
              name="leadSource"
              placeholder="e.g., Website, Social Media, etc"
              required
              disabled={isLoading}
              register={register}
            />
            <DropDownComponent
              control={control}
              name="software"
              title="Software"
              label="Select software"
              options={softwareOptions}
              required
              disabled={isLoading}
            />
          </div>
        </div>
      </CardComponent>
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Home className="w-4 h-4" /> Business Information
              </p>
              <p className="text-xs text-rx-secondary">
                Required Information <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div>
          <div className="grid grid-cols-2 gap-4">
            <CustomInputField<ILeadFields>
              type="text"
              label="Company Name"
              name="companyName"
              placeholder="e.g., Abi's Clothing Shop"
              required
              disabled={isLoading}
              register={register}
            />
            <CustomInputField<ILeadFields>
              type="text"
              label="Location"
              name="location"
              multipleLines
              placeholder="e.g., Accra, Ghana"
              disabled={isLoading}
              register={register}
            />
            <Controller
              control={control}
              name="initialEnquiryDate"
              render={({ field }) => (
                <div className="space-y-1 max-w-[180px]">
                  <p className="text-xs text-onCard font-medium">
                    Initial Enquiry Date <span className="text-destructive ml-0.5">*</span>
                  </p>
                  <DatePicker
                    title=""
                    placeholder="Select date"
                    dateOnly
                    required
                    disabled={isLoading}
                    defaultDate={field.value ? new Date(field.value) : undefined}
                    onChange={(date) =>
                      field.onChange(
                        date ? date.toISOString().split("T")[0] : ""
                      )
                    }
                  />
                </div>
              )}
            />
          </div>
        </div>
      </CardComponent>
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <StepForward className="w-4 h-4" /> Negotiation Step
              </p>
              <p className="text-xs text-rx-secondary">
                Required Information <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div>
          <div className="grid grid-cols-2 gap-4">
            <DropDownComponent
              control={control}
              name="leadStage"
              title="Current stage"
              label="Select the current negotiation stage"
              options={leadNextStepOptions}
              disabled={isLoading}
            />
            <DropDownComponent
              control={control}
              name="nextStep"
              title="Next Step"
              label="Select the lead next step"
              options={leadNextStepOptions}
              required
              disabled={isLoading}
            />
            <CustomInputField<ILeadFields>
              type="text"
              label="Notes"
              name="notes"
              multipleLines
              placeholder="Any notes go here"
              disabled={isLoading}
              register={register}
            />
          </div>
        </div>
      </CardComponent>
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Lock className="w-4 h-4" /> Status
              </p>
              <p className="text-xs text-rx-secondary">
                Required Information <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div>
          <div className="grid grid-cols-2 gap-4">
            <DropDownComponent
              control={control}
              name="priority"
              title="Lead Priority"
              label="Select the lead priority"
              options={leadPriorityOptions}
              required
              disabled={isLoading}
            />
            <DropDownComponent
              control={control}
              name="leadStatus"
              title="Lead Status"
              label="Select the lead status"
              options={leadStatusOptions}
              required
              disabled={isLoading || isConverted}
            />
          </div>
        </div>
      </CardComponent>
    </div>
  );
};

export default LeadsFormContent;
