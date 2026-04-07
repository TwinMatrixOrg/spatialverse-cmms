import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: 'primary' | 'error' | 'warning' | 'success' | 'info';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export default function KPICard({ title, value, subtitle, icon, color = 'primary' }: KPICardProps) {
  const theme = useTheme();

  const getColorValue = () => {
    switch (color) {
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'success':
        return theme.palette.success.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: getColorValue(),
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500, mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? `${getColorValue()}22`
                  : `${getColorValue()}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getColorValue(),
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
