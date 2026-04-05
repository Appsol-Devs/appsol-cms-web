import PageTitle from "@/components/PageTitle";
import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import type { ICustomer } from "../../common/customers";
import { useLazyGetACustomerQuery } from "../../common/customersApi";
import TabsNavigationComponent from "@/components/TabsNavigationComponent";
import { allRoutes, customerRoutes } from "@/utils/routes";

const CustomersView = () => {
  const { id } = useParams();

  const [getCustomerDetails] = useLazyGetACustomerQuery();
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

  const navTabs = [
    {
      name: "Overview",
      path: customerRoutes.OVERVIEW,
    },
    {
      name: "Dashboard",
      path: customerRoutes.DASHBOARD,
    },
    {
      name: "Tickets",
      path: customerRoutes.TICKETS,
    },
    {
      name: "Outreach",
      path: customerRoutes.OUTREACHS,
    },
    {
      name: "Complaints",
      path: customerRoutes.COMPLAINTS,
    },
    {
      name: "Payments",
      path: customerRoutes.PAYMENTS,
    },
  ];

  const parentPath = allRoutes.PORTAL + allRoutes.VIEW_CUSTOMER(id as string);

  return (
    <div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <PageTitle
            showBack
            isSmaller
            subtext="Preview details related to the selected customer. including: summary, enquiries, outreach, payments, tickets, etc"
            title={`Customer Details - ${customerDetails?.companyName || ""} - ${customerDetails?.location || ""}`}
          />
        </div>
        <TabsNavigationComponent parentPath={parentPath} navTabs={navTabs} />
        <div className="mb-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomersView;
