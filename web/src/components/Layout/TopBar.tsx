import { useState, MouseEvent } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Popover,
  List,
  ListItemButton,
  Button,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useThemeContext } from '../../theme/ThemeContext';
import { useStore } from '../../store/useStore';
import { sites } from '../../data/mockData';

interface TopBarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

export default function TopBar({ onMenuClick, isMobile }: TopBarProps) {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const {
    selectedSiteId,
    setSelectedSiteId,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleSiteChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedSiteId(value === 'all' ? null : value);
  };

  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          gap: 1,
          px: { xs: 1, sm: 2 },
          minHeight: { xs: 64, sm: 68 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: { xs: 1, sm: 2 }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>

          <FormControl
            size="small"
            sx={{
              minWidth: { xs: 140, sm: 200 },
              maxWidth: { xs: 190, sm: 280 },
            }}
          >
            <Select
              value={selectedSiteId || 'all'}
              onChange={handleSiteChange}
              displayEmpty
              sx={{
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  py: 1,
                },
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                    {selected === 'all' ? 'All Sites' : sites.find((site) => site.id === selected)?.name}
                  </Typography>
                </Box>
              )}
            >
              <MenuItem value="all">
                <ListItemIcon>
                  <LocationIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="All Sites" />
              </MenuItem>
              <Divider />
              {sites.map((site) => (
                <MenuItem key={site.id} value={site.id}>
                  <ListItemIcon>
                    <LocationIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={site.name} secondary={site.address.split(',')[0]} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 1 }, flexShrink: 0 }}>
          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleTheme} sx={{ color: 'text.primary' }}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton onClick={handleNotificationOpen} sx={{ color: 'text.primary' }}>
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                AR
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 220, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Ahmad Rahman
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Administrator
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>

        <Popover
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box
            sx={{
              width: { xs: 'min(92vw, 360px)', sm: 380 },
              maxHeight: 460,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
                <Chip size="small" color="error" label={`${unreadNotifications} unread`} />
              </Box>
              <Button
                size="small"
                onClick={markAllNotificationsRead}
                disabled={unreadNotifications === 0}
                sx={{ minWidth: isMobile ? 'auto' : undefined }}
              >
                Mark all read
              </Button>
            </Box>
            <Divider />
            <List dense sx={{ p: 0, overflowY: 'auto' }}>
              {notifications.map((notification) => (
                <ListItemButton
                  key={notification.id}
                  onClick={() => markNotificationRead(notification.id)}
                  sx={{
                    py: 1.25,
                    px: 2,
                    borderLeft: `3px solid ${
                      notification.severity === 'critical'
                        ? theme.palette.error.main
                        : notification.severity === 'warning'
                        ? theme.palette.warning.main
                        : theme.palette.info.main
                    }`,
                    backgroundColor: notification.read
                      ? 'transparent'
                      : theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(0, 0, 0, 0.02)',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: notification.read ? 500 : 700, mb: 0.5 }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))}
              {notifications.length === 0 && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        </Popover>
      </Toolbar>
    </AppBar>
  );
}
