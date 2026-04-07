import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as WorkOrderIcon,
  AssignmentLate as PermitIcon,
  Inventory2 as AssetIcon,
  EventNote as PMIcon,
  Engineering as ContractorIcon,
  Warehouse as InventoryIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useStore } from '../../store/useStore';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
  collapsedWidth: number;
  isMobile: boolean;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Work Orders', icon: <WorkOrderIcon />, path: '/work-orders' },
  { text: 'Permits', icon: <PermitIcon />, path: '/permits' },
  { text: 'Assets', icon: <AssetIcon />, path: '/assets' },
  { text: 'PM Schedules', icon: <PMIcon />, path: '/pm-schedules' },
  { text: 'Contractors', icon: <ContractorIcon />, path: '/contractors' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
];

const bottomMenuItems = [
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Sidebar({ open, onClose, drawerWidth, collapsedWidth, isMobile }: SidebarProps) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen } = useStore();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const currentWidth = isMobile ? drawerWidth : (open ? drawerWidth : collapsedWidth);

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open || isMobile ? 'flex-start' : 'center',
          p: 2,
          minHeight: 64,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #00BCD4 0%, #0A1628 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: open || isMobile ? 1.5 : 0,
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
            SV
          </Typography>
        </Box>
        {(open || isMobile) && (
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                lineHeight: 1.2,
              }}
            >
              SpatialVerse Pulse
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
              }}
            >
              FM PLATFORM
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Main Navigation */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Tooltip
              key={item.path}
              title={!open && !isMobile ? item.text : ''}
              placement="right"
              arrow
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    justifyContent: open || isMobile ? 'initial' : 'center',
                    px: 2,
                    backgroundColor: active
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(0, 188, 212, 0.15)'
                        : 'rgba(0, 188, 212, 0.1)'
                      : 'transparent',
                    borderLeft: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open || isMobile ? 2 : 0,
                      justifyContent: 'center',
                      color: active ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(open || isMobile) && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? 'primary.main' : 'text.primary',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Divider />

      {/* Bottom Navigation */}
      <List sx={{ px: 1, py: 2 }}>
        {bottomMenuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Tooltip
              key={item.path}
              title={!open && !isMobile ? item.text : ''}
              placement="right"
              arrow
            >
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    justifyContent: open || isMobile ? 'initial' : 'center',
                    px: 2,
                    backgroundColor: active
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(0, 188, 212, 0.15)'
                        : 'rgba(0, 188, 212, 0.1)'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open || isMobile ? 2 : 0,
                      justifyContent: 'center',
                      color: active ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(open || isMobile) && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? 'primary.main' : 'text.primary',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* TMT Branding */}
      {(open || isMobile) && (
        <Box sx={{ p: 2, pt: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.65rem',
              display: 'block',
              textAlign: 'center',
            }}
          >
            Powered by
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'primary.main',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'block',
              textAlign: 'center',
            }}
          >
            TwinMatrix Technologies
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: currentWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: currentWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
