import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import type { ColumnDef } from "@tanstack/react-table";
import { File, NotepadText, Palette, Pen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IComplaintCategory } from "../../common/settings";
import { useLazyGetComplaintCategoriesQuery } from "../../common/settingsApi";
import ActionButton from "@/components/ActionButtons";

const ComplaintCategories = () => {
  const [fetchQuery, fetchState] = useLazyGetComplaintCategoriesQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);

  const columns = useMemo<ColumnDef<IComplaintCategory>[]>(
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
              {row.original?.complaintCategoryCode
                ? row.original.complaintCategoryCode
                : ""}
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
                    allRoutes.UPDATE_COMPLAINT_CATEGORIES(
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
              navigate(allRoutes.PORTAL + allRoutes.ADD_COMPLAINT_CATEGORIES)
            }
          />
        )}
        columns={columns}
        // isSetting
        // filters={["company", "location", "role", "gender"]}
        refetchData={executed}
        title="Complaint Categories"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default ComplaintCategories;
