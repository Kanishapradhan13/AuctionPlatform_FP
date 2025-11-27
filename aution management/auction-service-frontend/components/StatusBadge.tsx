interface StatusBadgeProps {
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    ACTIVE: 'bg-green-100 text-green-800',
    CLOSED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}
