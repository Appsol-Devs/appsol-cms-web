import CardComponent from "@/components/CardComponent";
import CustomInputField from "@/components/CustomInputField";
import { Separator } from "@/components/ui/separator";
import { Headset, Notebook, Phone } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { IComplaintFields } from "./ComplaintsForm";
import { useLazyGetCustomersQuery } from "@/pages/customer/common/customersApi";
import {
  useLazyGetComplaintCategoriesQuery,
  useLazyGetComplaintTypesQuery,
  useLazyGetSoftwaresQuery,
} from "@/pages/settings/common/settingsApi";
import { useCallback, useEffect, useState } from "react";
import type { DropDownOption } from "@/components/DropdownComponent";
import { lookup_params } from "@/lib/api";
import DropDownComponent from "@/components/DropdownComponent";
import AsyncDropDownComponent from "@/components/AsyncDropDownComponent";
import { useGenerateDropdownOptionsFromEnum } from "@/lib/helpers";
import { COMPLAINT_STATUS_ENUM } from "@/lib/enums";
import type { ICustomer } from "@/pages/customer/common/customers";
import type { ISoftware } from "@/pages/settings/common/settings";

interface IField {
  isLoading?: boolean;
  form: UseFormReturn<IComplaintFields, any, IComplaintFields>;
  isUpdate?: boolean;
}

const ComplaintsFormContent = ({ isLoading, form }: IField) => {
  const { control, register } = form;

  const [getCustomers] = useLazyGetCustomersQuery();
  const [getComplaintTypes] = useLazyGetComplaintTypesQuery();
  const [getComplaintCategories] = useLazyGetComplaintCategoriesQuery();
  const [getSoftwares] = useLazyGetSoftwaresQuery();

  const [complaintTypeOptions, setComplaintTypeOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [complaintCategoryOptions, setComplaintCategoryOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [softwareOptions, setSoftwareOptions] = useState<
    DropDownOption<string>[]
  >([]);

  const statusOptions = useGenerateDropdownOptionsFromEnum(
    COMPLAINT_STATUS_ENUM,
  );

  const loadCustomerOptions = useCallback(
    async (inputValue: string): Promise<DropDownOption<string>[]> => {
      const res = await getCustomers({
        ...lookup_params,
        search: inputValue || undefined,
      }).unwrap();
      if (!res?.contents) return [];
      return res.contents.map((item: ICustomer) => ({
        label: item.name ?? "",
        value: item.id ?? "",
      }));
    },
    [getCustomers],
  );

  useEffect(() => {
    getSoftwares(lookup_params)
      .unwrap()
      .then((res) => {
        if (res?.contents) {
          setSoftwareOptions(
            res.contents.map((item: ISoftware) => ({
              label: item.name ?? "",
              value: item.id ?? "",
            })),
          );
        }
      });
  }, [getSoftwares]);

  useEffect(() => {
    getComplaintTypes(lookup_params)
      .unwrap()
      .then((res) => {
        if (res && res.contents) {
          const options: DropDownOption<string>[] = res.contents.map(
            (item) => ({
              label: item.name ?? "",
              value: item.id ?? "",
            }),
          );
          setComplaintTypeOptions(options);
        }
      });

    getComplaintCategories(lookup_params)
      .unwrap()
      .then((res) => {
        if (res && res.contents) {
          const options: DropDownOption<string>[] = res.contents.map(
            (item) => ({
              label: item.name ?? "",
              value: item.id ?? "",
            }),
          );
          setComplaintCategoryOptions(options);
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
                <Phone className="w-4 h-4" />
                Customer Information
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
          <div className="grid grid-cols-1 gap-4">
            <AsyncDropDownComponent
              control={control}
              name="customerId"
              placeholder="Type to search customers..."
              label="Customer"
              required
              disabled={isLoading}
              options={loadCustomerOptions}
              width="100%"
            />
          </div>
        </div>
      </CardComponent>
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Headset className="w-4 h-4" />
                Complaint Information
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
              name="complaintTypeId"
              title="Complaint Type"
              label="Select the complaint type"
              options={complaintTypeOptions}
              required
            />
            <DropDownComponent
              control={control}
              name="complaintCategoryId"
              title="Complaint Category"
              label="Select the complaint category"
              options={complaintCategoryOptions}
              required
            />
            <DropDownComponent
              control={control}
              name="relatedSoftwareId"
              title="Related Software"
              label="Select software"
              options={softwareOptions}
              required
              disabled={isLoading}
            />
            <DropDownComponent
              control={control}
              name="status"
              title="Status"
              label="Select the complaint status"
              options={statusOptions}
              required
            />
          </div>
        </div>
      </CardComponent>
      <CardComponent
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2">
                <Notebook className="w-4 h-4" />
                Complaint Description
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
          <div className="grid grid-cols-1 gap-4">
            <CustomInputField<IComplaintFields>
              type="text"
              multipleLines
              label="Description"
              name="description"
              disabled={isLoading}
              register={register}
              required
            />
            {/* {isUpdate && (
              <CheckboxComponent
                control={control}
                name="isActive"
                label="Is Active?"
              />
            )} */}
          </div>
        </div>
      </CardComponent>
    </div>
  );
};

export default ComplaintsFormContent;
