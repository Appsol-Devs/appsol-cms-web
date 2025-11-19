const NoResultsFound = ({
  content = "No results Found.",
}: {
  content?: string;
}) => {
  return (
    <div className="p-4 w-full items-center justify-center flex flex-col">
      <img src="/assets/images/no-result-found.png" alt="--" width={100} />
      <p>{content}</p>
    </div>
  );
};

export default NoResultsFound;
