import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import App from './App';
import { ThemeContextProvider } from './theme/ThemeContext';
import { AuthProvider } from './auth/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_BASENAME ?? '/cmms'}>
      <AuthProvider>
        <ThemeContextProvider>
          <CssBaseline />
          <App />
        </ThemeContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
