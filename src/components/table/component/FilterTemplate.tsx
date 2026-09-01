import { Check, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DropDownComponent, {
  type DropDownOption,
} from "@/components/DropdownComponent";
import { Button } from "@/components/ui/button";
import AsyncDropDownComponent from "@/components/AsyncDropDownComponent";
import {
  filterFieldToValue,
  useGenerateDropdownOptionsFromEnum,
} from "@/lib/helpers";
import type { IFilterArray, IFilters } from "@/lib/pagination";
import type { ICustomer } from "@/pages/customer/common/customers";
import { useLazyGetCustomersQuery } from "@/pages/customer/common/customersApi";
import {
  COMPLAINT_STATUS_ENUM,
  CUSTOMER_OUTREACH_STATUS,
  CUSTOMER_SETUP_STATUS_ENUM,
  PAYMENT_STATUS_ENUM,
  REQUEST_FEATURE_PRIORITY_ENUM,
  REQUEST_FEATURE_STATUS_ENUM,
  TICKET_PRIORITY_ENUM,
  TICKET_STATUS_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "@/lib/enums";
import type { TSubscriptionReminderType } from "@/pages/subscription-reminders/common/subscription-reminder";
import { SUBSCRIPTION_REMINDER_TYPE_LABELS } from "@/pages/subscription-reminders/common/subscription-reminder";
import { useLazyGetOutReachTypesQuery } from "@/pages/outreach/common/OutReachApi";
import {
  useLazyGetCallStatusesQuery,
  useLazyGetComplaintCategoriesQuery,
  useLazyGetComplaintTypesQuery,
  useLazyGetLeadStatusesQuery,
  useLazyGetSetupStatusesQuery,
  useLazyGetSoftwaresQuery,
  useLazyGetSubscriptionTypesQuery,
} from "@/pages/settings/common/settingsApi";
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
  | "customerId"
  | "status"
  | "leadStatusId"
  | "targetEntityType"
  | "loggedBy"
  | "priority"
  | "featureStatus"
  | "softwareId"
  | "assignedTo"
  | "featurePriority"
  | "reminderType"
  | "setUpStatusId"
  | "isSent"
  | "CustomerSetupStatus"
  | "ticketStatus"
  | "ticketPriority"
  | "assignedEngineerId"
  | "subscriptionTypeId"
  | "complaintTypeId"
  | "complaintCategoryId"
  | "relatedSoftwareId"
  | "outreachTypeId"
  | "callStatusId"
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
  reminderType?: DropDownOption<string>;
  isSent?: DropDownOption<string>;
  setUpStatusId?: DropDownOption<string>;
  CustomerSetupStatus?: DropDownOption<string>;
  ticketStatus?: DropDownOption<string>;
  ticketPriority?: DropDownOption<string>;
  assignedEngineerId?: DropDownOption<string>;
  subscriptionStatus?: DropDownOption<string>;
  subscriptionTypeId?: DropDownOption<string>;
  complaintStatus?: DropDownOption<string>;
  complaintTypeId?: DropDownOption<string>;
  complaintCategoryId?: DropDownOption<string>;
  relatedSoftwareId?: DropDownOption<string>;
  outreachStatus?: DropDownOption<string>;
  outreachTypeId?: DropDownOption<string>;
  callStatusId?: DropDownOption<string>;
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
  const [getSoftwares] = useLazyGetSoftwaresQuery();
  const [getUsers] = useLazyGetUsersQuery();
  const [getSetupStatus] = useLazyGetSetupStatusesQuery();
  const [getSubscriptionTypes] = useLazyGetSubscriptionTypesQuery();
  const [getComplaintTypes] = useLazyGetComplaintTypesQuery();
  const [getComplaintCategories] = useLazyGetComplaintCategoriesQuery();
  const [getOutreachTypes] = useLazyGetOutReachTypesQuery();
  const [getCallStatuses] = useLazyGetCallStatusesQuery();
  const { getValues, control, reset, watch, register } =
    useForm<IFilterFields>();

  const queryParams = useMemo(
    () => ({ paginate: false, filters: initialQueryFilters }),
    [initialQueryFilters],
  );

  const checkIfHasString = useCallback(
    (filter: IFilterArray) => filters.includes(filter),
    [filters],
  );

  // Dropdown Options from query (Dropdown component)
  const [engineOptions, setEngineOptions] = useState<DropDownOption<string>[]>(
    [],
  );
  const [leadStatusOptions, setLeadStatusOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [loggedByOptions, setLoggedByOptions] = useState<
    DropDownOption<string>[]
  >([]);

  const [softwareOptions, setSoftwareOptions] = useState<
    DropDownOption<string>[]
  >([]);

  const [setUpStatusOptions, setSetUpStatusOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [subscriptionTypeOptions, setSubscriptionTypeOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [complaintTypeOptions, setComplaintTypeOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [complaintCategoryOptions, setComplaintCategoryOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [outreachTypeOptions, setOutreachTypeOptions] = useState<
    DropDownOption<string>[]
  >([]);
  const [callStatusOptions, setCallStatusOptions] = useState<
    DropDownOption<string>[]
  >([]);

  //   --------------------------------------------------------

  //   Dropdown options from enums
  const statusOptions = useGenerateDropdownOptionsFromEnum(PAYMENT_STATUS_ENUM);
  const targetEntityTypeOptions: DropDownOption<string>[] = [
    { label: "CustomerSetup", value: "CustomerSetup" },
    { label: "Generic", value: "Generic" },
    { label: "Ticket", value: "Ticket" },
    { label: "CustomerOutreach", value: "CustomerOutreach" },
    { label: "CustomerComplaint", value: "CustomerComplaint" },
    { label: "SubscriptionReminder", value: "SubscriptionReminder" },
  ];
  const featureStatusOptions = useGenerateDropdownOptionsFromEnum(
    REQUEST_FEATURE_STATUS_ENUM,
  );
  // -------------------------------------------------------
  const featurePriorityOptions = useGenerateDropdownOptionsFromEnum(
    REQUEST_FEATURE_PRIORITY_ENUM,
  );

  const customerSetUpStatusOptions = useGenerateDropdownOptionsFromEnum(
    CUSTOMER_SETUP_STATUS_ENUM,
  );
  const ticketStatusOptions: DropDownOption<string>[] = TICKET_STATUS_OPTIONS;
  const ticketPriorityOptions =
    useGenerateDropdownOptionsFromEnum(TICKET_PRIORITY_ENUM);
  const subscriptionStatusOptions: DropDownOption<string>[] =
    SUBSCRIPTION_STATUS_OPTIONS;
  const complaintStatusOptions = useGenerateDropdownOptionsFromEnum(
    COMPLAINT_STATUS_ENUM,
  );
  const outreachStatusOptions = useGenerateDropdownOptionsFromEnum(
    CUSTOMER_OUTREACH_STATUS,
  );

  const reminderTypeOptions: DropDownOption<string>[] = (
    Object.entries(SUBSCRIPTION_REMINDER_TYPE_LABELS) as [
      TSubscriptionReminderType,
      string,
    ][]
  ).map(([value, label]) => ({ label, value }));

  const isSentOptions: DropDownOption<string>[] = [
    { label: "Sent", value: "true" },
    { label: "Not sent", value: "false" },
  ];
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
                  value: data?.id as string,
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
                const name =
                  `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
                return {
                  label: name || user.email || "User",
                  value: user.id as string,
                } as DropDownOption<string>;
              }),
            );
          }
        });
    }
    if (
      checkIfHasString("softwareId") ||
      checkIfHasString("relatedSoftwareId")
    ) {
      getSoftwares(queryParams)
        .unwrap()
        .then((res) => {
          if (res) {
            setSoftwareOptions(() =>
              res.contents.map((data) => {
                const payload: DropDownOption<string> = {
                  label: data.name,
                  value: data?.id as string,
                };
                return payload;
              }),
            );
          }
        });
    }

    const loadEngineerOptions = () => {
      getUsers({ pageIndex: 1, pageSize: 10 })
        .unwrap()
        .then((res) => {
          if (res) {
            setEngineOptions(() =>
              res.contents.map((data) => {
                const name =
                  `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
                const payload: DropDownOption<string> = {
                  label: name || data.email || "User",
                  value: data?.id as string,
                };
                return payload;
              }),
            );
          }
        });
    };

    if (
      checkIfHasString("assignedTo") ||
      checkIfHasString("assignedEngineerId")
    ) {
      loadEngineerOptions();
    }
    if (checkIfHasString("setUpStatusId")) {
      getSetupStatus(queryParams)
        .unwrap()
        .then((res) => {
          if (res) {
            setSetUpStatusOptions(() =>
              res.contents.map((data) => {
                const payload: DropDownOption<string> = {
                  label: data.name,
                  value: data?.id as string,
                };
                return payload;
              }),
            );
          }
        });
    }

    if (checkIfHasString("subscriptionTypeId")) {
      getSubscriptionTypes(queryParams)
        .unwrap()
        .then((res) => {
          if (res?.contents) {
            setSubscriptionTypeOptions(
              res.contents.map((data) => ({
                label: data.name ?? "",
                value: data.id as string,
              })),
            );
          }
        });
    }

    if (checkIfHasString("complaintTypeId")) {
      getComplaintTypes(queryParams)
        .unwrap()
        .then((res) => {
          if (res?.contents) {
            setComplaintTypeOptions(
              res.contents.map((data) => ({
                label: data.name ?? "",
                value: data.id as string,
              })),
            );
          }
        });
    }

    if (checkIfHasString("complaintCategoryId")) {
      getComplaintCategories(queryParams)
        .unwrap()
        .then((res) => {
          if (res?.contents) {
            setComplaintCategoryOptions(
              res.contents.map((data) => ({
                label: data.name ?? "",
                value: data.id as string,
              })),
            );
          }
        });
    }

    if (checkIfHasString("outreachTypeId")) {
      getOutreachTypes(queryParams)
        .unwrap()
        .then((res) => {
          if (res?.contents) {
            setOutreachTypeOptions(
              res.contents.map((data) => ({
                label: data.name ?? "",
                value: data.id as string,
              })),
            );
          }
        });
    }

    if (checkIfHasString("callStatusId")) {
      getCallStatuses(queryParams)
        .unwrap()
        .then((res) => {
          if (res?.contents) {
            setCallStatusOptions(
              res.contents.map((data) => ({
                label: data.name ?? "",
                value: data.id as string,
              })),
            );
          }
        });
    }
  }, [
    toggleFilter,
    checkIfHasString,
    queryParams,
    getLeadStatuses,
    getUsers,
    getSoftwares,
    getSetupStatus,
    getSubscriptionTypes,
    getComplaintTypes,
    getComplaintCategories,
    getOutreachTypes,
    getCallStatuses,
  ]);

  useEffect(() => {
    if (returnOnFilterChange) {
      const subscription = watch((values) => {
        const reminderTypeVal = filterFieldToValue(values.reminderType);
        const payload: IFilters = {
          startDate: selectedFilters?.startDate,
          endDate: selectedFilters?.endDate,
          customerId: filterFieldToValue(values.customerId),
          status:
            filterFieldToValue(values.outreachStatus) ||
            filterFieldToValue(values.complaintStatus) ||
            filterFieldToValue(values.subscriptionStatus) ||
            filterFieldToValue(values.ticketStatus) ||
            filterFieldToValue(values.status) ||
            filterFieldToValue(values.featureStatus) ||
            filterFieldToValue(values.CustomerSetupStatus),
          subscriptionTypeId: filterFieldToValue(values.subscriptionTypeId),
          complaintTypeId: filterFieldToValue(values.complaintTypeId),
          complaintCategoryId: filterFieldToValue(values.complaintCategoryId),
          relatedSoftwareId: filterFieldToValue(values.relatedSoftwareId),
          outreachTypeId: filterFieldToValue(values.outreachTypeId),
          callStatusId: filterFieldToValue(values.callStatusId),
          priority:
            filterFieldToValue(values.ticketPriority) ||
            filterFieldToValue(values.featurePriority) ||
            filterFieldToValue(values.priority),
          assignedEngineerId: filterFieldToValue(values.assignedEngineerId),
          softwareId: filterFieldToValue(values.softwareId),
          assignedTo: filterFieldToValue(values.assignedTo),
          targetEntityType: filterFieldToValue(values.targetEntityType),
          targetEntityId: values.targetEntityId,
          loggedBy: filterFieldToValue(values.loggedBy),
          leadStatusId: filterFieldToValue(values.leadStatusId),
          reminderType: reminderTypeVal,
          isSent: filterFieldToValue(values.isSent),
          setUpStatusId: filterFieldToValue(values.setUpStatusId),
        };
        returnOnFilterChange(payload);
      });
      return () => subscription.unsubscribe();
    }
  }, [returnOnFilterChange, watch, selectedFilters]);

  const handleSubmitFilters = () => {
    const data: IFilterFields = getValues();

    const reminderTypeVal = filterFieldToValue(data.reminderType);

    const payload: IFilters = {
      startDate: selectedFilters?.startDate,
      endDate: selectedFilters?.endDate,
      customerId: filterFieldToValue(data.customerId),
      status:
        filterFieldToValue(data.outreachStatus) ||
        filterFieldToValue(data.complaintStatus) ||
        filterFieldToValue(data.subscriptionStatus) ||
        filterFieldToValue(data.ticketStatus) ||
        filterFieldToValue(data.status) ||
        filterFieldToValue(data.featureStatus) ||
        filterFieldToValue(data.CustomerSetupStatus),
      subscriptionTypeId: filterFieldToValue(data.subscriptionTypeId),
      complaintTypeId: filterFieldToValue(data.complaintTypeId),
      complaintCategoryId: filterFieldToValue(data.complaintCategoryId),
      relatedSoftwareId: filterFieldToValue(data.relatedSoftwareId),
      outreachTypeId: filterFieldToValue(data.outreachTypeId),
      callStatusId: filterFieldToValue(data.callStatusId),
      priority:
        filterFieldToValue(data.ticketPriority) ||
        filterFieldToValue(data.featurePriority) ||
        filterFieldToValue(data.priority),
      assignedEngineerId: filterFieldToValue(data.assignedEngineerId),
      softwareId: filterFieldToValue(data.softwareId),
      assignedTo: filterFieldToValue(data.assignedTo),
      targetEntityType: filterFieldToValue(data.targetEntityType),
      targetEntityId: data.targetEntityId,
      loggedBy: filterFieldToValue(data.loggedBy),
      leadStatusId: filterFieldToValue(data.leadStatusId),
      reminderType: reminderTypeVal,
      isSent: filterFieldToValue(data.isSent),
      setUpStatusId: filterFieldToValue(data.setUpStatusId),
    };
    returnFilters?.(payload);
  };

  const handleResetFilters = () => {
    reset({
      customerId: undefined,
      status: undefined,
      ticketStatus: undefined,
      ticketPriority: undefined,
      targetEntityType: undefined,
      targetEntityId: undefined,
      loggedBy: undefined,
      reminderType: undefined,
      isSent: undefined,
      assignedEngineerId: undefined,
      subscriptionStatus: undefined,
      subscriptionTypeId: undefined,
      complaintStatus: undefined,
      complaintTypeId: undefined,
      complaintCategoryId: undefined,
      relatedSoftwareId: undefined,
      outreachStatus: undefined,
      outreachTypeId: undefined,
      callStatusId: undefined,
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
              {checkIfHasString("outreachStatus") && (
                <DropDownComponent
                  title="Outreach Status"
                  control={control}
                  options={outreachStatusOptions}
                  name="outreachStatus"
                  label="Select outreach status"
                />
              )}
              {checkIfHasString("complaintStatus") && (
                <DropDownComponent
                  title="Complaint Status"
                  control={control}
                  options={complaintStatusOptions}
                  name="complaintStatus"
                  label="Select complaint status"
                />
              )}
              {checkIfHasString("subscriptionStatus") && (
                <DropDownComponent
                  title="Subscription Status"
                  control={control}
                  options={subscriptionStatusOptions}
                  name="subscriptionStatus"
                  label="Select subscription status"
                />
              )}
              {checkIfHasString("ticketStatus") && (
                <DropDownComponent
                  title="Ticket Status"
                  control={control}
                  options={ticketStatusOptions}
                  name="ticketStatus"
                  label="Select ticket status"
                />
              )}
              {checkIfHasString("ticketPriority") && (
                <DropDownComponent
                  title="Ticket Priority"
                  control={control}
                  options={ticketPriorityOptions}
                  name="ticketPriority"
                  label="Select ticket priority"
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
              {checkIfHasString("subscriptionTypeId") && (
                <DropDownComponent
                  title="Subscription Type"
                  control={control}
                  options={subscriptionTypeOptions}
                  name="subscriptionTypeId"
                  label="Select subscription type"
                />
              )}
              {checkIfHasString("complaintTypeId") && (
                <DropDownComponent
                  title="Complaint Type"
                  control={control}
                  options={complaintTypeOptions}
                  name="complaintTypeId"
                  label="Select complaint type"
                />
              )}
              {checkIfHasString("complaintCategoryId") && (
                <DropDownComponent
                  title="Complaint Category"
                  control={control}
                  options={complaintCategoryOptions}
                  name="complaintCategoryId"
                  label="Select complaint category"
                />
              )}
              {checkIfHasString("relatedSoftwareId") && (
                <DropDownComponent
                  title="Related Software"
                  control={control}
                  options={softwareOptions}
                  name="relatedSoftwareId"
                  label="Select related software"
                />
              )}
              {checkIfHasString("outreachTypeId") && (
                <DropDownComponent
                  title="Outreach Type"
                  control={control}
                  options={outreachTypeOptions}
                  name="outreachTypeId"
                  label="Select outreach type"
                />
              )}
              {checkIfHasString("callStatusId") && (
                <DropDownComponent
                  title="Call Status"
                  control={control}
                  options={callStatusOptions}
                  name="callStatusId"
                  label="Select call status"
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
              {checkIfHasString("assignedEngineerId") && (
                <DropDownComponent
                  title="Assigned Engineer"
                  control={control}
                  options={engineOptions}
                  name="assignedEngineerId"
                  label="Select assigned engineer"
                />
              )}

              {checkIfHasString("reminderType") && (
                <DropDownComponent
                  title="Reminder type"
                  control={control}
                  options={reminderTypeOptions}
                  name="reminderType"
                  label="Select reminder type"
                />
              )}
              {checkIfHasString("isSent") && (
                <DropDownComponent
                  title="Sent status"
                  control={control}
                  options={isSentOptions}
                  name="isSent"
                  label="Sent or not sent"
                />
              )}
              {checkIfHasString("CustomerSetupStatus") && (
                <DropDownComponent
                  title="Customer Setup Status"
                  control={control}
                  options={customerSetUpStatusOptions}
                  name="CustomerSetupStatus"
                  label="Select customer setup status"
                />
              )}
              {checkIfHasString("setUpStatusId") && (
                <DropDownComponent
                  title="Setup Status"
                  control={control}
                  options={setUpStatusOptions}
                  name="setUpStatusId"
                  label="Select setup status"
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
