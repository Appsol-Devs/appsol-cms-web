import CardComponent from "@/components/CardComponent";
import type { ICustomer } from "../../common/customers";
import { useNavigate, useParams } from "react-router-dom";
import { useLazyGetACustomerQuery } from "../../common/customersApi";
import { useEffect, useState } from "react";
import FetchingError from "@/components/FetchingError";
import LoadingComponent from "@/components/LoadingComponent";
import { allRoutes } from "@/utils/routes";
import ActionButton from "@/components/ActionButtons";

const CustomerSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [getCustomerDetails, { isFetching, isLoading, isError, isSuccess }] =
    useLazyGetACustomerQuery();
  const [customerDetails, setCustomerDetails] = useState<ICustomer | null>(
    null,
  );

  const fetchCustomerDetails = async (customerId: string) => {
    const res = await getCustomerDetails(customerId).unwrap();

    if (res) {
      setCustomerDetails(res);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomerDetails(id);
    }
  }, [id]);

  const loading = isFetching || isLoading;

  const handleNavigateToEdit = () => {
    if (!id) return;
    navigate(allRoutes.PORTAL + allRoutes.UPDATE_CUSTOMER(id));
  };

  return (
    <CardComponent
      className="min-h-[50vh] relative"
      headerTitle={
        <div className="flex items-center justify-between w-full">
          <div className="space-y-1">
            <p>Customer Summary</p>
            <p className="text-sm font-normal">
              Preview the details of a customer
            </p>
          </div>
          <ActionButton onClick={handleNavigateToEdit} type="edit" />
        </div>
      }
    >
      <>
        {isFetching || isLoading ? (
          <LoadingComponent loading={loading} />
        ) : isError ? (
          <FetchingError />
        ) : isSuccess && customerDetails ? (
          <div className="grid grid-cols-2 gap-2">
            <SummaryCard
              label="Company Name"
              value={customerDetails.companyName}
            />
            <SummaryCard label="Name" value={customerDetails.name} />
            <SummaryCard label="Email" value={customerDetails.email} />
            <SummaryCard label="Location" value={customerDetails.location} />
            <SummaryCard label="Phone" value={customerDetails.phone} />
            <SummaryCard label="Description" value={customerDetails.notes} />
          </div>
        ) : null}
      </>
    </CardComponent>
  );
};

export default CustomerSummary;

export const SummaryCard = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | undefined;
}) => {
  return (
    <div className="text-base border p-2 rounded-md">
      <p className="font-semibold text-sm">{label}</p>
      <p>{value || "N/A"}</p>
    </div>
  );
};
