import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/DatePicker";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Ticket, ClipboardList } from "lucide-react";
import type { ITicketFormFields } from "../common/tickets";
import DropDownComponent from "@/components/DropdownComponent";
import AsyncDropDownComponent from "@/components/AsyncDropDownComponent";
import { useGenerateDropdownOptionsFromEnum } from "@/lib/helpers";
import { TICKET_PRIORITY_ENUM } from "@/lib/enums";
import { useCallback, useEffect, useState } from "react";
import { lookup_params } from "@/lib/api";
import type { DropDownOption } from "@/components/DropdownComponent";
import type { IComplaint } from "@/pages/complaint/common/complaints";
import type { IUser } from "@/pages/customer/common/customers";
import { useLazyGetComplaintsQuery } from "@/pages/complaint/common/complaintsApi";
import type { ReactNode } from "react";
import { useLazyGetUsersQuery } from "@/pages/users/common/usersApi";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<ITicketFormFields, object, ITicketFormFields>;
  prefillComplaintId?: string;
  prefillComplaint?: IComplaint | null;
  isStatusDisabled?: boolean;
  isAssignedEngineerDisabled?: boolean;
}

const TicketFormContent = ({
  isLoading,
  form,
  prefillComplaintId,
  prefillComplaint,
  isStatusDisabled,
  isAssignedEngineerDisabled,
}: IField) => {
  const { control, register } = form;

  const [getComplaints] = useLazyGetComplaintsQuery();
  const [getUsers] = useLazyGetUsersQuery();
  const [engineerOptions, setEngineerOptions] = useState<
    DropDownOption<string>[]
  >([]);

  const priorityOptions =
    useGenerateDropdownOptionsFromEnum(TICKET_PRIORITY_ENUM);
  const statusOptions = [
    { label: "open", value: "open" },
    { label: "fixed", value: "fixed" },
    { label: "assigned", value: "assigned" },
    { label: "rejected", value: "rejected" },
  ];

  const loadComplaintOptions = useCallback(
    async (inputValue: string): Promise<DropDownOption<IComplaint>[]> => {
      const res = await getComplaints({
        ...lookup_params,
        search: inputValue || undefined,
      }).unwrap();
      if (!res?.contents) return [];
      return (res.contents as IComplaint[]).map((item) => ({
        label: `${item.complaintCode ?? "—"} - ${item.customer?.name ?? "Unknown"}`,
        value: item,
      }));
    },
    [getComplaints],
  );

  const formatComplaintOptionLabel = (complaint: IComplaint): ReactNode => (
    <p className="font-semibold text-xs">
      {complaint.complaintCode ?? "—"} — {complaint.customer?.name ?? "Unknown"}
    </p>
  );

  useEffect(() => {
    getUsers(lookup_params)
      .unwrap()
      .then((res) => {
        if (!res?.contents) return;
        setEngineerOptions(
          (res.contents as IUser[]).map((item) => ({
            label: `${item.firstName ?? ""} ${item.lastName ?? ""} (${
              item.email ?? ""
            })`.trim(),
            value: item.id ?? "",
          })),
        );
      })
      .catch(() => {
        // ignore preload errors; dropdown will just be empty
      });
  }, [getUsers]);

  return (
    <div className="space-y-2">
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Ticket Information
              </p>
              <p className="text-xs text-rx-secondary">
                Required <span className="text-red-500">*</span>
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInputField<ITicketFormFields>
            type="text"
            label="Title"
            name="title"
            placeholder="e.g. PC Booting Issue"
            required
            disabled={isLoading}
            register={register}
          />
          <Controller
            control={control}
            name="requestedDate"
            render={({ field }) => (
              <div className="space-y-1 max-w-[280px]">
                <p className="text-xs text-onCard font-medium">
                  Requested Date & Time{" "}
                  <span className="text-destructive ml-0.5">*</span>
                </p>
                <DatePicker
                  title=""
                  placeholder="Select date and time"
                  required
                  disabled={isLoading}
                  defaultDate={field.value ? new Date(field.value) : undefined}
                  onChange={(date) =>
                    field.onChange(date ? date.toISOString() : "")
                  }
                />
              </div>
            )}
          />
          <AsyncDropDownComponent<IComplaint>
            control={control}
            name="complaintId"
            placeholder="Search complaints..."
            label="Complaint"
            required
            disabled={isLoading || !!prefillComplaintId}
            options={loadComplaintOptions}
            formatOptionLabel={(option) =>
              formatComplaintOptionLabel(option.value)
            }
            width="100%"
          />
          {prefillComplaintId && prefillComplaint && (
            <div className="text-xs text-muted-foreground col-span-2">
              Creating ticket from complaint: {prefillComplaint.complaintCode} —{" "}
              {prefillComplaint.customer?.name} — {prefillComplaint.description}
            </div>
          )}
          <DropDownComponent
            control={control}
            name="priority"
            title="Priority"
            label="Select priority"
            options={priorityOptions}
            disabled={isLoading}
          />
          <DropDownComponent
            control={control}
            name="status"
            title="Status"
            label="Select status"
            options={statusOptions}
            disabled={isLoading || isStatusDisabled}
          />
          <DropDownComponent
            control={control}
            name="assignedEngineerId"
            title="Assign Engineer"
            label="Select engineer"
            options={engineerOptions}
            disabled={isLoading || isAssignedEngineerDisabled}
          />
        </div>
      </CardComponent>

      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Notes
              </p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <CustomInputField<ITicketFormFields>
            type="text"
            multipleLines
            label="Notes"
            name="notes"
            placeholder="Additional notes..."
            disabled={isLoading}
            register={register}
          />
        </div>
      </CardComponent>
    </div>
  );
};

export default TicketFormContent;
