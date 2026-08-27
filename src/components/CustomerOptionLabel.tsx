import type { ICustomer } from "@/pages/customer/common/customers";

interface Props {
  customer: ICustomer;
}
const CustomerOptionLabel = ({ customer }: Props) => (
  <div>
    <p className="font-semibold">{customer.companyName}</p>
    <div className="flex items-center justify-between">
      <p className="font-medium">{customer?.name ?? ""}</p>
      <p className="text-[10px] font-semibold  text-white bg-green-600 h-fit px-1 rounded-sm w-fit">
        {customer?.customerCode ?? "N/A"}
      </p>
    </div>
  </div>
);

export default CustomerOptionLabel;
