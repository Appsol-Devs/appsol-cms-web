import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

const FetchingError = ({ refetch }: { refetch?: () => void }) => {
  return (
    <div className="p-4 space-y-2">
      <p className="text-sm">Could not fetch data due to an error!</p>
      <Button onClick={() => refetch?.()} variant="destructive">
        <RefreshCw /> Click to refetch
      </Button>
    </div>
  );
};

export default FetchingError;
