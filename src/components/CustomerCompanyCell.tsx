import type { ReactNode } from "react";

type CustomerLike =
  | {
      name?: string;
      companyName?: string;
    }
  | string
  | null
  | undefined;

interface CustomerCompanyCellProps {
  customer?: CustomerLike;
  fallback?: string;
  children?: ReactNode;
}

const CustomerCompanyCell = ({
  customer,
  fallback = "N/A",
  children,
}: CustomerCompanyCellProps) => {
  if (typeof customer === "string") {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="font-semibold text-xs">{customer || fallback}</span>
        {children}
      </div>
    );
  }

  const companyName = customer?.companyName?.trim();
  const name = customer?.name?.trim();
  const primary = companyName || name || fallback;

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="font-semibold text-xs">{primary}</span>
      {companyName && name ? (
        <span className="font-semibold text-muted-foreground text-xs">
          {name}
        </span>
      ) : null}
      {children}
    </div>
  );
};

export default CustomerCompanyCell;
