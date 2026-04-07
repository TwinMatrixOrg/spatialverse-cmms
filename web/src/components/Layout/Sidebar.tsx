import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  SwipeableDrawer,
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
import { type ReactNode } from 'react';
import {
  Dashboard as DashboardIcon,
  Assignment as WorkOrderIcon,
  AssignmentLate as PermitIcon,
  Inventory2 as AssetIcon,
  Apartment as SpaceConsoleIcon,
  EventNote as PMIcon,
  Engineering as ContractorIcon,
  Warehouse as InventoryIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  MonitorHeart as MonitorHeartIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useAuth, type UserRole } from '../../auth/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
  collapsedWidth: number;
  isMobile: boolean;
}

interface MenuItemConfig {
  text: string;
  icon: ReactNode;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItemConfig[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['fm_manager', 'supervisor', 'technician', 'space_manager'] },
  { text: 'Work Orders', icon: <WorkOrderIcon />, path: '/work-orders', roles: ['fm_manager', 'supervisor', 'technician'] },
  { text: 'Permits', icon: <PermitIcon />, path: '/permits', roles: ['fm_manager', 'supervisor'] },
  { text: 'Assets', icon: <AssetIcon />, path: '/assets', roles: ['fm_manager', 'supervisor', 'technician', 'space_manager'] },
  { text: 'Condition Monitoring', icon: <MonitorHeartIcon />, path: '/condition-monitoring', roles: ['fm_manager', 'supervisor'] },
  { text: 'Floor Plan', icon: <MapIcon />, path: '/floor-plan', roles: ['fm_manager', 'supervisor', 'technician', 'space_manager'] },
  { text: 'PM Schedules', icon: <PMIcon />, path: '/pm-schedules', roles: ['fm_manager', 'supervisor'] },
  { text: 'Contractors', icon: <ContractorIcon />, path: '/contractors', roles: ['fm_manager'] },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', roles: ['fm_manager'] },
  { text: 'Reports', icon: <ReportIcon />, path: '/reports', roles: ['fm_manager', 'supervisor'] },
  { text: 'Space Console', icon: <SpaceConsoleIcon />, path: '/space-console', roles: ['fm_manager', 'space_manager'] },
];

const bottomMenuItems: MenuItemConfig[] = [
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['fm_manager'] },
];

export default function Sidebar({ open, onClose, drawerWidth, collapsedWidth, isMobile }: SidebarProps) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

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
  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(role));
  const visibleBottomMenuItems = bottomMenuItems.filter((item) => item.roles.includes(role));

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
        {/* Logo icon mark */}
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00BCD4 30%, #0077A8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            mr: open || isMobile ? 1.5 : 0,
          }}
        >
          {/* Hex + pulse SVG icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="10,1 17,5 17,13 10,17 3,13 3,5" fill="none" stroke="white" strokeWidth="1.5"/>
            <polyline points="3,9 6,9 7.5,6 10,12 12.5,7 14,9 17,9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </Box>

        {(open || isMobile) && (
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.1,
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
              }}
            >
              SpatialVerse Pulse
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#00BCD4',
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              Spatial FM Platform
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Main Navigation */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {visibleMenuItems.map((item) => {
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

      {visibleBottomMenuItems.length > 0 && (
        <>
          <Divider />

          {/* Bottom Navigation */}
          <List sx={{ px: 1, py: 2 }}>
            {visibleBottomMenuItems.map((item) => {
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
        </>
      )}

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
        <SwipeableDrawer
          open={open}
          onClose={onClose}
          onOpen={() => {}}
          disableDiscovery={false}
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
        </SwipeableDrawer>
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
