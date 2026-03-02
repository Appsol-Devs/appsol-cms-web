import { Button } from "./ui/button";
import {
  Ban,
  Edit,
  Eye,
  Plus,
  Save,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";

const ActionButton = ({
  disabled,
  type,
  onClick,
  useText,
}: {
  onClick?: () => void;
  disabled?: boolean;
  useText?: string;
  type:
    | "add"
    | "edit"
    | "delete"
    | "view"
    | "remove"
    | "approve"
    | "reject"
    | "save";
}) => {
  return (
    <div>
      {type === "edit" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          // size="icon"
          className="bg-surface! border-gray-700! text-onSurface rounded-md text-xs"
        >
          <Edit className="w-2 h-2" />
          <span className="text-xs">{useText ? useText : "Edit"}</span>
        </Button>
      ) : type === "add" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="bg-primary! text-xs rounded-md text-primary-foreground!"
        >
          <Plus className="md:h-4 h-3" />
          <span className="text-xs">{useText ? useText : "Add"}</span>
        </Button>
      ) : type === "view" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="bg-primary! text-xs rounded-md text-primary-foreground!"
        >
          <Eye />
          <span className="text-xs">{useText ? useText : "View"}</span>
        </Button>
      ) : type === "delete" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="hover:bg-muted/60 rounded-md text-xs hover:text-muted-foreground bg-destructive! text-destructive-foreground!"
        >
          <Trash2 />
          <span className="text-xs">{useText ? useText : "Delete"}</span>
        </Button>
      ) : type === "approve" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="rounded-md text-xs hover:opacity-90 bg-primary! text-primary-foreground!"
        >
          <ThumbsUp />
          <span className="text-xs">{useText ? useText : "Approve"}</span>
        </Button>
      ) : type === "reject" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="rounded-md text-xs hover:opacity-90 bg-destructive text-destructive-foreground"
        >
          <ThumbsDown />
          <span className="text-xs">{useText ? useText : "Reject"}</span>
        </Button>
      ) : type === "save" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="rounded-md text-xs hover:opacity-90 bg-primary! text-primary-foreground!"
        >
          <Save />
          <span className="text-xs">{useText ? useText : "Save Changes"}</span>
        </Button>
      ) : (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="hover:bg-muted/60 rounded-md text-xs hover:text-muted-foreground bg-muted! text-muted-foreground!"
        >
          <Ban />
          <span className="text-xs">{useText ? useText : "Remove"}</span>
        </Button>
      )}
    </div>
  );
};

export default ActionButton;
