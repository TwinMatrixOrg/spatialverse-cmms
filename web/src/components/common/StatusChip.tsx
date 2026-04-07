import { Chip } from '@mui/material';
import { WorkOrderStatus } from '../../data/mockData';

interface StatusChipProps {
  status: WorkOrderStatus;
  size?: 'small' | 'medium';
}

const statusConfig: Record<WorkOrderStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
  open: { label: 'Open', color: 'error' },
  assigned: { label: 'Assigned', color: 'info' },
  in_progress: { label: 'In Progress', color: 'warning' },
  pending_parts: { label: 'Pending Parts', color: 'secondary' },
  resolved: { label: 'Resolved', color: 'success' },
  closed: { label: 'Closed', color: 'default' },
};

export default function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      size={size}
      color={config.color}
      variant="filled"
      sx={{
        fontWeight: 500,
        fontSize: size === 'small' ? '0.75rem' : '0.8rem',
      }}
    />
  );
}
