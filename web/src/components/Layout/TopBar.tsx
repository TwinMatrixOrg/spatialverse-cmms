import { MouseEvent, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Circle as CircleIcon,
  DarkMode as DarkModeIcon,
  ExpandMore as ExpandMoreIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../../theme/ThemeContext';
import { useAuth } from '../../auth/AuthContext';

interface TopBarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

const splitRoleLabel = (label: string) => {
  const [name, roleTitle] = label.split('—').map((part) => part.trim());
  return {
    name: name || label,
    roleTitle: roleTitle || label,
  };
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

export default function TopBar({ onMenuClick, isMobile }: TopBarProps) {
  const { mode, toggleTheme } = useThemeContext();
  const { role, roleLabel, roleOptions, setRole, logout } = useAuth();

  const [roleAnchor, setRoleAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);

  const currentUser = splitRoleLabel(roleLabel);
  const initials = getInitials(currentUser.name);

  const handleRoleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setRoleAnchor(event.currentTarget);
  };

  const handleRoleMenuClose = () => {
    setRoleAnchor(null);
  };

  const handleRoleSelect = (nextRole: typeof role) => {
    setRole(nextRole);
    handleRoleMenuClose();
  };

  const handleUserMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setUserAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

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
          minHeight: '56px !important',
          px: { xs: 1, sm: 2 },
          gap: 1,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 1.5, color: 'text.primary' }}>
            <MenuIcon />
          </IconButton>
          {!isMobile && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              SpatialVerse Pulse CMMS
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleTheme} sx={{ color: 'text.primary' }}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Button
            onClick={handleRoleMenuOpen}
            endIcon={<ExpandMoreIcon />}
            variant="outlined"
            color="inherit"
            sx={{
              borderColor: 'divider',
              color: 'text.primary',
              textTransform: 'none',
              maxWidth: { xs: 170, sm: 280 },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentUser.roleTitle}
          </Button>

          <Divider orientation="vertical" flexItem />

          <Chip
            onClick={handleUserMenuOpen}
            clickable
            avatar={
              <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700 }}>
                {initials}
              </Avatar>
            }
            label={isMobile ? initials : currentUser.name}
            sx={{
              maxWidth: { xs: 84, sm: 220 },
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            }}
          />
        </Box>
      </Toolbar>

      <Menu
        anchorEl={roleAnchor}
        open={Boolean(roleAnchor)}
        onClose={handleRoleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {roleOptions.map((option) => (
          <MenuItem key={option.id} onClick={() => handleRoleSelect(option.id)}>
            <ListItemText primary={option.label} />
            {option.id === role && <CircleIcon sx={{ fontSize: 10, color: '#4CAF50', ml: 1.5 }} />}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={userAnchor}
        open={Boolean(userAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {currentUser.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentUser.roleTitle}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
