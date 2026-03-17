import ActionButton from "@/components/ActionButtons";
import LoadingComponent from "@/components/LoadingComponent";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import DetailItem from "@/components/ui/DetailItem";
import { formatDate } from "@/lib/helpers";
import {
    AlertCircle,
    Calendar,
    CircleDot,
    FileText,
    Hash,
    Monitor,
    StickyNote,
    Tag,
    User,
    UserCheck,
    Users,
    Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { allRoutes } from "@/utils/routes";
import { Badge } from "@/components/ui/badge";
import { getLookupBadgeStyle } from "@/lib/enums";
import {
    getPriorityColor,
    getStatusColor,
    type IFeatureRequest,
} from "../common/feature-request";
import {
    useLazyGetAFeatureRequestQuery,
    useDeleteFeatureRequestMutation,
} from "../common/featureRequestApi";
import type { IUser } from "@/pages/customer/common/customers";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/CustomToast";

const formatUserFullName = (user: unknown): string => {
    if (typeof user === "string") return user;

    const u = user as IUser;
    if (u.firstName || u.lastName) {
        return `${u.firstName || ""} ${u.lastName || ""}`.trim();
    }
    if ("email" in u && typeof u.email === "string") return u.email;

    return "—";
};

const ViewFeatureRequest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const initialData = (
        location.state as { initialData?: IFeatureRequest } | null
    )?.initialData;

    const [deleteFeatureRequest] = useDeleteFeatureRequestMutation();

    const [getFeatureRequestDetails, { isLoading: isFetching }] =
        useLazyGetAFeatureRequestQuery();

    const [selectedRequest, setSelectedRequest] =
        useState<IFeatureRequest | null>(() =>
            initialData && initialData._id === id ? initialData : null,
        );

    useEffect(() => {
        if (id) {
            getFeatureRequestDetails(id)
                .unwrap()
                .then((res) => {
                    if (res) {
                        setSelectedRequest(res);
                    }
                })
                .catch((err) => console.error("Failed to fetch feature request", err));
        }
    }, [id, getFeatureRequestDetails]);

    const handleDeletion = async (requestId: string) => {
        if (!requestId) return;

        try {
            await deleteFeatureRequest({ id: requestId }).unwrap();
            showToast({
                title: "Success",
                message: "Feature Request deleted successfully.",
                type: "success",
            });
            navigate(-1);
        } catch (error) {
            console.error("Failed to delete feature request", error);
            showToast({
                title: "Error",
                message: "Failed to delete feature request",
                type: "error",
            });
        }
    };

    if (!selectedRequest) {
        if (isFetching) {
            return (
                <div className="relative min-h-[40vh]">
                    <LoadingComponent loading />
                </div>
            );
        }
        return (
            <div className="p-8 text-center text-muted-foreground">
                Feature Request not found.
            </div>
        );
    }

    const customerName =
        typeof selectedRequest.customer === "string"
            ? selectedRequest.customer || "—"
            : (selectedRequest.customer?.name ?? "—");

    const softwareName =
        typeof selectedRequest.software === "string"
            ? selectedRequest.software || "—"
            : (selectedRequest.software?.name ?? "—");

    const softwareColorCode =
        typeof selectedRequest.software === "string"
            ? undefined
            : selectedRequest.software?.colorCode;

    const loggedByName = formatUserFullName(selectedRequest.loggedBy);

    return (
        <div className="space-y-4">
            <PageTitle showBack title="Feature Request Details" />
            <PageSummary
                icon={Tag}
                title={selectedRequest.title ?? "Untitled Request"}
                description={`Request Code: ${selectedRequest.requestCode ?? "—"}`}
                actionComponent={
                    <div className="flex items-center gap-3 flex-wrap">
                        <ActionButton
                            onClick={() =>
                                navigate(
                                    allRoutes.PORTAL +
                                    allRoutes.UPDATE_FEATURE_REQUEST(String(id)),
                                )
                            }
                            type="edit"
                            useText="Edit"
                        />
                        <ConfirmationDialog
                            alertType="delete"
                            title="Delete Feature Request?"
                            rightActionTitle="Delete"
                            content={
                                <p className="text-gray-500 text-center">
                                    This action cannot be undone. This will permanently delete the
                                    request <strong>{selectedRequest.title}</strong> and remove
                                    its data.
                                </p>
                            }
                            onConfirmClicked={() => handleDeletion(id as string)}
                            trigger={
                                <Button
                                    variant="destructive"
                                    className="bg-red-700! text-white"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span className="text-xs">Delete</span>
                                </Button>
                            }
                        />
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 space-y-3">
                    <div className="bg-card p-6 rounded-xl border shadow-sm flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Hash className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="text-lg font-bold text-card-foreground mb-1">
                            {selectedRequest.requestCode ?? "—"}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            {selectedRequest.requestedDate
                                ? `Requested: ${formatDate(selectedRequest.requestedDate)}`
                                : "No request date"}
                        </p>

                        <div className="w-full space-y-4 border-t pt-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                                    <CircleDot className="w-3 h-3" /> Status
                                </p>
                                {(() => {
                                    const status = selectedRequest.status ?? "";
                                    const color = getStatusColor(status);
                                    return (
                                        <Badge
                                            variant={color ? undefined : "secondary"}
                                            className="capitalize border text-xs px-3 py-1"
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
                                    );
                                })()}
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Priority
                                </p>
                                {(() => {
                                    const priority = selectedRequest.priority ?? "";
                                    const color = getPriorityColor(priority);
                                    return (
                                        <Badge
                                            variant={color ? undefined : "outline"}
                                            className="capitalize border text-xs px-3 py-1"
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
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-muted/30">
                            <h3 className="font-semibold text-card-foreground">
                                Request Information
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <DetailItem
                                icon={<User className="w-4 h-4" />}
                                label="Customer"
                                value={customerName}
                            />

                            <div>
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Monitor className="w-4 h-4" /> Related Software
                                </p>
                                <Badge
                                    variant={softwareColorCode ? undefined : "secondary"}
                                    className="capitalize border font-medium"
                                    style={getLookupBadgeStyle(softwareColorCode)}
                                >
                                    {softwareName}
                                </Badge>
                            </div>

                            <DetailItem
                                icon={<UserCheck className="w-4 h-4" />}
                                label="Logged By"
                                value={loggedByName}
                            />

                            <div>
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Users className="w-4 h-4" /> Assigned Users
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedRequest.assignedTo &&
                                        selectedRequest.assignedTo.length > 0 ? (
                                        selectedRequest.assignedTo.map((user, idx) => {
                                            const name = formatUserFullName(user);
                                            return (
                                                <Badge
                                                    key={idx}
                                                    variant="outline"
                                                    className="text-xs font-normal bg-muted/30"
                                                >
                                                    {name}
                                                </Badge>
                                            );
                                        })
                                    ) : (
                                        <span className="text-sm font-medium">Unassigned</span>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2 border-t pt-4 mt-2">
                                <DetailItem
                                    icon={<FileText className="w-4 h-4" />}
                                    label="Full Description"
                                    value={
                                        selectedRequest.description || "No description provided."
                                    }
                                />
                            </div>

                            <div className="md:col-span-2 border-t pt-4">
                                <DetailItem
                                    icon={<StickyNote className="w-4 h-4" />}
                                    label="Notes"
                                    value={selectedRequest.notes || "No additional notes."}
                                />
                            </div>

                            <div className="md:col-span-2 border-t border-border my-2" />

                            <DetailItem
                                icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
                                label="Created At"
                                value={formatDate(selectedRequest.createdAt)}
                            />
                            <DetailItem
                                icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
                                label="Last Updated"
                                value={formatDate(selectedRequest.updatedAt)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewFeatureRequest;
