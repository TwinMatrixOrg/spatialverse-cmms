import { useState, useEffect } from 'react';
import { Typography, Box, Chip } from '@mui/material';
import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

interface SLACountdownProps {
  deadline: string | Date;
  variant?: 'chip' | 'text';
  showLabel?: boolean;
}

export default function SLACountdown({ deadline, variant = 'text', showLabel = true }: SLACountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isOverdue, setIsOverdue] = useState(false);
  const [urgency, setUrgency] = useState<'critical' | 'warning' | 'normal'>('normal');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const diffInSeconds = differenceInSeconds(deadlineDate, now);

      if (diffInSeconds <= 0) {
        setIsOverdue(true);
        const overdueDiff = Math.abs(diffInSeconds);
        if (overdueDiff < 3600) {
          setTimeLeft(`${Math.floor(overdueDiff / 60)}m overdue`);
        } else if (overdueDiff < 86400) {
          setTimeLeft(`${Math.floor(overdueDiff / 3600)}h overdue`);
        } else {
          setTimeLeft(`${Math.floor(overdueDiff / 86400)}d overdue`);
        }
        setUrgency('critical');
        return;
      }

      setIsOverdue(false);
      const days = differenceInDays(deadlineDate, now);
      const hours = differenceInHours(deadlineDate, now) % 24;
      const minutes = differenceInMinutes(deadlineDate, now) % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
        setUrgency('normal');
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
        setUrgency(hours <= 4 ? 'warning' : 'normal');
      } else {
        setTimeLeft(`${minutes}m`);
        setUrgency(minutes <= 30 ? 'critical' : 'warning');
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  const getColor = () => {
    if (isOverdue || urgency === 'critical') return 'error';
    if (urgency === 'warning') return 'warning';
    return 'default';
  };

  if (variant === 'chip') {
    return (
      <Chip
        label={showLabel ? `SLA: ${timeLeft}` : timeLeft}
        size="small"
        color={getColor()}
        sx={{
          fontWeight: 500,
          fontSize: '0.75rem',
        }}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {showLabel && (
        <Typography variant="caption" color="text.secondary">
          SLA:
        </Typography>
      )}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: isOverdue || urgency === 'critical'
            ? 'error.main'
            : urgency === 'warning'
            ? 'warning.main'
            : 'text.primary',
        }}
      >
        {timeLeft}
      </Typography>
    </Box>
  );
}
