import React, { type ReactNode, type SVGProps } from "react";
import { Button } from "./ui/button";

type Props = {
  icon: React.FC<SVGProps<SVGSVGElement>>;
  title: string;
  buttonIcon?: React.FC<SVGProps<SVGSVGElement>>;
  description?: string;
  buttonText?: string;
  onClick?: () => void;
  actionComponent?: ReactNode;
};
const PageSummary = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
  buttonIcon: BxIcon,
  actionComponent,
}: Props) => {
  return (
    <div className="">
      <div className="border-2 flex lg:flex-row flex-col items-center justify-between bg-rx-card text-rx-card-foreground py-4 px-6 rounded-lg lg:rounded-md shadow-md">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <div className="flex flex-col">
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs">{description}</p>
          </div>
        </div>
        {actionComponent ? (
          actionComponent
        ) : buttonText ? (
          <Button onClick={onClick} className="rounded-full">
            {BxIcon ? (
              <>
                <BxIcon className="h-4 w-4" /> {buttonText}
              </>
            ) : (
              buttonText
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default PageSummary;
