import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BackButton = ({
  backTo,
  onClick,
}: {
  backTo?: string;
  onClick?: () => void;
}) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() =>
        onClick ? onClick() : backTo ? navigate(backTo) : navigate(-1)
      }
      className=" text-xs hover:cursor-pointer flex items-center gap-0.5 font-semibold rounded-xl bg-rx-primary text-rx-primary-foreground py-1 px-2"
    >
      <ChevronLeft size={10} /> <p>Back</p>
    </div>
  );
};

export default BackButton;
