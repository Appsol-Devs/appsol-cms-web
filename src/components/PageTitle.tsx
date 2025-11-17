import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const PageTitle = ({
  title,
  isSmaller,
  totalCount,
  subtext,
  showBack,
}: {
  title: string;
  totalCount?: number;
  subtext?: string;
  showBack?: boolean;
  isSmaller?: boolean;
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex space-x-1">
      {showBack && (
        <Button
          className="bg-transparent text-primary hover:bg-muted-foreground hover:text-white"
          size={"icon"}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
        </Button>
      )}
      <div>
        <p
          className={`${
            isSmaller ? "text-base md:text-xl" : "text-lg md:text-2xl"
          } font-bold tracking-tight`}
        >
          {title} {totalCount ? `(${totalCount})` : ""}
        </p>
        <p
          className={`${
            isSmaller ? "text-[10px] md:text-xs" : "text-xs md:text-sm"
          } text-muted-foreground`}
        >
          {subtext}
        </p>
      </div>
    </div>
  );
};

export default PageTitle;
