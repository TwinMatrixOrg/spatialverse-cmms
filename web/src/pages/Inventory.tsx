import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Grid2 as Grid,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { inventoryItems, sites, getSiteById, InventoryItem, AssetType } from '../data/mockData';
import { useStore } from '../store/useStore';

const assetTypeColors: Record<AssetType, string> = {
  HVAC: '#29B6F6',
  Electrical: '#FFA726',
  Plumbing: '#66BB6A',
  'Fire Safety': '#EF5350',
  Elevator: '#AB47BC',
  Structural: '#78909C',
  'IT/AV': '#7C4DFF',
  General: '#90A4AE',
};

export default function Inventory() {
  const theme = useTheme();
  const { selectedSiteId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  const filteredItems = inventoryItems.filter((item) => {
    if (selectedSiteId && item.siteId !== selectedSiteId) return false;
    if (assetTypeFilter !== 'all' && !item.assetTypes.includes(assetTypeFilter as AssetType)) {
      return false;
    }
    if (stockFilter === 'low' && item.quantityOnHand >= item.minimumStock) return false;
    if (stockFilter === 'out' && item.quantityOnHand > 0) return false;
    if (stockFilter === 'ok' && item.quantityOnHand < item.minimumStock) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const lowStockItems = inventoryItems.filter(
    (item) => item.quantityOnHand < item.minimumStock && item.quantityOnHand > 0
  );
  const outOfStockItems = inventoryItems.filter((item) => item.quantityOnHand === 0);
  const totalValue = inventoryItems.reduce(
    (sum, item) => sum + (item.unitCost || 0) * item.quantityOnHand,
    0
  );

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantityOnHand === 0) return { label: 'Out of Stock', color: 'error' as const };
    if (item.quantityOnHand < item.minimumStock)
      return { label: 'Low Stock', color: 'warning' as const };
    return { label: 'In Stock', color: 'success' as const };
  };

  const getStockPercentage = (item: InventoryItem) => {
    if (item.minimumStock === 0) return 100;
    return Math.min((item.quantityOnHand / (item.minimumStock * 2)) * 100, 100);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Inventory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredItems.length} parts and supplies
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Item
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total Items
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {inventoryItems.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <InventoryIcon sx={{ color: 'primary.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Low Stock Alerts
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {lowStockItems.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  }}
                >
                  <WarningIcon sx={{ color: 'warning.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Out of Stock
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {outOfStockItems.length}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  }}
                >
                  <ErrorIcon sx={{ color: 'error.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total Value
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    RM {totalValue.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                  }}
                >
                  <ShippingIcon sx={{ color: 'success.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={assetTypeFilter}
            onChange={(e) => setAssetTypeFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">All Asset Types</MenuItem>
            {Object.keys(assetTypeColors).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">All Stock Levels</MenuItem>
            <MenuItem value="ok">In Stock</MenuItem>
            <MenuItem value="low">Low Stock</MenuItem>
            <MenuItem value="out">Out of Stock</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${theme.palette.warning.main}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <WarningIcon sx={{ color: 'warning.main' }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {lowStockItems.length} items are below minimum stock levels
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {lowStockItems.map((item) => item.name).join(', ')}
            </Typography>
          </Box>
          <Button size="small" variant="outlined" color="warning">
            Reorder Now
          </Button>
        </Box>
      )}

      {/* Inventory Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Part Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Asset Types</TableCell>
              <TableCell>Stock Level</TableCell>
              <TableCell>Min. Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Unit Cost</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item);
              const site = getSiteById(item.siteId);

              return (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      {item.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {item.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {item.assetTypes.slice(0, 2).map((type) => (
                        <Chip
                          key={type}
                          label={type}
                          size="small"
                          sx={{
                            backgroundColor: alpha(assetTypeColors[type], 0.15),
                            color: assetTypeColors[type],
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                      ))}
                      {item.assetTypes.length > 2 && (
                        <Chip
                          label={`+${item.assetTypes.length - 2}`}
                          size="small"
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                      <LinearProgress
                        variant="determinate"
                        value={getStockPercentage(item)}
                        sx={{
                          width: 60,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.divider, 0.3),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor:
                              item.quantityOnHand === 0
                                ? theme.palette.error.main
                                : item.quantityOnHand < item.minimumStock
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 25 }}>
                        {item.quantityOnHand}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.minimumStock}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={stockStatus.label}
                      color={stockStatus.color}
                      icon={
                        stockStatus.color === 'error' || stockStatus.color === 'warning' ? (
                          <WarningIcon />
                        ) : undefined
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {item.unitCost ? `RM ${item.unitCost.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{item.location || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {site?.name}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
