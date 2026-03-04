import { formatDateTime } from "@/lib/helpers";
import {
  Briefcase,
  CircleDot,
  Flag,
  Globe,
  Map,
  MapPin,
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
import { getLeadPriorityColor, getLeadStatusColor } from "@/lib/enums";

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
                ? formatDateTime(row.original.createdAt)
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
        meta: { icon: <Globe size={14} /> },
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
        meta: { icon: <CircleDot size={14} /> },
        cell: ({ row }) => {
          const status = row.original.leadStatus ?? "";
          const color = getLeadStatusColor(status);
          return (
            <div className="flex flex-col items-start gap-1">
              <Badge
                variant={color ? undefined : "default"}
                className="capitalize border"
                style={
                  color
                    ? {
                        color,
                        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                        borderColor: color,
                      }
                    : undefined
                }
              >
                {status || "—"}
              </Badge>
            </div>
          );
        },
      },
      {
        header: "Priority",
        accessorKey: "priority",
        meta: { icon: <Flag size={14} /> },
        cell: ({ row }) => {
          const priority = row.original.priority ?? "";
          const color = getLeadPriorityColor(priority);
          return (
            <div className="flex flex-col items-start gap-1">
              <Badge
                variant={color ? undefined : "outline"}
                className="capitalize border"
                style={
                  color
                    ? {
                        color,
                        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                        borderColor: color,
                      }
                    : undefined
                }
              >
                {priority || "—"}
              </Badge>
            </div>
          );
        },
      },
    ],
    [executed],
  );

  return (
    <>
      <FeatureContentRenderer
        useDateFilters
        tableAddComponent={() => (
          <ActionButton
            type="add"
            useText="Add Lead"
            onClick={() => navigate(allRoutes.PORTAL + allRoutes.ADD_LEAD)}
          />
        )}
        pathOnRowSelected={(row) => {
          const lead = row as ILead;
          navigate(allRoutes.PORTAL + allRoutes.VIEW_LEAD(lead._id as string), {
            state: { initialData: lead },
          });
        }}
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
