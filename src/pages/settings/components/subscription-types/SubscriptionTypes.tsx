import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { Clock, File, NotepadText, Pen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ISubscriptionType } from "../../common/settings";
import { useLazyGetSubscriptionTypesQuery } from "../../common/settingsApi";
import ActionButton from "@/components/ActionButtons";

const ComplaintCategories = () => {
  const [fetchQuery, fetchState] = useLazyGetSubscriptionTypesQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<ISubscriptionType>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Name",
        accessorKey: "name",
        meta: { icon: <File size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.name || ""}
            </span>
            <Badge>
              {row.original?.subscriptionTypeCode
                ? row.original.subscriptionTypeCode
                : ""}
            </Badge>
          </div>
        ),
      },
      {
        header: "Duration in month(s)",
        accessorKey: "durationInMonths",
        meta: { icon: <Clock size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              {row.original.durationInMonths ?? "-"}
            </span>
          </div>
        ),
      },
      {
        header: "Description",
        accessorKey: "description",
        meta: { icon: <NotepadText size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              {row.original.description ?? ""}
            </span>
          </div>
        ),
      },
      {
        header: "Color",
        accessorKey: "colorCode",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <span
              className="inline-block w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: row.original.colorCode || "#e5e7eb" }}
            />
          </div>
        ),
      },
      {
        header: "Action",
        meta: { icon: <Pen size={14} /> },
        accessorKey: "action",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <ActionButton
              type="edit"
              onClick={() =>
                navigate(
                  allRoutes.PORTAL +
                    allRoutes.UPDATE_SUBSCRIPTION_TYPE(
                      row.original._id as string
                    )
                )
              }
            />
          </div>
        ),
      },
    ],
    [executed]
  );

  return (
    <>
      <FeatureContentRenderer
        tableAddComponent={() => (
          <ActionButton
            type="add"
            onClick={() =>
              navigate(allRoutes.PORTAL + allRoutes.ADD_SUBSCRIPTION_TYPE)
            }
          />
        )}
        columns={columns}
        // isSetting
        // filters={["company", "location", "role", "gender"]}
        refetchData={executed}
        title="Subscription Types"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default ComplaintCategories;
