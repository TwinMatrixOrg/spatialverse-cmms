import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Drawer, Grid2 as Grid, Divider, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, alpha, useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  AccountBalanceWallet as WalletIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import AnimatedPage, { AnimatedPanel } from '../components/AnimatedPage';
import {
  purchaseRequisitions, purchaseOrders, goodsReceiptNotes,
  type PurchaseOrder, type PurchaseRequisition, type POLineItem,
  type POStatus, type PRStatus,
} from '../data/mockData';

const STATUS_COLORS: Record<string, string> = {
  draft: '#9e9e9e',
  pending_approval: '#f59e0b',
  approved: '#3b82f6',
  ordered: '#8b5cf6',
  received: '#14b8a6',
  completed: '#22c55e',
  cancelled: '#ef4444',
  rejected: '#ef4444',
  converted: '#22c55e',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  ordered: 'Ordered',
  received: 'Received',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  converted: 'Converted',
};

export default function Procurement() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Create PO form state
  const [newVendor, setNewVendor] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPaymentTerms, setNewPaymentTerms] = useState('Net 30');
  const [newItems, setNewItems] = useState<POLineItem[]>([
    { id: 'new-1', itemName: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0, unitOfMeasure: 'pcs' },
  ]);

  // Stats
  const totalPRs = purchaseRequisitions.length;
  const pendingPOs = purchaseOrders.filter(po => po.status === 'pending_approval' || po.status === 'draft').length;
  const totalSpend = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const receivedGRNs = goodsReceiptNotes.filter(g => g.status === 'received' || g.status === 'partial').length;

  const openDrawer = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setDrawerOpen(true);
  };

  const addLineItem = () => {
    setNewItems(prev => [...prev, {
      id: `new-${Date.now()}`, itemName: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0, unitOfMeasure: 'pcs',
    }]);
  };

  const removeLineItem = (id: string) => {
    setNewItems(prev => prev.filter(i => i.id !== id));
  };

  const updateLineItem = (id: string, field: keyof POLineItem, value: string | number) => {
    setNewItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      updated.totalPrice = updated.quantity * updated.unitPrice;
      return updated;
    }));
  };

  const newSubtotal = newItems.reduce((s, i) => s + i.totalPrice, 0);
  const newTax = Math.round(newSubtotal * 0.06);
  const newTotal = newSubtotal + newTax;

  const handleCreatePO = () => {
    setSnackbarMessage('Purchase Order created successfully');
    setCreateOpen(false);
    setNewVendor('');
    setNewDescription('');
    setNewItems([{ id: 'new-1', itemName: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0, unitOfMeasure: 'pcs' }]);
  };

  return (
    <AnimatedPage>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.65rem', sm: '2rem' } }}>
            Procurement
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} size="small">
            Create PO
          </Button>
        </Box>

        {/* Stats */}
        <AnimatedPanel>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Purchase Requisitions', value: totalPRs, icon: <ReceiptIcon />, color: '#3b82f6' },
              { label: 'Pending POs', value: pendingPOs, icon: <ShoppingCartIcon />, color: '#f59e0b' },
              { label: 'Total Spend', value: `MYR ${totalSpend.toLocaleString()}`, icon: <WalletIcon />, color: '#22c55e' },
              { label: 'GRNs Received', value: receivedGRNs, icon: <ShippingIcon />, color: '#8b5cf6' },
            ].map((stat, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={i}>
                <Card sx={{
                  border: `1px solid ${alpha(stat.color, 0.2)}`,
                  background: `linear-gradient(135deg, ${alpha(stat.color, 0.08)} 0%, transparent 60%)`,
                }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                      <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AnimatedPanel>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label={`Purchase Orders (${purchaseOrders.length})`} />
          <Tab label={`Purchase Requisitions (${purchaseRequisitions.length})`} />
        </Tabs>

        {/* PO Table */}
        {tab === 0 && (
          <AnimatedPanel delay={1}>
            <Card sx={{
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 50%)`,
            }}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>PO Number</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Delivery</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>WO</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchaseOrders.map(po => (
                        <TableRow
                          key={po.id}
                          hover
                          onClick={() => openDrawer(po)}
                          sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) } }}
                        >
                          <TableCell><Typography variant="body2" fontWeight={600}>{po.number}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{po.vendorName}</Typography></TableCell>
                          <TableCell><Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{po.description}</Typography></TableCell>
                          <TableCell align="right"><Typography variant="body2" fontWeight={600}>{po.currency} {po.totalAmount.toLocaleString()}</Typography></TableCell>
                          <TableCell><Chip size="small" label={STATUS_LABELS[po.status]} sx={{ bgcolor: alpha(STATUS_COLORS[po.status], 0.15), color: STATUS_COLORS[po.status], fontWeight: 600 }} /></TableCell>
                          <TableCell><Typography variant="body2">{po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</Typography></TableCell>
                          <TableCell><Typography variant="body2" color="text.secondary">{po.workOrderNumber || '—'}</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </AnimatedPanel>
        )}

        {/* PR Table */}
        {tab === 1 && (
          <AnimatedPanel delay={1}>
            <Card sx={{
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 50%)`,
            }}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>PR Number</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Requested By</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Linked PO</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchaseRequisitions.map(pr => (
                        <TableRow key={pr.id} hover>
                          <TableCell><Typography variant="body2" fontWeight={600}>{pr.number}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{pr.requestedByName}</Typography></TableCell>
                          <TableCell><Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pr.description}</Typography></TableCell>
                          <TableCell align="right"><Typography variant="body2" fontWeight={600}>{pr.currency} {pr.totalAmount.toLocaleString()}</Typography></TableCell>
                          <TableCell><Chip size="small" label={STATUS_LABELS[pr.status]} sx={{ bgcolor: alpha(STATUS_COLORS[pr.status], 0.15), color: STATUS_COLORS[pr.status], fontWeight: 600 }} /></TableCell>
                          <TableCell><Typography variant="body2" color="text.secondary">{pr.convertedToPO ? purchaseOrders.find(po => po.id === pr.convertedToPO)?.number || pr.convertedToPO : '—'}</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </AnimatedPanel>
        )}

        {/* PO Detail Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}
        >
          {selectedPO && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>{selectedPO.number}</Typography>
                <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
              </Box>

              {/* Status pipeline */}
              <Box sx={{ display: 'flex', gap: 0.5, mb: 3, flexWrap: 'wrap' }}>
                {['draft', 'pending_approval', 'approved', 'ordered', 'received', 'completed'].map(s => {
                  const currentIdx = ['draft', 'pending_approval', 'approved', 'ordered', 'received', 'completed'].indexOf(selectedPO.status);
                  const stepIdx = ['draft', 'pending_approval', 'approved', 'ordered', 'received', 'completed'].indexOf(s);
                  const isActive = stepIdx <= currentIdx;
                  return (
                    <Chip
                      key={s}
                      size="small"
                      label={STATUS_LABELS[s]}
                      sx={{
                        bgcolor: isActive ? alpha(STATUS_COLORS[s], 0.2) : alpha('#9e9e9e', 0.1),
                        color: isActive ? STATUS_COLORS[s] : '#9e9e9e',
                        fontWeight: isActive ? 700 : 400,
                        fontSize: '0.7rem',
                      }}
                    />
                  );
                })}
              </Box>

              {/* Summary */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Vendor', value: selectedPO.vendorName },
                  { label: 'Requested By', value: selectedPO.requestedByName },
                  { label: 'Payment Terms', value: selectedPO.paymentTerms || '—' },
                  { label: 'Delivery Date', value: selectedPO.deliveryDate ? new Date(selectedPO.deliveryDate).toLocaleDateString('en-MY') : '—' },
                  { label: 'Site', value: selectedPO.siteId === 'site-1' ? 'Pavilion KL' : 'KLCC' },
                  { label: 'WO', value: selectedPO.workOrderNumber || '—' },
                  { label: 'PR', value: selectedPO.prNumber || '—' },
                ].map((f, i) => (
                  <Grid size={{ xs: 6 }} key={i}>
                    <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{f.value}</Typography>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* Line Items */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Line Items</Typography>
              <Table size="small" sx={{ mb: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPO.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{item.itemName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                      </TableCell>
                      <TableCell align="right">{item.quantity} {item.unitOfMeasure}</TableCell>
                      <TableCell align="right">{selectedPO.currency} {item.unitPrice.toLocaleString()}</TableCell>
                      <TableCell align="right"><Typography fontWeight={600}>{selectedPO.currency} {item.totalPrice.toLocaleString()}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals */}
              <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06), borderRadius: 1, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedPO.currency} {selectedPO.subtotal.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Tax (6%)</Typography>
                  <Typography variant="body2">{selectedPO.currency} {selectedPO.tax.toLocaleString()}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight={700}>Total</Typography>
                  <Typography fontWeight={700}>{selectedPO.currency} {selectedPO.totalAmount.toLocaleString()}</Typography>
                </Box>
              </Box>

              {selectedPO.deliveryAddress && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Delivery Address</Typography>
                  <Typography variant="body2">{selectedPO.deliveryAddress}</Typography>
                </Box>
              )}
            </Box>
          )}
        </Drawer>

        {/* Create PO Dialog */}
        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Vendor" value={newVendor} onChange={e => setNewVendor(e.target.value)} fullWidth size="small" placeholder="e.g. Konsortium HVAC Sdn Bhd" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField label="Payment Terms" value={newPaymentTerms} onChange={e => setNewPaymentTerms(e.target.value)} fullWidth size="small" />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Description" value={newDescription} onChange={e => setNewDescription(e.target.value)} fullWidth size="small" multiline rows={2} />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>Line Items</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell width={50} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {newItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell><TextField size="small" value={item.itemName} onChange={e => updateLineItem(item.id, 'itemName', e.target.value)} placeholder="Item name" sx={{ minWidth: 180 }} /></TableCell>
                      <TableCell align="right"><TextField size="small" type="number" value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', Number(e.target.value))} sx={{ width: 70 }} /></TableCell>
                      <TableCell align="right"><TextField size="small" type="number" value={item.unitPrice} onChange={e => updateLineItem(item.id, 'unitPrice', Number(e.target.value))} sx={{ width: 100 }} /></TableCell>
                      <TableCell align="right"><Typography fontWeight={600}>MYR {item.totalPrice.toLocaleString()}</Typography></TableCell>
                      <TableCell><IconButton size="small" onClick={() => removeLineItem(item.id)} disabled={newItems.length === 1}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button size="small" startIcon={<AddIcon />} onClick={addLineItem}>Add Line Item</Button>

              <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06), borderRadius: 1, p: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2" fontWeight={600}>MYR {newSubtotal.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Tax (6%)</Typography>
                  <Typography variant="body2">MYR {newTax.toLocaleString()}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight={700}>Total</Typography>
                  <Typography fontWeight={700}>MYR {newTotal.toLocaleString()}</Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreatePO} disabled={!newVendor || !newDescription}>Create PO</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={Boolean(snackbarMessage)} autoHideDuration={3000} onClose={() => setSnackbarMessage('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={() => setSnackbarMessage('')} severity="success" variant="filled">{snackbarMessage}</Alert>
        </Snackbar>
      </Box>
    </AnimatedPage>
  );
}
