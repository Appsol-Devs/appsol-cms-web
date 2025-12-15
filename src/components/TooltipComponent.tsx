import { type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface IToolTip {
  children: ReactNode;
  content: ReactNode | string;
}
const TooltipComponent = ({ children, content }: IToolTip) => {
  return (
    <Tooltip>
      <TooltipTrigger className="bg-inherit p-0 hover:border-0 border-0">
        {children}
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  );
};

export default TooltipComponent;
