import { useState } from 'react';
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
import { useThemeContext } from '../../theme/ThemeContext';
import { useStore } from '../../store/useStore';
import { sites, alerts } from '../../data/mockData';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const { selectedSiteId, setSelectedSiteId } = useStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleSiteChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedSiteId(value === 'all' ? null : value);
  };

  const unreadAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'warning').length;

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
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>

          {/* Site Selector */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selected === 'all' ? 'All Sites' : sites.find(s => s.id === selected)?.name}
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleTheme} sx={{ color: 'text.primary' }}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton onClick={handleNotificationOpen} sx={{ color: 'text.primary' }}>
              <Badge badgeContent={unreadAlerts} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Avatar */}
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

        {/* Profile Menu */}
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

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 360, maxHeight: 400, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
              Mark all read
            </Typography>
          </Box>
          <Divider />
          {alerts.slice(0, 5).map((alert) => (
            <MenuItem
              key={alert.id}
              onClick={handleNotificationClose}
              sx={{
                py: 1.5,
                borderLeft: `3px solid ${
                  alert.severity === 'critical'
                    ? theme.palette.error.main
                    : alert.severity === 'warning'
                    ? theme.palette.warning.main
                    : theme.palette.info.main
                }`,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  {alert.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {alert.description.length > 60
                    ? `${alert.description.substring(0, 60)}...`
                    : alert.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem
            onClick={handleNotificationClose}
            sx={{ justifyContent: 'center', py: 1.5 }}
          >
            <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
              View All Notifications
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
