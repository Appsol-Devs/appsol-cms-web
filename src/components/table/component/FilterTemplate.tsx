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
import { PAYMENT_STATUS_ENUM } from "@/lib/enums";
import { useLazyGetLeadStatusesQuery } from "@/pages/settings/common/settingsApi";
import { useLazyGetUsersQuery } from "@/pages/users/common/usersApi";
import CustomInputField from "@/components/CustomInputField";

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
  "customerId" | "status" | "leadStatusId" | "targetEntityType" | "loggedBy"
> & {
  customerId?: DropDownOption<ICustomer>;
  status?: DropDownOption<string>;
  leadStatusId?: DropDownOption<string>;
  targetEntityType?: DropDownOption<string>;
  loggedBy?: DropDownOption<string>;
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

  const { getValues, control, reset, watch, register } = useForm<IFilterFields>();
  //   const [dateFilters, setDateFilters] = useState<{
  //     from_date: string | undefined;
  //     to_date: string | undefined;
  //   }>({
  //     from_date: "",
  //     to_date: "",
  //   });
  const queryParams = { paginate: false, filters: initialQueryFilters };

  const checkIfHasString = (filter: IFilterArray) => filters.includes(filter);

  // Dropdown Options from query (Dropdown component)
  const [leadStatusOptions, setLeadStatusOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [loggedByOptions, setLoggedByOptions] = useState<
    DropDownOption<string>[]
  >([]);

  //   --------------------------------------------------------

  //   Dropdown options from enums
  const statusOptions =
    useGenerateDropdownOptionsFromEnum(PAYMENT_STATUS_ENUM);
  const targetEntityTypeOptions: DropDownOption<string>[] = [
    { label: "CustomerSetup", value: "CustomerSetup" },
    { label: "Generic", value: "Generic" },
    { label: "Ticket", value: "Ticket" },
    { label: "CustomerOutreach", value: "CustomerOutreach" },
    { label: "CustomerComplaint", value: "CustomerComplaint" },
    { label: "SubscriptionReminder", value: "SubscriptionReminder" },
  ];

  // -------------------------------------------------------

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
  }, [toggleFilter]);

  useEffect(() => {
    if (returnOnFilterChange) {
      const subscription = watch((values) => {
        const payload: IFilters = {
          startDate: selectedFilters?.startDate,
          endDate: selectedFilters?.endDate,
          customerId: values.customerId?.value?._id,
          status: values.status?.value,
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

    const payload: IFilters = {
      startDate: selectedFilters?.startDate,
      endDate: selectedFilters?.endDate,
      customerId: data.customerId?.value?._id,
      status: data.status?.value,
      targetEntityType: data.targetEntityType?.value,
      targetEntityId: data.targetEntityId,
      loggedBy: data.loggedBy?.value,
    };

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
