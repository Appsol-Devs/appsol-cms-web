import BackButton from "./BackButton";

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
  return (
    <div className="flex space-x-1 p-0 items-center">
      {showBack && <BackButton />}
      <div>
        <p
          className={`${
            isSmaller ? "text-base md:text-xl" : "text-lg md:text-xl"
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
