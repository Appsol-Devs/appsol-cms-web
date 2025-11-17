import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { File, NotepadText, Pen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ILeadStatus } from "../../common/settings";
import { useLazyGetLeadStatusesQuery } from "../../common/settingsApi";
import ActionButton from "@/components/ActionButtons";

const LeadStatuses = () => {
  const [fetchQuery, fetchState] = useLazyGetLeadStatusesQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<ILeadStatus>[]>(
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
              {row.original?.leadStatusCode ? row.original.leadStatusCode : ""}
            </Badge>
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
                    allRoutes.UPDATE_LEAD_STATUS(row.original._id as string)
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
              navigate(allRoutes.PORTAL + allRoutes.ADD_LEAD_STATUS)
            }
          />
        )}
        columns={columns}
        // isSetting
        // filters={["company", "location", "role", "gender"]}
        refetchData={executed}
        title="Lead Statuses"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default LeadStatuses;
