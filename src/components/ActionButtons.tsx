import { Button } from "./ui/button";
import { Ban, Edit, Eye, Plus, ThumbsUp, Trash2 } from "lucide-react";

const ActionButton = ({
  disabled,
  type,
  onClick,
}: {
  onClick?: () => void;
  disabled?: boolean;
  type: "add" | "edit" | "delete" | "view" | "remove" | "approve" | "reject";
}) => {
  return (
    <div>
      {type === "edit" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          // size="icon"
          className="bg-rx-secondary rounded-md text-xs text-rx-secondary-foreground"
        >
          <Edit className="w-2 h-2" />
          Edit
        </Button>
      ) : type === "add" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="bg-primary! text-xs rounded-md text-primary-foreground!"
        >
          <Plus className="md:h-4 h-3" /> Add
        </Button>
      ) : type === "view" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="bg-rx-primary text-xs rounded-md text-rx-primary-foreground"
        >
          <Eye />
          View
        </Button>
      ) : type === "delete" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="hover:bg-muted/60 rounded-md text-xs hover:text-muted-foreground bg-destructive text-destructive-foreground"
        >
          <Trash2 /> Delete
        </Button>
      ) : type === "approve" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="rounded-md text-xs hover:opacity-90 bg-rx-primary text-rx-primary-foreground"
        >
          <ThumbsUp /> Approve
        </Button>
      ) : type === "reject" ? (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="rounded-md text-xs hover:opacity-90 bg-destructive text-destructive-foreground"
        >
          <ThumbsUp /> Reject
        </Button>
      ) : (
        <Button
          onClick={onClick}
          disabled={disabled}
          className="hover:bg-muted/60 rounded-md text-xs hover:text-muted-foreground bg-rx-neutral text-rx-neutral-foreground"
        >
          <Ban />
          Remove
        </Button>
      )}
    </div>
  );
};

export default ActionButton;
