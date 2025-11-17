import ActionButton from "@/components/ActionButtons";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { Computer, NotepadText, Pen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ISoftware } from "../../common/settings";
import { useLazyGetSoftwaresQuery } from "../../common/settingsApi";

const Softwares = () => {
  const [fetchQuery, fetchState] = useLazyGetSoftwaresQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<ISoftware>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Name",
        accessorKey: "name",
        meta: { icon: <Computer size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.name || ""}
            </span>
            <Badge>
              {row.original?.softwareCode ? row.original.softwareCode : ""}
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
                    allRoutes.UPDATE_SOFTWARE(row.original._id as string)
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
            onClick={() => navigate(allRoutes.PORTAL + allRoutes.ADD_SOFTWARE)}
          />
        )}
        columns={columns}
        // isSetting
        // filters={["company", "location", "role", "gender"]}
        refetchData={executed}
        title="Softwares"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default Softwares;
