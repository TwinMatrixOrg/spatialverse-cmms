import { Chip } from '@mui/material';
import { Priority } from '../../data/mockData';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'small' | 'medium';
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string }> = {
  P1: { label: 'P1 Critical', color: '#FFFFFF', bgColor: '#EF5350' },
  P2: { label: 'P2 High', color: '#FFFFFF', bgColor: '#FFA726' },
  P3: { label: 'P3 Medium', color: '#000000', bgColor: '#FFEE58' },
  P4: { label: 'P4 Low', color: '#FFFFFF', bgColor: '#66BB6A' },
};

export default function PriorityBadge({ priority, size = 'small' }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        backgroundColor: config.bgColor,
        color: config.color,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        height: size === 'small' ? 22 : 28,
      }}
    />
  );
}
