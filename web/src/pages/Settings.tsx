import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Backup as BackupIcon,
  CloudSync as CloudSyncIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../theme/ThemeContext';

export default function Settings() {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    slaAlerts: true,
    pmReminders: true,
    lowStock: true,
  });

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <PersonIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Profile
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 700,
                  }}
                >
                  AR
                </Avatar>
                <Box>
                  <Typography variant="h6">Ahmad Rahman</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Administrator
                  </Typography>
                  <Button size="small" sx={{ mt: 1 }}>
                    Change Photo
                  </Button>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    defaultValue="Ahmad"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    defaultValue="Rahman"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue="ahmad@twinmatrix.com"
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    defaultValue="+60 12-345 6789"
                    size="small"
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained">Save Changes</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <NotificationsIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
              </Box>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive email alerts for important events"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.email}
                      onChange={(e) =>
                        setNotifications({ ...notifications, email: e.target.checked })
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive browser push notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.push}
                      onChange={(e) =>
                        setNotifications({ ...notifications, push: e.target.checked })
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="SLA Breach Alerts"
                    secondary="Get notified when SLA deadlines are approaching"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.slaAlerts}
                      onChange={(e) =>
                        setNotifications({ ...notifications, slaAlerts: e.target.checked })
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="PM Reminders"
                    secondary="Receive reminders for upcoming preventive maintenance"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.pmReminders}
                      onChange={(e) =>
                        setNotifications({ ...notifications, pmReminders: e.target.checked })
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Low Stock Alerts"
                    secondary="Get notified when inventory items are running low"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.lowStock}
                      onChange={(e) =>
                        setNotifications({ ...notifications, lowStock: e.target.checked })
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <PaletteIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Appearance
                </Typography>
              </Box>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Dark Mode"
                    secondary="Use dark theme for better visibility in low light"
                  />
                  <ListItemSecondaryAction>
                    <Switch checked={mode === 'dark'} onChange={toggleTheme} />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Theme Colors
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['#00BCD4', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'].map((color) => (
                  <Box
                    key={color}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: color === '#00BCD4' ? '3px solid white' : 'none',
                      boxShadow: color === '#00BCD4' ? `0 0 0 2px ${color}` : 'none',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                      transition: 'transform 0.2s',
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <SecurityIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security
                </Typography>
              </Box>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1.5 }}>
                  <ListItemText
                    primary="Change Password"
                    secondary="Update your account password"
                  />
                  <ListItemSecondaryAction>
                    <Button size="small" variant="outlined">
                      Change
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem disablePadding sx={{ py: 1.5 }}>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security to your account"
                  />
                  <ListItemSecondaryAction>
                    <Button size="small" variant="outlined" color="success">
                      Enable
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem disablePadding sx={{ py: 1.5 }}>
                  <ListItemText
                    primary="Active Sessions"
                    secondary="Manage devices where you're logged in"
                  />
                  <ListItemSecondaryAction>
                    <Button size="small" variant="outlined">
                      View
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CloudSyncIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  System
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      API Version
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      v2.4.1
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.success.main, 0.05),
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      System Status
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                      Operational
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.info.main, 0.05),
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Last Sync
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Just now
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
