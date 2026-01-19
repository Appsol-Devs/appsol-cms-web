  const StatusBadge = ({ active, status }: { active?: boolean; status?: string }) => {
    const isLive = active === true;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isLive
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-red-50 text-red-700 border-red-200"
        }`}>
        {status || (isLive ? "Active" : "Inactive")}
      </span>
    );
  };
  export default StatusBadge;