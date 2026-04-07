import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useStore } from '../../store/useStore';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen, setSidebarOpen } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        overflowX: 'hidden',
        '& .MuiButton-root, & .MuiToggleButton-root, & .MuiListItemButton-root': {
          minHeight: 44,
        },
        '& .MuiIconButton-root': {
          width: 44,
          height: 44,
        },
      }}
    >
      <Sidebar
        open={isMobile ? mobileOpen : sidebarOpen}
        onClose={() => isMobile ? setMobileOpen(false) : setSidebarOpen(false)}
        drawerWidth={DRAWER_WIDTH}
        collapsedWidth={COLLAPSED_WIDTH}
        isMobile={isMobile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
          overflow: 'hidden',
          overflowX: 'hidden',
        }}
      >
        <TopBar onMenuClick={handleDrawerToggle} isMobile={isMobile} />
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 1.5, sm: 2 },
            backgroundColor: 'background.default',
            overflow: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
