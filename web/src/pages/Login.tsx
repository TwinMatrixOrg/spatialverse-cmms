import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { loggedIn, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const success = login(username, password);
    if (!success) {
      setError('Invalid username or password.');
      return;
    }

    setError('');
  };

  if (loggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        backgroundColor: '#0A1628',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          backgroundColor: 'rgba(15, 31, 53, 0.92)',
          border: '1px solid rgba(0, 188, 212, 0.18)',
          borderRadius: 3,
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #00BCD4 30%, #0077A8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="10,1 17,5 17,13 10,17 3,13 3,5" fill="none" stroke="white" strokeWidth="1.5" />
                <polyline
                  points="3,9 6,9 7.5,6 10,12 12.5,7 14,9 17,9"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                SpatialVerse Pulse
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: '0.08em' }}>
                Sign In
              </Typography>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                fullWidth
                autoComplete="username"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                autoComplete="current-password"
              />
              <Button type="submit" variant="contained" size="large" fullWidth>
                Sign In
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
