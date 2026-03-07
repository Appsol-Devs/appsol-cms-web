import { SearchX } from "lucide-react";

const NoResultsFound = ({
  content = "No results",
}: {
  content?: string;
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-card-foreground">
        {content}
      </p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Try adjusting your filters, changing the search term, or clearing the
        current selection to see more results.
      </p>
    </div>
  );
};

export default NoResultsFound;
