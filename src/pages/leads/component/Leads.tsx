import { format } from "date-fns";
import {
  Briefcase,
  Map,
  MapPin,
  NotepadText,
  Phone,
  User,
} from "lucide-react";
import ActionButton from "@/components/ActionButtons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FeatureContentRenderer from "@/components/table/component/FeatureContentRenderer";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { allRoutes } from "@/utils/routes";
import type { ILead } from "../common/leads";
import { useLazyGetLeadsQuery } from "../common/leadsApi";

const Leads = () => {
  const [fetchQuery, fetchState] = useLazyGetLeadsQuery();
  const [executed, setExecuted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (executed) {
      setTimeout(() => setExecuted(false), 2000);
    }
  }, [executed]);
  const columns = useMemo<ColumnDef<ILead>[]>(
    () => [
      {
        header: "#",
        accessorKey: "index",
        cell: ({ row }) => row.index + 1,
      },
      {
        header: "Lead",
        accessorKey: "name",
        meta: { icon: <User size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold text-xs">
              {row.original?.name || ""}
            </span>
            <span className="font-semibold text-muted-foreground text-xs">
              {row.original?.createdAt
                ? format(row.original.createdAt, "do MMM y hh:mm aa")
                : ""}
            </span>
          </div>
        ),
      },
      {
        header: "Business Name",
        accessorKey: "companyName",
        meta: { icon: <Briefcase size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <p className="font-semibold p-0.5 text-xs">
              <Badge className="rounded-sm!">
                {row.original?.companyName ?? ""}
              </Badge>
            </p>
            <p>{}</p>
          </div>
        ),
      },
      {
        header: "Lead Source",
        accessorKey: "source",
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 text-xs">
              {row.original.leadSource ?? ""}
            </span>
          </div>
        ),
      },
      {
        header: "Location",
        accessorKey: "location",
        meta: { icon: <MapPin size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <p className="font-semibold p-0.5 text-xs flex items-center">
              <Map className="h-3" /> <span>{row.original.location ?? ""}</span>
            </p>
            <p className="font-semibold p-0.5 text-xs flex items-center">
              <Phone className="h-3" /> <span>{row.original.phone ?? ""}</span>
            </p>
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 capitalize text-xs">
              <Badge>{row.original.leadStatus ?? ""}</Badge>
            </span>
          </div>
        ),
      },
      {
        header: "Priority",
        accessorKey: "status",
        meta: { icon: <NotepadText size={14} /> },
        cell: ({ row }) => (
          <div className=" flex flex-col items-start gap-1">
            <span className="font-semibold p-0.5 capitalize text-xs">
              <Badge variant={"outline"}>{row.original.priority ?? ""}</Badge>
            </span>
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
            useText="Add Lead"
            onClick={() => navigate(allRoutes.PORTAL + allRoutes.ADD_LEAD)}
          />
        )}
        pathOnRowSelected={(row) =>
          navigate(allRoutes.PORTAL + allRoutes.VIEW_LEAD(row._id as string))
        }
        columns={columns}
        // filters={["company", "location", "role", "gender"]}
        refetchData={executed}
        title="Leads"
        lazyFetchQuery={[fetchQuery, fetchState]}
      />
    </>
  );
};

export default Leads;
