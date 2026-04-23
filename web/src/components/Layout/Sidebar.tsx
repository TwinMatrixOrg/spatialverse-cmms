import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Collapse,
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
  EventNote as PMIcon,
  Engineering as ContractorIcon,
  Warehouse as InventoryIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  MonitorHeart as MonitorHeartIcon,
  Map as MapIcon,
  Science as FailureAnalysisIcon,
  Opacity as UtilityIcon,
  FactCheck as DlpIcon,
  Description as DrawingIcon,
  EventAvailable as ReservationIcon,
  Speed as KpiIcon,
  ShoppingCart as ShoppingCartIcon,
  Description as TPATAIcon,
  ExpandMore,
  ChevronRight,
} from '@mui/icons-material';
import { useAuth, type UserRole } from '../../auth/AuthContext';
import { useState } from 'react';

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
  hideIfRouteMissing?: boolean;
}

interface MenuSectionConfig {
  id: string;
  label: string;
  items: MenuItemConfig[];
}

const existingRoutePaths = new Set([
  '/',
  '/work-orders',
  '/permits',
  '/assets',
  '/condition-monitoring',
  '/floor-plan',
  '/utility-management',
  '/dlp-tracker',
  '/drawing-management',
  '/space-reservations',
  '/kpi-dashboard',
  '/pm-schedules',
  '/procurement',
  '/tpata-forms',
  '/contractors',
  '/inventory',
  '/reports',
  '/settings',
  '/space-console',
]);

const menuSections: MenuSectionConfig[] = [
  {
    id: 'overview',
    label: '🏠 Overview',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['fm_manager', 'supervisor', 'technician', 'space_manager'] },
    ],
  },
  {
    id: 'operations',
    label: '🔧 Operations',
    items: [
      { text: 'Work Orders', icon: <WorkOrderIcon />, path: '/work-orders', roles: ['fm_manager', 'supervisor', 'technician'] },
      {
        text: 'Permits to Work',
        icon: <PermitIcon />,
        path: '/permits',
        roles: ['fm_manager', 'supervisor'],
        hideIfRouteMissing: true,
      },
      {
        text: 'Failure Analysis / RCA',
        icon: <FailureAnalysisIcon />,
        path: '/failure-analysis',
        roles: ['fm_manager', 'supervisor'],
        hideIfRouteMissing: true,
      },
    ],
  },
  {
    id: 'assets',
    label: '🏗️ Assets',
    items: [
      { text: 'Asset Registry', icon: <AssetIcon />, path: '/assets', roles: ['fm_manager', 'supervisor', 'technician', 'space_manager'] },
      { text: 'Condition Monitoring', icon: <MonitorHeartIcon />, path: '/condition-monitoring', roles: ['fm_manager', 'supervisor'] },
      { text: 'Drawing Management', icon: <DrawingIcon />, path: '/drawing-management', roles: ['fm_manager', 'supervisor', 'technician', 'space_manager'] },
      { text: 'Floor Plan', icon: <MapIcon />, path: '/floor-plan', roles: ['fm_manager', 'supervisor', 'technician', 'space_manager'] },
    ],
  },
  {
    id: 'planning',
    label: '📅 Planning',
    items: [
      { text: 'PM Schedules', icon: <PMIcon />, path: '/pm-schedules', roles: ['fm_manager', 'supervisor'] },
      { text: 'Utility Management', icon: <UtilityIcon />, path: '/utility-management', roles: ['fm_manager', 'supervisor'] },
      { text: 'DLP Tracker', icon: <DlpIcon />, path: '/dlp-tracker', roles: ['fm_manager', 'supervisor'] },
      { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', roles: ['fm_manager'] },
      { text: 'Procurement', icon: <ShoppingCartIcon />, path: '/procurement', roles: ['fm_manager'] },
      { text: 'TPATA Forms', icon: <TPATAIcon />, path: '/tpata-forms', roles: ['fm_manager', 'supervisor'] },
    ],
  },
  {
    id: 'people',
    label: '👥 People',
    items: [
      { text: 'Contractors', icon: <ContractorIcon />, path: '/contractors', roles: ['fm_manager'] },
      { text: 'Space Reservations', icon: <ReservationIcon />, path: '/space-reservations', roles: ['fm_manager', 'supervisor', 'space_manager'] },
    ],
  },
  {
    id: 'insights',
    label: '📊 Insights',
    items: [
      { text: 'Reports', icon: <ReportIcon />, path: '/reports', roles: ['fm_manager', 'supervisor'] },
      { text: 'KPI Dashboard', icon: <KpiIcon />, path: '/kpi-dashboard', roles: ['fm_manager', 'supervisor'] },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['fm_manager'] },
    ],
  },
];

export default function Sidebar({ open, onClose, drawerWidth, collapsedWidth, isMobile }: SidebarProps) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => (
    Object.fromEntries(menuSections.map((section) => [section.id, true]))
  ));

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
  const showSectionLayout = open || isMobile;

  const visibleSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => (
        item.roles.includes(role)
        && (!item.hideIfRouteMissing || existingRoutePaths.has(item.path))
      )),
    }))
    .filter((section) => section.items.length > 0);

  const visibleFlatMenuItems = visibleSections.flatMap((section) => section.items);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getMenuItemSx = (active: boolean, nested: boolean) => ({
    borderRadius: 1.5,
    minHeight: 38,
    justifyContent: showSectionLayout ? 'initial' : 'center',
    pl: showSectionLayout ? (nested ? 2.25 : 1.5) : 0,
    pr: showSectionLayout ? 1.25 : 0,
    py: 0.25,
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
  });

  const renderMenuItem = (item: MenuItemConfig, nested = false) => {
    const active = isActive(item.path);

    return (
      <Tooltip
        key={item.path}
        title={!showSectionLayout ? item.text : ''}
        placement="right"
        arrow
      >
        <ListItem disablePadding sx={{ mb: 0.25 }}>
          <ListItemButton
            onClick={() => handleNavigation(item.path)}
            sx={getMenuItemSx(active, nested)}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: showSectionLayout ? 1.5 : 0,
                justifyContent: 'center',
                color: active ? 'primary.main' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {showSectionLayout && (
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.82rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'primary.main' : 'text.primary',
                }}
              />
            )}
          </ListItemButton>
        </ListItem>
      </Tooltip>
    );
  };

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
      <List sx={{ flexGrow: 1, px: 1, py: 1.25 }}>
        {showSectionLayout ? (
          visibleSections.map((section) => (
            <Box key={section.id} sx={{ mb: 0.75 }}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => toggleSection(section.id)}
                  sx={{
                    minHeight: 28,
                    borderRadius: 1.5,
                    px: 1,
                    py: 0,
                    mb: 0.25,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                >
                  <ListItemText
                    primary={section.label}
                    primaryTypographyProps={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                      color: 'text.secondary',
                    }}
                  />
                  {expandedSections[section.id] ? (
                    <ExpandMore sx={{ fontSize: '1.05rem', color: 'text.secondary' }} />
                  ) : (
                    <ChevronRight sx={{ fontSize: '1.05rem', color: 'text.secondary' }} />
                  )}
                </ListItemButton>
              </ListItem>

              <Collapse in={expandedSections[section.id]} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {section.items.map((item) => renderMenuItem(item, true))}
                </List>
              </Collapse>
            </Box>
          ))
        ) : (
          visibleFlatMenuItems.map((item) => renderMenuItem(item))
        )}
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
