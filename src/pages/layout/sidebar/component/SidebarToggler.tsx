import { Tooltip } from "@mui/material";
import { PanelLeftClose } from "lucide-react";
import { useDispatch } from "react-redux";
import { toggleSidebar } from "../common/sidebarSlice";
import { cn } from "@/lib/utils";

const SidebarToggler = ({ show = true }: { show: boolean }) => {
  const dispatch = useDispatch();

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    show && (
      <Tooltip title="Collapse Sidebar" placement="bottom">
        <div
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surfaceVariant/50 hover:cursor-pointer transition-all duration-200"
          onClick={handleToggleSidebar}
        >
          <PanelLeftClose
            className={cn(
              "w-5 h-5 text-onCard opacity-70 hover:opacity-100 transition-opacity duration-200",
            )}
          />
        </div>
      </Tooltip>
    )
  );
};

export default SidebarToggler;
