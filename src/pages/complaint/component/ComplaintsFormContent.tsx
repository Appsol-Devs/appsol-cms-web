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
import { useEffect, useState } from "react";
import type { DropDownOption } from "@/components/DropdownComponent";
import { lookup_params } from "@/lib/api";
import DropDownComponent from "@/components/DropdownComponent";
import { useGenerateDropdownOptionsFromEnum, useDebouncedSearch } from "@/lib/helpers";
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

  const [getCustomers, { isFetching: customersLoading }] = useLazyGetCustomersQuery();
  const [getComplaintTypes] = useLazyGetComplaintTypesQuery();
  const [getComplaintCategories] = useLazyGetComplaintCategoriesQuery();
  const [getSoftwares, { isFetching: softwareLoading }] = useLazyGetSoftwaresQuery();

  const [customerOptions, setCustomerOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [complaintTypeOptions, setComplaintTypeOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [complaintCategoryOptions, setComplaintCategoryOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [softwareOptions, setSoftwareOptions] = useState<
    DropDownOption<string>[]
  >([]);

  const statusOptions =
    useGenerateDropdownOptionsFromEnum(COMPLAINT_STATUS_ENUM);

  const fetchCustomers = (search?: string) => {
    getCustomers({ ...lookup_params, search })
      .unwrap()
      .then((res) => {
        if (res && res.contents) {
          const options: DropDownOption<string>[] = res.contents.map(
            (item: ICustomer) => ({
              label: item.name ?? "",
              value: item._id ?? "",
            }),
          );
          setCustomerOptions(options);
        }
      });
  };

  const debouncedCustomerSearch = useDebouncedSearch((value) =>
    fetchCustomers(value || undefined)
  );

  const fetchSoftwares = (search?: string) => {
    getSoftwares({ ...lookup_params, search })
      .unwrap()
      .then((res) => {
        if (res?.contents) {
          const options: DropDownOption<string>[] = res.contents.map(
            (item: ISoftware) => ({
              label: item.name ?? "",
              value: item._id ?? "",
            }),
          );
          setSoftwareOptions(options);
        }
      });
  };

  const debouncedSoftwareSearch = useDebouncedSearch((value) =>
    fetchSoftwares(value || undefined)
  );

  useEffect(() => {
    getComplaintTypes(lookup_params)
      .unwrap()
      .then((res) => {
        if (res && res.contents) {
          const options: DropDownOption<string>[] = res.contents.map(
            (item) => ({
              label: item.name ?? "",
              value: item._id ?? "",
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
              value: item._id ?? "",
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
            <DropDownComponent
              control={control}
              name="customerId"
              label="Type to search customers..."
              required
              title="Customer"
              options={customerOptions}
              handleInputChange={debouncedCustomerSearch}
              onMenuOpen={() => fetchCustomers(undefined)}
              isLoading={customersLoading}
              isAsyncSearch
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
              label="Type to search software..."
              options={softwareOptions}
              required
              handleInputChange={debouncedSoftwareSearch}
              onMenuOpen={() => fetchSoftwares(undefined)}
              isLoading={softwareLoading}
              isAsyncSearch
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
