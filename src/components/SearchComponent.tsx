import { useState, type FC, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const searchInputVariants = cva(
  ["rounded-md", "outline-none", "min-w-32 md:min-w-60", "w-24 md:w-max"],
  {
    variants: {
      intent: {
        primary: ["p-1"],
      },
      variantSize: {
        small: ["text-xs", "py-1", "px-2", "h-8"],
        medium: ["text-base", "py-1", "px-2", "h-10"],
      },
      prefixIcon: {
        apply: true,
        none: false,
      },
    },
    defaultVariants: {
      intent: "primary",
      variantSize: "medium",
      prefixIcon: "apply",
    },
  }
);

interface SearchComponentProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof searchInputVariants> {
  returnSearchKey?: (searchKey: string | null) => void;
  onSearchClick?: () => void;
  width?: string;
}

const SearchComponent: FC<SearchComponentProps> = ({
  className,
  variantSize,
  intent,
  prefixIcon,
  returnSearchKey,
  onSearchClick,
  width,
  ...props
}) => {
  const [searchKey, setSearchKey] = useState<string | null>(null);

  const handleSearchClicked = () => {
    if (returnSearchKey) {
      returnSearchKey(searchKey);
    }
    if (onSearchClick) {
      onSearchClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchClicked();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center rounded-md border-2 px-3 bg-surface",
        width === "100%" ? "w-full" : width ? width : "w-max"
      )}
    >
      {prefixIcon !== "none" && (
        <div
          onClick={handleSearchClicked}
          className="hover:cursor-pointer hover:bg-rx-neutral bg-surface shadow-none text-rx-card-foreground hover:ring-0 hover:outline-0"
        >
          <Search className="w-4 h-4" />
        </div>
        // <Search className="h-4 w-4 text-muted-foreground" />
      )}
      <Input
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchKey(e.target.value)
        }
        className={cn(
          "border-0 ring-0! shadow-none bg-surface! !focus:ring-0 outline-0! min-w-80 placeholder:font-semibold "
          // searchInputVariants({ intent, variantSize, className })
        )}
        placeholder={props.placeholder || "Search..."}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </div>
  );
};

export default SearchComponent;
