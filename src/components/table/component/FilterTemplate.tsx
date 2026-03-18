import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DropDownComponent, {
  type DropDownOption,
} from "@/components/DropdownComponent";
import { Button } from "@/components/ui/button";
import AsyncDropDownComponent from "@/components/AsyncDropDownComponent";
import { useGenerateDropdownOptionsFromEnum } from "@/lib/helpers";
import type { IFilterArray, IFilters } from "@/lib/pagination";
import type { ICustomer } from "@/pages/customer/common/customers";
import { useLazyGetCustomersQuery } from "@/pages/customer/common/customersApi";
import { PAYMENT_STATUS_ENUM, REQUEST_FEATURE_PRIORITY_ENUM, REQUEST_FEATURE_STATUS_ENUM } from "@/lib/enums";
import { useLazyGetLeadStatusesQuery, useLazyGetSoftwaresQuery } from "@/pages/settings/common/settingsApi";
import CustomInputField from "@/components/CustomInputField";
import { useLazyGetUsersQuery } from "@/pages/users/common/usersApi";

interface IFiltersTemplate {
  toggleFilter?: boolean;
  filters: IFilterArray[];
  returnFilters?: (filters: IFilters) => void;
  returnOnFilterChange?: (filters: IFilters) => void;
  selectedFilters?: IFilters;
  initialQueryFilters?: IFilters;
}

type IFilterFields = Omit<
  IFilters,
  "customerId" | "status" | "leadStatusId" | "targetEntityType" | "loggedBy" | "priority" | "featureStatus" | "softwareId" | "assignedTo" | "featurePriority"
> & {
  customerId?: DropDownOption<ICustomer>;
  status?: DropDownOption<string>;
  leadStatusId?: DropDownOption<string>;
  targetEntityType?: DropDownOption<string>;
  loggedBy?: DropDownOption<string>;
  priority?: DropDownOption<string>;
  featureStatus?: DropDownOption<string>;
  softwareId?: DropDownOption<string>;
  assignedTo?: DropDownOption<string>;
  featurePriority?: DropDownOption<string>;
};

const FiltersTemplate = ({
  filters,
  selectedFilters,
  returnFilters,
  toggleFilter,
  returnOnFilterChange,
  initialQueryFilters,
}: IFiltersTemplate) => {
  // Query Apis

  const [getCustomers] = useLazyGetCustomersQuery();
  const [getLeadStatuses] = useLazyGetLeadStatusesQuery();
  const [getUsers] = useLazyGetUsersQuery();
  const [getSoftwares] = useLazyGetSoftwaresQuery();
  const [getUsers] = useLazyGetUsersQuery();

  const { getValues, control, reset, watch, register } = useForm<IFilterFields>();

  const queryParams = { paginate: false, filters: initialQueryFilters };

  const checkIfHasString = (filter: IFilterArray) => filters.includes(filter);

  // Dropdown Options from query (Dropdown component)
  const [engineOptions, setEngineOptions] = useState<DropDownOption<string>[]>([]);
  const [leadStatusOptions, setLeadStatusOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [loggedByOptions, setLoggedByOptions] = useState<
    DropDownOption<string>[]
  >([]);

  const [softwareOptions, setSoftwareOptions] = useState<
    DropDownOption<string>[]
  >([]);

  //   --------------------------------------------------------

  //   Dropdown options from enums
  const statusOptions =
    useGenerateDropdownOptionsFromEnum(PAYMENT_STATUS_ENUM);
  
  const featureStatusOptions =
    useGenerateDropdownOptionsFromEnum(REQUEST_FEATURE_STATUS_ENUM);
  // -------------------------------------------------------
  const featurePriorityOptions =
    useGenerateDropdownOptionsFromEnum(REQUEST_FEATURE_PRIORITY_ENUM);
  // Dropdown options from query (Async dropdown component)
  const fetchCustomers = async (
    query: string,
  ): Promise<DropDownOption<ICustomer>[]> => {
    const res = await getCustomers({
      search: query,
      pageIndex: 1,
      pageSize: 10,
    });
    if (res && res.data) {
      return res.data.contents.map((data) => {
        return {
          label: (
            <span>
              <p>{`${data.name || ""} ${data.companyName ? " - " + data.companyName : ""}`}</p>
            </span>
          ),
          value: data,
        } as DropDownOption<ICustomer>;
      });
    } else {
      const error = res.error as any;
      return Promise.reject(error.data.message);
    }
  };

  useEffect(() => {
    if (!toggleFilter) return;

    if (checkIfHasString("leadStatusId")) {
      getLeadStatuses(queryParams)
        .unwrap()
        .then((res) => {
          if (res) {
            setLeadStatusOptions(() =>
              res.contents.map((data) => {
                const payload: DropDownOption<string> = {
                  label: data.name,
                  value: data?._id as string,
                };
                return payload;
              }),
            );
          }
        });
    }

    if (checkIfHasString("loggedBy")) {
      getUsers(queryParams)
        .unwrap()
        .then((res) => {
          if (res && res.contents) {
            setLoggedByOptions(
              res.contents.map((user) => {
                const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
                return {
                  label: name || user.email || "User",
                  value: user._id as string,
                } as DropDownOption<string>;
              }),
            );
          }
        });
    }
    if (checkIfHasString("softwareId")) {
      getSoftwares(queryParams)
        .unwrap()
        .then((res) => {
          if (res) {
            setSoftwareOptions(() =>
              res.contents.map((data) => {
                const payload: DropDownOption<string> = {
                  label: data.name,
                  value: data?._id as string,
                };
                return payload;
              }),
            );
          }
        });
    }

    if (checkIfHasString("assignedTo")) {
      getUsers({ pageIndex: 1, pageSize: 10 })
        .unwrap()
        .then((res) => {
          if (res) {
            setEngineOptions(() =>
              res.contents.map((data) => {
                const payload: DropDownOption<string> = {
                  label: `${data.firstName} ${data.lastName}`,
                  value: data?._id as string,
                };
                return payload;
              }),
            );
          }
        });
    }

  }, [toggleFilter]);

  useEffect(() => {
    if (returnOnFilterChange) {
      const subscription = watch((values) => {
        const payload: IFilters = {
          startDate: selectedFilters?.startDate,
          endDate: selectedFilters?.endDate,
          customerId: values.customerId?.value?._id,
          status: values.status?.value || values.featureStatus?.value,
          priority: values.featurePriority?.value,
          softwareId: values.softwareId?.value,
          assignedTo: values.assignedTo?.value,
          targetEntityType: values.targetEntityType?.value,
          targetEntityId: values.targetEntityId,
          loggedBy: values.loggedBy?.value,
        };
        returnOnFilterChange(payload);
      });
      return () => subscription.unsubscribe();
    }
  }, [returnOnFilterChange, watch, selectedFilters]);

  const handleSubmitFilters = () => {
    const data: IFilterFields = getValues();

    const softwareIdVal = typeof data.softwareId === "string" ? data.softwareId : data.softwareId?.value;
    const assignedToVal = typeof data.assignedTo === "string" ? data.assignedTo : data.assignedTo?.value;
    const featureStatusVal = typeof data.featureStatus === "string" ? data.featureStatus : data.featureStatus?.value;
    
    const payload: IFilters = {
      startDate: selectedFilters?.startDate,
      endDate: selectedFilters?.endDate,
      customerId: data.customerId?.value?._id,
      status: data.status?.value || featureStatusVal,
      priority: typeof data.featurePriority === "string" ? data.featurePriority as unknown as string : data.featurePriority?.value,
      softwareId: softwareIdVal,
      assignedTo: assignedToVal,
      targetEntityType: data.targetEntityType?.value,
      targetEntityId: data.targetEntityId,
      loggedBy: data.loggedBy?.value,
    };
    console.log("payload", payload);
    if (payload) {
      returnFilters?.(payload);
    }
  };

  const handleResetFilters = () => {
    reset({
      customerId: undefined,
      status: undefined,
      targetEntityType: undefined,
      targetEntityId: undefined,
      loggedBy: undefined,
    });
    if (returnOnFilterChange) return;
    handleSubmitFilters();
  };

  //   const handleDateRangeOption = (range: IDateRange) => {
  //     if (range && range.start && range.end) {
  //       setDateFilters({
  //         from_date: range?.start.toISOString() as string,
  //         to_date: range?.end.toISOString() as string,
  //       });
  //     }
  //   };

  return (
    <>
      {toggleFilter ? (
        <Card className="gap-3">
          <CardHeader>
            <div className="flex  flex-col md:flex-row space-y-2 md:space-y-0 items-center justify-between">
              <p>Filters</p>
              <div className="flex items-end space-x-1 md:space-x-2">
                {!returnOnFilterChange && (
                  <Button
                    onClick={handleSubmitFilters}
                    className="flex items-center justify-end w-max text-xs! rounded-full !bg-primary text-onPrimary"
                  >
                    <Check /> Apply Filters
                  </Button>
                )}
                <Button
                  onClick={handleResetFilters}
                  className="flex text-xs! items-center bg-destructive! rounded-full justify-end w-max"
                >
                  <X /> Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {checkIfHasString("customerId") && (
                <AsyncDropDownComponent
                  placeholder={"Select the customer"}
                  label={"Customer"}
                  control={control}
                  name="customerId"
                  options={fetchCustomers}
                  width="100%"
                />
              )}
              {checkIfHasString("loggedBy") && (
                <DropDownComponent
                  title="Logged By"
                  control={control}
                  options={loggedByOptions}
                  name="loggedBy"
                  label="Select user"
                />
              )}
              {checkIfHasString("targetEntityType") && (
                <DropDownComponent
                  title="Target Entity Type"
                  control={control}
                  options={targetEntityTypeOptions}
                  name="targetEntityType"
                  label="Select entity type"
                />
              )}
              {checkIfHasString("targetEntityId") && (
                <div className="pt-4">
                  <CustomInputField<IFilterFields>
                    label="Target Entity ID"
                    placeholder="e.g. 691378a26e2678086c163a96"
                    register={register}
                    name="targetEntityId"
                    type="text"
                  />
                </div>
              )}
              {checkIfHasString("leadStatusId") && (
                <DropDownComponent
                  title="Lead Status"
                  control={control}
                  options={leadStatusOptions}
                  name="leadStatusId"
                  label="Select lead status"
                />
              )}
              {checkIfHasString("status") && (
                <DropDownComponent
                  title="Status"
                  control={control}
                  options={statusOptions}
                  name="status"
                  label="Select status"
                />
              )}
              {checkIfHasString("featureStatus") && (
                <DropDownComponent
                  title="Feature Status"
                  control={control}
                  options={featureStatusOptions}
                  name="featureStatus"
                  label="Select feature status"
                />
              )}
              {checkIfHasString("featurePriority") && (
                <DropDownComponent
                  title="Feature Priority"
                  control={control}
                  options={featurePriorityOptions}
                  name="featurePriority"
                  label="Select feature priority"
                />
              )}

              {checkIfHasString("softwareId") && (
                <DropDownComponent
                  title="Software"
                  control={control}
                  options={softwareOptions}
                  name="softwareId"
                  label="Select software"
                />
              )}

              {checkIfHasString("assignedTo") && (
                <DropDownComponent
                  title="Assigned To"
                  control={control}
                  options={engineOptions}
                  name="assignedTo"
                  label="Select assigned user"
                />
              )}


              {/* {checkIfHasString("date_range") && (
                <div className="pt-4">
                  <DateTimeRangeComponent
                    dateRange={handleDateRangeOption}
                    placeholder={"Select Date Period"}
                  />
                </div>
              )} */}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
};

export default FiltersTemplate;
