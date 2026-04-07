import { Box, Card, CardContent, Typography } from '@mui/material';

export default function SpaceConsole() {
  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 1.5 }}>
            Space Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Space planning console placeholder for Space Manager workflows.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
