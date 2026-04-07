import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { workOrders, getAssetById, getUserById } from '../../data/mockData';
import { useStore } from '../../store/useStore';
import PriorityBadge from '../common/PriorityBadge';
import SLACountdown from '../common/SLACountdown';

export default function RecentWorkOrders() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { selectedSiteId } = useStore();

  const filteredWOs = selectedSiteId
    ? workOrders.filter(wo => wo.siteId === selectedSiteId)
    : workOrders;

  // Get recent work orders (last 10, sorted by creation date)
  const recentWOs = [...filteredWOs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const getInitials = (userId?: string) => {
    if (!userId) return '?';
    const user = getUserById(userId);
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Work Orders
          </Typography>
          <Tooltip title="View all">
            <IconButton size="small" onClick={() => navigate('/work-orders')}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, pb: 2 }}>
        <List disablePadding>
          {recentWOs.map((wo, index) => {
            const asset = getAssetById(wo.assetId);
            return (
              <ListItem
                key={wo.id}
                sx={{
                  px: 1.5,
                  py: 1,
                  mb: 1,
                  borderRadius: 1.5,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
                onClick={() => navigate('/work-orders')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5 }}>
                  <Tooltip title={wo.assignedToId ? getUserById(wo.assignedToId)?.firstName + ' ' + getUserById(wo.assignedToId)?.lastName : 'Unassigned'}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        bgcolor: wo.assignedToId ? 'primary.main' : 'grey.500',
                      }}
                    >
                      {getInitials(wo.assignedToId)}
                    </Avatar>
                  </Tooltip>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {wo.number}
                      </Typography>
                      <PriorityBadge priority={wo.priority} />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {asset?.name} • {wo.faultType}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <SLACountdown deadline={wo.slaDeadline} variant="chip" showLabel={false} />
                  </Box>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Card>
  );
}
