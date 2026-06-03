import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import PageTitle from "@/components/PageTitle";
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useParams } from "react-router-dom";
import type { ICustomer } from "../../common/customers";
import { useLazyGetACustomerQuery } from "../../common/customersApi";
import { allRoutes, customerRoutes } from "@/utils/routes";

const CustomersView = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [currentRoute, setCurrentRoute] = useState<string>("/");

  const [getCustomerDetails] = useLazyGetACustomerQuery();
  const [customerDetails, setCustomerDetails] = useState<ICustomer | null>(
    null,
  );

  useEffect(() => {
    if (location && location.pathname) {
      setCurrentRoute(location.pathname);
    } else {
      setCurrentRoute("/");
    }
  }, [location]);

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

  const parentPath = useMemo(() => {
    return allRoutes.PORTAL + allRoutes.VIEW_CUSTOMER(id as string);
  }, [id]);

  const customerMenus = useMemo(() => {
    return [
      { label: "Overview", link: `${parentPath}${customerRoutes.OVERVIEW}` },
      // { label: "Dashboard", link: `${parentPath}${customerRoutes.DASHBOARD}` },
      { label: "Tickets", link: `${parentPath}${customerRoutes.TICKETS}` },
      { label: "Outreach", link: `${parentPath}${customerRoutes.OUTREACHS}` },
      {
        label: "Complaints",
        link: `${parentPath}${customerRoutes.COMPLAINTS}`,
      },
      { label: "Payments", link: `${parentPath}${customerRoutes.PAYMENTS}` },
    ];
  }, [parentPath]);

  return (
    <div className="space-y-4">
      <PageTitle
        isSmaller
        subtext="Preview comprehensive operational metrics related to the selected profile file, including history logs, service operations context, outreaches, and financial statements."
        title={`Customer Details — ${customerDetails?.companyName || "Individual Profile"} ${
          customerDetails?.location ? `(${customerDetails.location})` : ""
        }`}
      />

      <div className="flex flex-col space-y-4">
        <ScrollArea className="whitespace-nowrap w-full border-b border-gray-200 dark:border-gray-800">
          <div className="w-full h-max flex items-center space-x-6 pb-0">
            {customerMenus.map((menu, idx) => {
              const isActive = currentRoute.includes(menu.link);
              return (
                <NavLink
                  to={menu.link}
                  key={idx}
                  className={`${
                    isActive
                      ? "border-green-600! text-green-600! font-semibold border-b-2! bg-transparent!"
                      : "border-transparent text-black! hover:border-gray-400 bg-transparent! "
                  } pb-3 pt-1 text-md font-semi-bold transition-colors -mb-[1px] hover:cursor-pointer inline-block`}
                >
                  {menu.label}
                </NavLink>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>

        <div className="relative min-h-[65vh] pt-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomersView;
