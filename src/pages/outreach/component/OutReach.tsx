import ActionButton from "@/components/ActionButtons";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import { allRoutes } from "@/utils/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { NotepadText, File, Pen, Palette } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLazyGetOutReachTypesQuery } from "../common/OutReachApi";
import type { IOutReachType } from "@/pages/customer/common/customers";
import { Badge } from "@/components/ui/badge";

const OutReach = () => {
  const [fetchQuery, fetchState] = useLazyGetOutReachTypesQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<IOutReachType>[]>(
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
            <span className="">
              {row.original?.name ?? "N/A"}
            </span>
            <Badge>{row.original.outreachTypeCode}</Badge>

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
              {row.original.description ?? "-"}
            </span>
          </div>
        ),
      },
      {
        header: "Color",
        accessorKey: "colorCode",
        meta: { icon: <Palette size={14} /> },
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span
              className="inline-block w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: row.original.colorCode || "#e5e7eb" }}
            />
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { icon: <NotepadText size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              {row.original.isActive ? "Active" : "Inactive"}
            </span>
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
              type="view"
              onClick={() =>
                navigate(allRoutes.PORTAL + allRoutes.VIEW_OUTREACH_TYPE(row.original._id as string), {
                  state: { initialData: row.original },
                })
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
            useText="Add Outreach Type"
            onClick={() => navigate(allRoutes.PORTAL + allRoutes.ADD_OUTREACH_TYPE)}
          />
        )}
        columns={columns}
        // filters={["company", "location", "role", "gender"]}
        refetchData={executed}
        title="Outreach Types"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default OutReach;
