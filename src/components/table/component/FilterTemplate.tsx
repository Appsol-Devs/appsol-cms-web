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
import { BASE_STATUS_ENUM } from "@/lib/enums";
import { useLazyGetLeadStatusesQuery } from "@/pages/settings/common/settingsApi";

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
  "customerId" | "status" | "leadStatusId"
> & {
  customerId?: DropDownOption<ICustomer>;
  status?: DropDownOption<string>;
  leadStatusId?: DropDownOption<string>;
};

const FiltersTemplate = ({
  filters,
  // selectedFilters,
  returnFilters,
  toggleFilter,
  returnOnFilterChange,
  initialQueryFilters,
}: IFiltersTemplate) => {
  // Query Apis

  const [getCustomers] = useLazyGetCustomersQuery();
  const [getLeadStatuses] = useLazyGetLeadStatusesQuery();

  const { getValues, control, reset, watch } = useForm<IFilterFields>();
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

  //   --------------------------------------------------------

  //   Dropdown options from enums
  const baseStatusOptions =
    useGenerateDropdownOptionsFromEnum(BASE_STATUS_ENUM);

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
  }, [toggleFilter]);

  useEffect(() => {
    if (returnOnFilterChange) {
      const subscription = watch((values) => {
        const payload: IFilters = {
          customerId: values.customerId?.value?._id,
          status: values.status?.value,
        };
        returnOnFilterChange(payload);
      });
      return () => subscription.unsubscribe();
    }
  }, [returnOnFilterChange, watch]);

  const handleSubmitFilters = () => {
    const data: IFilterFields = getValues();

    const payload: IFilters = {
      customerId: data.customerId?.value?._id,
      status: data.status?.value,
    };

    if (payload) {
      returnFilters?.(payload);
    }
  };

  const handleResetFilters = () => {
    reset({
      customerId: undefined,
      status: undefined,
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
        <Card className="space-y-2">
          <CardHeader>
            <div className="flex  flex-col md:flex-row space-y-2 md:space-y-0 items-center justify-between">
              <p>Filters</p>
              <div className="flex items-end space-x-1 md:space-x-2">
                {!returnOnFilterChange && (
                  <Button
                    onClick={handleSubmitFilters}
                    className="flex items-center justify-end w-max text-xs! rounded-full bg-primary text-onPrimary"
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
                  options={baseStatusOptions}
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
