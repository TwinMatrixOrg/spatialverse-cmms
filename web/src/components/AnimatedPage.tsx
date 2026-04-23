import { type ReactNode } from 'react';
import { Box } from '@mui/material';

interface AnimatedPanelProps {
  children: ReactNode;
  delay?: number;
}

export default function AnimatedPage({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function AnimatedPanel({ children, delay = 0 }: AnimatedPanelProps) {
  return (
    <Box
      sx={{
        '@keyframes panelFadeIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        animation: `panelFadeIn 0.35s ease-out ${delay * 0.07}s both`,
        width: '100%',
      }}
    >
      {children}
    </Box>
  );
}
