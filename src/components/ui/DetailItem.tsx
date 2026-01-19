interface DetailItemProps {
  icon?: React.ReactNode;
  label: string;
  value?: string | React.ReactNode;
  isMono?: boolean;
}

const DetailItem = ({ icon, label, value, isMono, }: DetailItemProps) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
    </span>
    <span className={`text-sm text-gray-900 font-medium ${isMono ? 'font-mono text-xs' : ''}`}>
        {value || "N/A"}
    </span>
  </div>
);
export default DetailItem;