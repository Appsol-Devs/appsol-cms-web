import { Spinner } from "./ui/spinner";

const LoadingComponent = ({ loading }: { loading: boolean }) => {
  return (
    <div className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
      {loading && <Spinner />}
    </div>
  );
};

export default LoadingComponent;
