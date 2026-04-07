import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { alerts as allAlerts } from '../../data/mockData';

export default function AlertsPanel() {
  const theme = useTheme();

  // Show most recent alerts
  const alerts = [...allAlerts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon sx={{ fontSize: 20, color: 'error.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 20, color: 'warning.main' }} />;
      default:
        return <InfoIcon sx={{ fontSize: 20, color: 'info.main' }} />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'sla_breach':
        return 'SLA';
      case 'critical_fault':
        return 'Fault';
      case 'low_stock':
        return 'Stock';
      case 'license_expiry':
        return 'License';
      case 'pm_overdue':
        return 'PM';
      default:
        return 'Alert';
    }
  };

  const getAlertTypeColor = (type: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (type) {
      case 'sla_breach':
      case 'critical_fault':
        return 'error';
      case 'low_stock':
      case 'pm_overdue':
        return 'warning';
      case 'license_expiry':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Active Alerts
          </Typography>
          <Chip
            label={alerts.filter(a => a.severity === 'critical').length + ' Critical'}
            size="small"
            color="error"
            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
          />
        </Box>
      </CardContent>
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, pb: 2 }}>
        <List disablePadding>
          {alerts.map((alert) => (
            <ListItem
              key={alert.id}
              sx={{
                px: 1.5,
                py: 1.25,
                mb: 1,
                borderRadius: 1.5,
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(0, 0, 0, 0.02)',
                borderLeft: `4px solid ${
                  alert.severity === 'critical'
                    ? theme.palette.error.main
                    : alert.severity === 'warning'
                    ? theme.palette.warning.main
                    : theme.palette.info.main
                }`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1.5 }}>
                <Box sx={{ pt: 0.25 }}>
                  {getAlertIcon(alert.severity)}
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                      }}
                    >
                      {alert.title}
                    </Typography>
                    <Chip
                      label={getAlertTypeLabel(alert.type)}
                      size="small"
                      color={getAlertTypeColor(alert.type)}
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      lineHeight: 1.4,
                    }}
                  >
                    {alert.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: '0.65rem', mt: 0.5, display: 'block' }}
                  >
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Card>
  );
}
