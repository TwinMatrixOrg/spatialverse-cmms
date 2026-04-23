import { useState, type ReactNode } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Button, TextField,
  Grid2 as Grid, IconButton, Divider, alpha, useTheme, Paper,
  Avatar, Menu, MenuItem, Snackbar, Alert, Tooltip, Badge,
  Modal, Dialog, DialogTitle, DialogContent, DialogActions, Rating,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import PersonIcon from '@mui/icons-material/Person';
import {
  SmartToy as AIIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  BarChart as ChartIcon,
  Description as FormIcon,
  Sensors as SensorIcon,
  Assessment as ReportIcon,
  Speed as KpiIcon,
  CalendarMonth as CalendarIcon,
  Bolt as BoltIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import AnimatedPage, { AnimatedPanel } from '../components/AnimatedPage';
import { useStore } from '../store/useStore';

// ── Types ────────────────────────────────────────────────────────
export interface StudioApp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  tags: string[];
  author: string;
  installed: boolean;
  published: boolean;
  shared: boolean;
  starred: boolean;
  generatedBy: 'ai' | 'builtin';
  dataSources: string[];
  createdAt: string;
  usageCount: number;
}

// ── Pre-built / AI-generated apps ────────────────────────────────
export const STUDIO_APPS_DATA: StudioApp[] = [
  {
    id: 'app-1',
    name: 'Chiller Plant Efficiency Tracker',
    description: 'Real-time COP monitoring across all chillers with daily efficiency trends, alert thresholds, and monthly energy consumption reports. Auto-generates APD compliance data.',
    icon: <BoltIcon />,
    category: 'Energy',
    tags: ['chiller', 'COP', 'energy', 'APD'],
    author: 'AI Agent',
    installed: true,
    published: true,
    shared: true,
    starred: true,
    generatedBy: 'ai',
    dataSources: ['Assets', 'Sensors', 'APD'],
    createdAt: '2026-04-10',
    usageCount: 47,
  },
  {
    id: 'app-2',
    name: 'Vendor Performance Scorecard',
    description: 'Tracks contractor response times, completion rates, cost variance, and quality scores. Auto-calculates vendor ranking and flags underperformers.',
    icon: <KpiIcon />,
    category: 'Procurement',
    tags: ['vendor', 'contractor', 'KPI', 'scoring'],
    author: 'AI Agent',
    installed: true,
    published: false,
    shared: false,
    starred: false,
    generatedBy: 'ai',
    dataSources: ['Work Orders', 'Contractors', 'Procurement'],
    createdAt: '2026-04-15',
    usageCount: 23,
  },
  {
    id: 'app-3',
    name: 'Daily Temperature Log',
    description: 'Captures daily cold water and AHU supply temperatures with pass/fail thresholds. Generates monthly compliance reports per JKR requirements.',
    icon: <SensorIcon />,
    category: 'Compliance',
    tags: ['temperature', 'water', 'JKR', 'daily'],
    author: 'AI Agent',
    installed: true,
    published: true,
    shared: true,
    starred: false,
    generatedBy: 'ai',
    dataSources: ['Assets', 'Sensors'],
    createdAt: '2026-04-18',
    usageCount: 62,
  },
  {
    id: 'app-4',
    name: 'Asset Lifecycle Planner',
    description: 'Projects asset replacement timelines based on age, condition, MTBF, and budget. Generates 5-year capex forecast with prioritization matrix.',
    icon: <CalendarIcon />,
    category: 'Planning',
    tags: ['capex', 'replacement', 'forecast', 'budget'],
    author: 'AI Agent',
    installed: false,
    published: false,
    shared: false,
    starred: true,
    generatedBy: 'ai',
    dataSources: ['Assets', 'Work Orders', 'Reports'],
    createdAt: '2026-04-20',
    usageCount: 12,
  },
  {
    id: 'app-5',
    name: 'Emergency Drill Scheduler',
    description: 'Manages fire drill and evacuation schedules per BOMBA requirements. Tracks attendance, response times, and generates post-drill reports.',
    icon: <FormIcon />,
    category: 'Safety',
    tags: ['fire', 'drill', 'BOMBA', 'safety'],
    author: 'AI Agent',
    installed: false,
    published: false,
    shared: false,
    starred: false,
    generatedBy: 'ai',
    dataSources: ['Assets', 'Work Orders'],
    createdAt: '2026-04-21',
    usageCount: 8,
  },
  {
    id: 'app-6',
    name: 'Water Consumption Dashboard',
    description: 'Tracks SYABAS meter readings, detects anomalies, and benchmarks against occupancy. Integrates with utility billing for cost allocation.',
    icon: <ChartIcon />,
    category: 'Utilities',
    tags: ['water', 'SYABAS', 'consumption', 'billing'],
    author: 'AI Agent',
    installed: true,
    published: false,
    shared: false,
    starred: false,
    generatedBy: 'ai',
    dataSources: ['Utility Management', 'Assets'],
    createdAt: '2026-04-12',
    usageCount: 31,
  },
  {
    id: 'app-7',
    name: 'SLA Breach Analyzer',
    description: 'Aggregates all SLA breaches by priority, asset type, and site. Identifies root cause patterns and recommends preventive actions.',
    icon: <ReportIcon />,
    category: 'Operations',
    tags: ['SLA', 'breach', 'analysis', 'root cause'],
    author: 'FM Manager',
    installed: true,
    published: true,
    shared: true,
    starred: true,
    generatedBy: 'builtin',
    dataSources: ['Work Orders', 'Assets'],
    createdAt: '2026-03-05',
    usageCount: 89,
  },
];

const SUGGESTED_APPS = [
  'Track elevator downtime by building with monthly availability percentage',
  'Generate vendor payment schedule based on PO approvals and GRN status',
  'Create a spares inventory reorder point calculator based on consumption patterns',
  'Build a tenant complaint tracker with auto-assignment to FM team',
  'Monitor roof waterproofing condition index across all sites',
];

export default function PulseStudio() {
  const theme = useTheme();
  const { publishedApps, togglePublishedApp } = useStore();
  const [apps, setApps] = useState<StudioApp[]>(STUDIO_APPS_DATA);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
  const [previewWidget, setPreviewWidget] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuAppId, setMenuAppId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState('');
  const [filter, setFilter] = useState<'all' | 'installed' | 'starred'>('all');
  const [detailAppId, setDetailAppId] = useState<string | null>(null);

  const installedCount = apps.filter(a => a.installed).length;
  const starredCount = apps.filter(a => a.starred).length;
  const publishedCount = publishedApps.length;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGeneratedPreview(null);
    setPreviewWidget(false);

    // Simulate AI generation
    setTimeout(() => {
      setGenerating(false);
      setPreviewWidget(true);
      setGeneratedPreview(prompt);
    }, 2000);
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, appId: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuAppId(appId);
  };

  const handleAction = (action: string) => {
    if (!menuAppId) return;
    setApps(prev => prev.map(a => {
      if (a.id !== menuAppId) return a;
      switch (action) {
        case 'publish': return { ...a, published: !a.published };
        case 'share': return { ...a, shared: !a.shared };
        case 'star': return { ...a, starred: !a.starred };
        case 'install': return { ...a, installed: true };
        default: return a;
      }
    }));
    if (action === 'publish' && menuAppId) {
      togglePublishedApp(menuAppId);
    }
    const actionLabels: Record<string, string> = {
      publish: 'Toggled dashboard visibility',
      share: 'Shared with organization',
      star: 'Updated favorite',
      install: 'App installed',
    };
    setSnackbar(actionLabels[action] || 'Done');
    setMenuAnchor(null);
  };

  const filteredApps = apps.filter(a => {
    if (filter === 'installed') return a.installed;
    if (filter === 'starred') return a.starred;
    return true;
  });

  return (
    <AnimatedPage>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.65rem', sm: '2rem' } }}>
              Pulse Studio
            </Typography>
            <Chip label="BETA" size="small" sx={{ bgcolor: alpha('#f59e0b', 0.15), color: '#d97706', fontWeight: 700, fontSize: '0.65rem' }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label={`All (${apps.length})`} size="small" variant={filter === 'all' ? 'filled' : 'outlined'} color={filter === 'all' ? 'primary' : 'default'} onClick={() => setFilter('all')} clickable />
            <Chip label={`Installed (${installedCount})`} size="small" variant={filter === 'installed' ? 'filled' : 'outlined'} color={filter === 'installed' ? 'primary' : 'default'} onClick={() => setFilter('installed')} clickable />
            <Chip label={`Starred (${starredCount})`} size="small" variant={filter === 'starred' ? 'filled' : 'outlined'} color={filter === 'starred' ? 'primary' : 'default'} onClick={() => setFilter('starred')} clickable />
          </Box>
        </Box>

        {/* AI Generator */}
        <AnimatedPanel>
          <Card sx={{
            mb: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha('#8b5cf6', 0.04)} 100%)`,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AIIcon sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={700}>AI App Generator</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Describe an app you need and I'll build it from your FM data. It gets saved to your workspace and can be shared with your team.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="e.g. 'Track elevator downtime by building with monthly availability percentage'"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  disabled={generating}
                />
                <Button variant="contained" onClick={handleGenerate} disabled={generating || !prompt.trim()} sx={{ flexShrink: 0, minWidth: 100 }}>
                  {generating ? 'Building...' : 'Generate'}
                </Button>
              </Box>

              {/* Suggested prompts */}
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: generatedPreview ? 2 : 0 }}>
                {SUGGESTED_APPS.map((s, i) => (
                  <Chip key={i} label={s.length > 60 ? s.substring(0, 57) + '...' : s} size="small" variant="outlined" clickable onClick={() => { setPrompt(s); }}
                    sx={{ fontSize: '0.7rem', height: 26 }} />
                ))}
              </Box>

              {/* Generation result with widget preview */}
              {previewWidget && generatedPreview && (
                <Paper sx={{ p: 0, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, borderRadius: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.06), borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.15)}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e' }} />
                      <Typography variant="subtitle2" fontWeight={700}>App Generated Successfully</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">{generatedPreview}</Typography>
                  </Box>
                  {/* Widget preview */}
                  <Box sx={{ p: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Widget Preview</Typography>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                          <Typography variant="h5" fontWeight={700} color="primary">24</Typography>
                          <Typography variant="caption" color="text.secondary">Records</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                          <Typography variant="h5" fontWeight={700} color="success">98%</Typography>
                          <Typography variant="caption" color="text.secondary">Compliance</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                          <Typography variant="h5" fontWeight={700} color="warning">3</Typography>
                          <Typography variant="caption" color="text.secondary">Alerts</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>Data Sources</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {['Assets', 'Sensors', 'Work Orders'].map(ds => (
                          <Chip key={ds} size="small" label={ds} variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ p: 1.5, display: 'flex', gap: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                    <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => {
                      togglePublishedApp('app-new-' + Date.now());
                      setSnackbar('App installed and published to Dashboard');
                      setPreviewWidget(false);
                      setGeneratedPreview(null);
                      setPrompt('');
                    }}>Install to Dashboard</Button>
                    <Button size="small" variant="outlined" onClick={() => { setPreviewWidget(false); setGeneratedPreview(null); setPrompt(''); }}>Discard</Button>
                  </Box>
                </Paper>
              )}
            </CardContent>
          </Card>
        </AnimatedPanel>

        {/* App Grid */}
        <AnimatedPanel delay={1}>
          <Grid container spacing={2}>
            {filteredApps.map(app => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={app.id}>
                <Card sx={{
                  height: '100%',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          width: 36, height: 36,
                        }}>
                          {app.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2, cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => setDetailAppId(app.id)}>{app.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3 }}>
                            {app.generatedBy === 'ai' && <Chip size="small" label="AI" sx={{ height: 16, fontSize: '0.6rem', bgcolor: alpha('#8b5cf6', 0.15), color: '#7c3aed' }} />}
                            {app.installed && <Chip size="small" label="Installed" sx={{ height: 16, fontSize: '0.6rem', bgcolor: alpha('#22c55e', 0.15), color: '#16a34a' }} />}
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small" onClick={() => handleAction('star')}>
                          {app.starred ? <StarIcon sx={{ color: '#f59e0b', fontSize: 18 }} /> : <StarBorderIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, app.id)}><MoreIcon fontSize="small" /></IconButton>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {app.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                      {app.tags.slice(0, 3).map(tag => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                      ))}
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {publishedApps.includes(app.id) && <Tooltip title="Published to Dashboard"><DashboardIcon sx={{ fontSize: 14, color: '#22c55e' }} /></Tooltip>}
                        {app.shared && <Tooltip title="Shared with Org"><PublicIcon sx={{ fontSize: 14, color: '#3b82f6' }} /></Tooltip>}
                        {!app.shared && <Tooltip title="Private"><LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} /></Tooltip>}
                      </Box>
                      <Typography variant="caption" color="text.secondary">{app.usageCount} uses</Typography>
                    </Box>

                    {!app.installed && (
                      <Button size="small" variant="outlined" fullWidth sx={{ mt: 1.5 }} startIcon={<AddIcon />} onClick={() => {
                        setApps(prev => prev.map(a => a.id === app.id ? { ...a, installed: true } : a));
                        setSnackbar(`${app.name} installed`);
                      }}>
                        Install
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AnimatedPanel>

        {/* Context Menu */}
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem onClick={() => handleAction('publish')}>
            <DashboardIcon sx={{ mr: 1, fontSize: 18 }} />
            {apps.find(a => a.id === menuAppId)?.published ? 'Unpublish from Dashboard' : 'Publish to Dashboard'}
          </MenuItem>
          <MenuItem onClick={() => handleAction('share')}>
            <ShareIcon sx={{ mr: 1, fontSize: 18 }} />
            {apps.find(a => a.id === menuAppId)?.shared ? 'Make Private' : 'Share with Organization'}
          </MenuItem>
          <MenuItem onClick={() => handleAction('star')}>
            <StarIcon sx={{ mr: 1, fontSize: 18 }} />
            {apps.find(a => a.id === menuAppId)?.starred ? 'Remove from Favorites' : 'Add to Favorites'}
          </MenuItem>
        </Menu>

        <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert onClose={() => setSnackbar('')} severity="success" variant="filled">{snackbar}</Alert>
        </Snackbar>

        {/* App Detail Modal */}
        {detailAppId && (() => {
          const app = apps.find(a => a.id === detailAppId);
          if (!app) return null;

          const comments = [
            { user: 'Ahmad Razak', role: 'Facilities Manager', avatar: 'AR', rating: 5, date: 'Apr 18, 2026', text: 'This app saved us hours of manual tracking. The real-time alerts are a game-changer — we caught a chiller malfunction before it went critical.' },
            { user: 'Siti Nurhaliza', role: 'HVAC Technician', avatar: 'SN', rating: 4, date: 'Apr 15, 2026', text: 'Easy to use on the go. I check it daily during rounds. Would love to see offline mode added for when we\'re in the plant room basement with no signal.' },
            { user: 'Brian Tan', role: 'Building Engineer', avatar: 'BT', rating: 5, date: 'Apr 12, 2026', text: 'The COP trend chart is exactly what management needed. Now we have hard data to justify the chiller replacement budget.' },
            { user: 'Fatimah Ismail', role: 'Operations Director', avatar: 'FI', rating: 4, date: 'Apr 8, 2026', text: 'Finally some visibility into our energy efficiency. The dashboard widget is clean and the data matches our BMS readings.' },
          ];

          // Mini dark-themed preview box wrapper
          const SB = ({ children, label }: { children: ReactNode; label: string }) => (
            <Box sx={{ width: '100%', height: '100%', bgcolor: '#0f172a', borderRadius: 1, overflow: 'hidden', p: 0.75, position: 'relative' }}>
              {children}
            </Box>
          );
          const mb = (h: number, c: string) => <Box sx={{ flex: 1, height: `${h}%`, bgcolor: c, borderRadius: '2px 2px 0 0', minWidth: 2 }} />;

          const getAppScreenshots = (id: string): { label: string; component: ReactNode }[] => {
            switch (id) {
              case 'app-1': return [
                { label: 'COP Overview', component: <SB label="COP"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Chiller Plant — Real-time COP</Typography><Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>{[{ v: '2.84', l: 'CH-01', g: '#22c55e' }, { v: '2.71', l: 'CH-02', g: '#f59e0b' }, { v: '2.92', l: 'CH-03', g: '#22c55e' }, { v: '2.18', l: 'CH-04', g: '#ef4444' }].map(c => (<Box key={c.l} sx={{ flex: 1, height: 32, bgcolor: alpha(c.g, 0.08), borderRadius: 0.5, border: `1px solid ${alpha(c.g, 0.3)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontSize: 7, color: c.g, fontWeight: 700, lineHeight: 1 }}>{c.v}</Typography><Typography sx={{ fontSize: 5, color: '#94a3b8' }}>{c.l}</Typography></Box>))}</Box><Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: '55%', px: 0.5 }}>{[55,62,58,70,65,72,80,75,82,85,78,88].map((h, j) => mb(h, j > 8 ? '#00A3A1' : alpha('#0A4D8C', 0.6)))}</Box></SB> },
                { label: 'Energy Trend', component: <SB label="Trend"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Monthly kWh — Last 12 Months</Typography><Box sx={{ height: '75%', position: 'relative' }}><svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none"><polyline fill={alpha('#22c55e', 0.12)} stroke="none" points="0,70 20,65 40,55 60,60 80,45 100,50 120,35 140,30 160,25 180,22 200,18 200,80 0,80" /><polyline fill="none" stroke="#22c55e" strokeWidth="2" points="0,70 20,65 40,55 60,60 80,45 100,50 120,35 140,30 160,25 180,22 200,18" /></svg><Box sx={{ position: 'absolute', right: 5, top: 2, bgcolor: alpha('#22c55e', 0.15), px: 0.5, borderRadius: 0.5 }}><Typography sx={{ fontSize: 7, color: '#22c55e', fontWeight: 700 }}>-18%</Typography></Box></Box></SB> },
                { label: 'Alert Config', component: <SB label="Alerts"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.4 }}>Threshold Rules</Typography>{[{ l: 'COP < 2.5', c: '#ef4444', on: true }, { l: 'Supply > 7.5°C', c: '#f59e0b', on: true }, { l: 'ΔT < 5°C', c: '#f59e0b', on: false }, { l: 'kWh > 800/day', c: '#ef4444', on: true }].map((r, ri) => (<Box key={ri} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3, px: 0.5, py: 0.25, bgcolor: alpha(r.c, 0.08), borderRadius: 0.5, border: `1px solid ${alpha(r.c, 0.2)}` }}><Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: r.on ? r.c : '#475569', boxShadow: r.on ? `0 0 4px ${r.c}` : 'none' }} /><Typography sx={{ fontSize: 6, color: '#e2e8f0', flex: 1 }}>{r.l}</Typography><Box sx={{ width: 16, height: 8, borderRadius: 4, bgcolor: r.on ? alpha(r.c, 0.4) : '#334155', position: 'relative' }}><Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: r.on ? '#fff' : '#64748b', position: 'absolute', top: 1, left: r.on ? 8 : 1 }} /></Box></Box>))}</SB> },
              ];
              case 'app-2': return [
                { label: 'Vendor Ranking', component: <SB label="Ranking"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.4 }}>Top Vendors — Overall Score</Typography>{['Konsortium HVAC', 'ProTech Elec', 'MegaBuild', 'Atlas FM'].map((v, vi) => { const scores = [94, 87, 79, 72]; const colors = ['#22c55e', '#22c55e', '#f59e0b', '#f59e0b']; return (<Box key={v} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}><Typography sx={{ fontSize: 6, color: '#94a3b8', width: 55, flexShrink: 0 }}>{v}</Typography><Box sx={{ flex: 1, height: 8, bgcolor: '#1e293b', borderRadius: 1, overflow: 'hidden' }}><Box sx={{ width: `${scores[vi]}%`, height: '100%', bgcolor: colors[vi], borderRadius: 1 }} /></Box><Typography sx={{ fontSize: 7, color: colors[vi], fontWeight: 700, width: 24, textAlign: 'right' }}>{scores[vi]}</Typography></Box>); })}</SB> },
                { label: 'Response Time', component: <SB label="Response"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Avg Response (hrs) by Vendor</Typography><Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: '70%', px: 0.5 }}>{[{ l: 'HVAC', h: 40, c: '#22c55e' }, { l: 'Elec', h: 55, c: '#22c55e' }, { l: 'MB', h: 75, c: '#f59e0b' }, { l: 'Atlas', h: 90, c: '#ef4444' }, { l: 'Clean', h: 35, c: '#22c55e' }].map(b => (<Box key={b.l} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.2 }}><Box sx={{ width: '100%', height: `${b.h}%`, bgcolor: b.c, borderRadius: '2px 2px 0 0' }} /><Typography sx={{ fontSize: 5, color: '#64748b' }}>{b.l}</Typography></Box>))}</Box></SB> },
                { label: 'Cost Variance', component: <SB label="Cost"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Budget vs Actual (RM K)</Typography><Box sx={{ height: '70%', position: 'relative' }}><svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none"><polyline fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" points="0,20 200,20" /><polyline fill="none" stroke="#3b82f6" strokeWidth="2" points="0,55 40,50 80,45 120,50 160,35 200,30" /><polyline fill="none" stroke="#22c55e" strokeWidth="2" points="0,60 40,55 80,40 120,42 160,28 200,22" /></svg><Box sx={{ position: 'absolute', bottom: 5, right: 5, display: 'flex', gap: 0.5 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}><Box sx={{ width: 8, height: 2, bgcolor: '#3b82f6', borderRadius: 1 }} /><Typography sx={{ fontSize: 5, color: '#94a3b8' }}>Actual</Typography></Box><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}><Box sx={{ width: 8, height: 2, bgcolor: '#22c55e', borderRadius: 1 }} /><Typography sx={{ fontSize: 5, color: '#94a3b8' }}>Budget</Typography></Box></Box></Box></SB> },
              ];
              case 'app-3': return [
                { label: 'Temperature Log', component: <SB label="Daily Log"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Daily Temps — This Week</Typography>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, di) => { const temps = [6.2, 6.8, 5.9, 6.1, 7.4, 5.8, 6.0]; const pass = temps[di] <= 7.0; return (<Box key={d} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}><Typography sx={{ fontSize: 5, color: '#64748b', width: 18 }}>{d}</Typography><Box sx={{ flex: 1, height: 6, bgcolor: '#1e293b', borderRadius: 1, overflow: 'hidden' }}><Box sx={{ width: `${(temps[di] / 10) * 100}%`, height: '100%', bgcolor: pass ? '#22c55e' : '#ef4444', borderRadius: 1 }} /></Box><Typography sx={{ fontSize: 6, color: pass ? '#22c55e' : '#ef4444', fontWeight: 600, width: 24, textAlign: 'right' }}>{temps[di]}°C</Typography></Box>); })}<Box sx={{ mt: 0.3, px: 0.5, py: 0.2, bgcolor: alpha('#22c55e', 0.1), borderRadius: 0.5, textAlign: 'center' }}><Typography sx={{ fontSize: 6, color: '#22c55e' }}>✓ 6/7 days compliant — ≤7.0°C</Typography></Box></SB> },
                { label: 'Pass Rate', component: <SB label="Pass Rate"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Monthly Compliance Rate</Typography><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70%' }}><Box sx={{ position: 'relative', width: 70, height: 70 }}><svg width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="28" fill="none" stroke="#1e293b" strokeWidth="6" /><circle cx="35" cy="35" r="28" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 28 * 0.94} ${2 * Math.PI * 28}`} strokeLinecap="round" transform="rotate(-90 35 35)" /></svg><Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontSize: 14, color: '#22c55e', fontWeight: 800 }}>94%</Typography></Box></Box></Box></SB> },
                { label: 'Heatmap', component: <SB label="Heatmap"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Weekly Temp Heatmap</Typography><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1.5 }}>{[[5.8,6.2,6.1,5.9,6.8,7.4,6.0],[6.1,5.9,6.3,6.0,6.5,7.1,5.8],[5.7,6.0,6.4,6.2,6.9,7.2,5.9],[6.0,5.8,6.1,6.3,7.0,7.5,6.2]].map((row, ri) => (row.map((t, ci) => (<Box key={`${ri}-${ci}`} sx={{ aspectRatio: '1', borderRadius: 0.5, bgcolor: t <= 7.0 ? alpha('#22c55e', 0.15 + (t - 5) * 0.1) : alpha('#ef4444', 0.4), border: `1px solid ${t <= 7.0 ? alpha('#22c55e', 0.3) : alpha('#ef4444', 0.5)}` }} />))))}</Box><Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.3 }}>{['W1', 'W2', 'W3', 'W4'].map(w => <Typography key={w} sx={{ fontSize: 5, color: '#64748b', textAlign: 'center', flex: 1 }}>{w}</Typography>)}</Box></SB> },
              ];
              case 'app-4': return [
                { label: 'Replacement Forecast', component: <SB label="Capex"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>5-Year Capex Projection (RM K)</Typography><Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: '65%', px: 2 }}>{[120, 180, 250, 340, 280].map((h, i) => (<Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.2 }}><Typography sx={{ fontSize: 6, color: '#e2e8f0', fontWeight: 600 }}>{h}K</Typography><Box sx={{ width: '100%', height: `${(h / 340) * 80}%`, bgcolor: i < 2 ? '#3b82f6' : alpha('#3b82f6', 0.4), borderRadius: '2px 2px 0 0' }} /><Typography sx={{ fontSize: 5, color: '#64748b' }}>{2026 + i}</Typography></Box>))}</Box></SB> },
                { label: 'Priority Matrix', component: <SB label="Matrix"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Condition vs Age Matrix</Typography><Box sx={{ width: '100%', height: '70%', position: 'relative', borderLeft: '1px solid #334155', borderBottom: '1px solid #334155' }}><Typography sx={{ position: 'absolute', left: -2, top: -8, fontSize: 5, color: '#64748b' }}>Condition</Typography><Typography sx={{ position: 'absolute', bottom: -8, right: 2, fontSize: 5, color: '#64748b' }}>Age</Typography>{[[30,20,'#ef4444'],[60,35,'#f59e0b'],[45,60,'#22c55e'],[80,50,'#f59e0b'],[25,75,'#ef4444'],[70,20,'#22c55e']].map(([x,y,c], i) => (<Box key={i} sx={{ position: 'absolute', left: `${x}%`, bottom: `${y}%`, width: 8, height: 8, borderRadius: '50%', bgcolor: c, opacity: 0.8, transform: 'translate(-50%, 50%)' }} />))}</Box></SB> },
                { label: 'Lifecycle Timeline', component: <SB label="Timeline"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Asset Replacement Timeline</Typography>{['CH-01 Chiller', 'AHU-03 AHU', 'PMP-02 Pump', 'GEN-01 Gen'].map((a, i) => { const start = [10, 30, 55, 5]; const width = [40, 25, 20, 60]; const color = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']; return (<Box key={a} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}><Typography sx={{ fontSize: 5, color: '#94a3b8', width: 55, flexShrink: 0 }}>{a}</Typography><Box sx={{ flex: 1, height: 8, bgcolor: '#1e293b', borderRadius: 1, position: 'relative' }}><Box sx={{ position: 'absolute', left: `${start[i]}%`, top: 0, width: `${width[i]}%`, height: '100%', bgcolor: color[i], borderRadius: 1, opacity: 0.7 }} /></Box></Box>); })}<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.2 }}>{['2026', '2027', '2028', '2029', '2030'].map(y => <Typography key={y} sx={{ fontSize: 4, color: '#475569' }}>{y}</Typography>)}</Box></SB> },
              ];
              case 'app-5': return [
                { label: 'Drill Schedule', component: <SB label="Schedule"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Upcoming Drills — Q2 2026</Typography>{[{ t: 'Fire Evac — Block A', d: 'Apr 28', s: 'Scheduled', c: '#3b82f6' }, { t: 'Earthquake Drill', d: 'May 12', s: 'Scheduled', c: '#3b82f6' }, { t: 'Fire Evac — Block B', d: 'May 26', s: 'Draft', c: '#64748b' }, { t: 'BOMBA Inspection', d: 'Jun 05', s: 'Pending', c: '#f59e0b' }].map(dr => (<Box key={dr.t} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3, px: 0.5, py: 0.25, bgcolor: alpha(dr.c, 0.06), borderRadius: 0.5, border: `1px solid ${alpha(dr.c, 0.15)}` }}><Box sx={{ width: 5, height: 5, borderRadius: 0.5, bgcolor: dr.c }} /><Typography sx={{ fontSize: 6, color: '#e2e8f0', flex: 1 }}>{dr.t}</Typography><Typography sx={{ fontSize: 5, color: '#94a3b8' }}>{dr.d}</Typography><Typography sx={{ fontSize: 5, color: dr.c, fontWeight: 600 }}>{dr.s}</Typography></Box>))}</SB> },
                { label: 'Evacuation Time', component: <SB label="Evac"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Evacuation Times (min)</Typography><Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: '65%', px: 2 }}>{[{ l: 'Jan', h: 65 }, { l: 'Feb', h: 55 }, { l: 'Mar', h: 45 }, { l: 'Apr', h: 38 }].map(d => (<Box key={d.l} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.2 }}><Typography sx={{ fontSize: 6, color: d.h <= 45 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{d.h}m</Typography><Box sx={{ width: '100%', height: `${(d.h / 65) * 80}%`, bgcolor: d.h <= 45 ? alpha('#22c55e', 0.6) : alpha('#f59e0b', 0.6), borderRadius: '2px 2px 0 0' }} /><Typography sx={{ fontSize: 5, color: '#64748b' }}>{d.l}</Typography></Box>))}</Box></SB> },
                { label: 'Attendance', component: <SB label="Attendance"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Drill Attendance Rate</Typography><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70%' }}><Box sx={{ position: 'relative', width: 70, height: 70 }}><svg width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="28" fill="none" stroke="#1e293b" strokeWidth="6" /><circle cx="35" cy="35" r="28" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 28 * 0.96} ${2 * Math.PI * 28}`} strokeLinecap="round" transform="rotate(-90 35 35)" /></svg><Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontSize: 12, color: '#22c55e', fontWeight: 800 }}>96%</Typography><Typography sx={{ fontSize: 5, color: '#64748b' }}>attend</Typography></Box></Box></Box></SB> },
              ];
              case 'app-6': return [
                { label: 'Water Usage', component: <SB label="Usage"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Monthly Consumption (m³)</Typography><Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: '65%', px: 0.5 }}>{[780, 820, 847, 790, 860, 810, 840, 870, 830, 850, 845, 847].map((v, i) => (<Box key={i} sx={{ flex: 1, height: `${(v / 870) * 90}%`, bgcolor: i === 11 ? '#00A3A1' : alpha('#3b82f6', 0.5), borderRadius: '2px 2px 0 0' }} />))}</Box></SB> },
                { label: 'Anomaly Detection', component: <SB label="Anomaly"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Daily Flow — With Anomalies</Typography><Box sx={{ height: '70%', position: 'relative' }}><svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none"><polyline fill={alpha('#3b82f6', 0.1)} stroke="none" points="0,40 20,38 40,42 60,39 80,10 100,41 120,40 140,38 160,42 180,39 200,40 200,80 0,80" /><polyline fill="none" stroke="#3b82f6" strokeWidth="2" points="0,40 20,38 40,42 60,39 80,10 100,41 120,40 140,38 160,42 180,39 200,40" /><circle cx="80" cy="10" r="4" fill="#ef4444" /></svg><Box sx={{ position: 'absolute', right: 5, bottom: 5, bgcolor: alpha('#ef4444', 0.15), px: 0.5, borderRadius: 0.5 }}><Typography sx={{ fontSize: 6, color: '#ef4444', fontWeight: 600 }}>⚠ Anomaly Mar 8</Typography></Box></Box></SB> },
                { label: 'Cost Breakdown', component: <SB label="Cost"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Water Cost by Zone (RM)</Typography>{[{ z: 'Block A', v: 4200, w: 80, c: '#3b82f6' }, { z: 'Block B', v: 3100, w: 60, c: '#8b5cf6' }, { z: 'Common', v: 1800, w: 35, c: '#f59e0b' }, { z: 'Landscape', v: 950, w: 18, c: '#22c55e' }].map(r => (<Box key={r.z} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}><Typography sx={{ fontSize: 5, color: '#94a3b8', width: 40, flexShrink: 0 }}>{r.z}</Typography><Box sx={{ flex: 1, height: 7, bgcolor: '#1e293b', borderRadius: 1, overflow: 'hidden' }}><Box sx={{ width: `${r.w}%`, height: '100%', bgcolor: r.c, borderRadius: 1 }} /></Box><Typography sx={{ fontSize: 6, color: '#e2e8f0', fontWeight: 600, width: 30, textAlign: 'right' }}>RM{r.v}</Typography></Box>))}</SB> },
              ];
              case 'app-7': return [
                { label: 'Breach Summary', component: <SB label="Breaches"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>SLA Breaches — Last 30 Days</Typography><Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>{[{ v: 6, l: 'Total', c: '#ef4444' }, { v: 3, l: 'Critical', c: '#ef4444' }, { v: 2, l: 'High', c: '#f59e0b' }, { v: 1, l: 'Medium', c: '#3b82f6' }].map(s => (<Box key={s.l} sx={{ flex: 1, height: 28, bgcolor: alpha(s.c, 0.1), borderRadius: 0.5, border: `1px solid ${alpha(s.c, 0.25)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontSize: 8, color: s.c, fontWeight: 700, lineHeight: 1 }}>{s.v}</Typography><Typography sx={{ fontSize: 4.5, color: '#94a3b8' }}>{s.l}</Typography></Box>))}</Box><Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: '45%', px: 0.5 }}>{[2, 1, 0, 1, 0, 2].map((h, i) => (<Box key={i} sx={{ flex: 1, height: h > 0 ? `${h * 35}%` : 3, bgcolor: h > 0 ? '#ef4444' : '#22c55e', borderRadius: '2px 2px 0 0' }} />))}</Box></SB> },
                { label: 'Root Causes', component: <SB label="Root Cause"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Breach Root Cause Analysis</Typography>{[{ c: 'Slow response', p: 45, col: '#ef4444' }, { c: 'Parts delay', p: 25, col: '#f59e0b' }, { c: 'Skill gap', p: 18, col: '#3b82f6' }, { c: 'Other', p: 12, col: '#64748b' }].map(rc => (<Box key={rc.c} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}><Typography sx={{ fontSize: 5, color: '#e2e8f0', width: 50, flexShrink: 0 }}>{rc.c}</Typography><Box sx={{ flex: 1, height: 7, bgcolor: '#1e293b', borderRadius: 1, overflow: 'hidden' }}><Box sx={{ width: `${rc.p}%`, height: '100%', bgcolor: rc.col, borderRadius: 1 }} /></Box><Typography sx={{ fontSize: 6, color: rc.col, fontWeight: 600, width: 20, textAlign: 'right' }}>{rc.p}%</Typography></Box>))}</SB> },
                { label: 'Breach Trend', component: <SB label="Trend"><Typography sx={{ fontSize: 6, color: '#94a3b8', mb: 0.3 }}>Breach Trend — 6 Months</Typography><Box sx={{ height: '70%', position: 'relative' }}><svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none"><polyline fill={alpha('#ef4444', 0.1)} stroke="none" points="0,20 40,30 80,35 120,45 160,55 200,60 200,80 0,80" /><polyline fill="none" stroke="#ef4444" strokeWidth="2" points="0,20 40,30 80,35 120,45 160,55 200,60" /><polyline fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2" points="0,70 200,70" /></svg><Box sx={{ position: 'absolute', right: 5, top: 2, bgcolor: alpha('#22c55e', 0.15), px: 0.5, borderRadius: 0.5 }}><Typography sx={{ fontSize: 7, color: '#22c55e', fontWeight: 700 }}>↓ Improving</Typography></Box></Box></SB> },
              ];
              default: return [
                { label: 'Overview', component: <SB label="Overview"><Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontSize: 14, color: '#64748b' }}>📊</Typography></Box></SB> },
                { label: 'Data', component: <SB label="Data"><Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontSize: 14, color: '#64748b' }}>📈</Typography></Box></SB> },
                { label: 'Config', component: <SB label="Config"><Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontSize: 14, color: '#64748b' }}>⚙️</Typography></Box></SB> },
              ];
            }
          };

          const screenshots = getAppScreenshots(app.id);

          return (
            <Dialog
              open={true}
              onClose={() => setDetailAppId(null)}
              maxWidth="md"
              fullWidth
              PaperProps={{ sx: { borderRadius: 3 } }}
            >
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 44, height: 44, fontSize: 22 }}>{app.icon}</Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{app.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      {app.generatedBy === 'ai' && <Chip size="small" label="AI Generated" sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha('#8b5cf6', 0.15), color: '#7c3aed' }} />}
                      {app.generatedBy === 'builtin' && <Chip size="small" label="Built-in" sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha('#3b82f6', 0.15), color: '#2563eb' }} />}
                      <Typography variant="caption" color="text.secondary">{app.usageCount} uses</Typography>
                    </Box>
                  </Box>
                </Box>
                <IconButton onClick={() => setDetailAppId(null)}><CloseIcon /></IconButton>
              </DialogTitle>

              <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ p: 3 }}>
                  {/* Description */}
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>About</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>{app.description}</Typography>

                  {/* Screenshots */}
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Screenshots</Typography>
                  <Grid container spacing={1.5} sx={{ mb: 3 }}>
                    {screenshots.map((ss, i) => (
                      <Grid size={{ xs: 4 }} key={i}>
                        <Box sx={{
                          aspectRatio: '16/10',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.03)' },
                          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                          overflow: 'hidden',
                          position: 'relative',
                        }}>
                          {ss.component}
                          <Typography variant="caption" sx={{ position: 'absolute', bottom: 2, left: 6, color: '#94a3b8', fontWeight: 500, fontSize: '0.55rem' }}>{ss.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Data Sources */}
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Data Sources</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3 }}>
                    {app.dataSources.map(ds => (
                      <Chip key={ds} size="small" label={ds} variant="outlined" sx={{ height: 24, fontSize: '0.7rem' }} />
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Comments */}
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Team Feedback</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Rating value={4.5} precision={0.5} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">4.5 avg · {comments.length} reviews</Typography>
                  </Box>
                  {comments.map((c, i) => (
                    <Box key={i} sx={{ mb: 2, pb: 2, borderBottom: i < comments.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main' }}>{c.avatar}</Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>{c.user}</Typography>
                            <Chip size="small" label={c.role} sx={{ height: 16, fontSize: '0.6rem', bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">{c.date}</Typography>
                        </Box>
                        <Rating value={c.rating} readOnly size="small" sx={{ '& .MuiRating-icon': { fontSize: '0.9rem' } }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ pl: 4.5, lineHeight: 1.6 }}>{c.text}</Typography>
                    </Box>
                  ))}
                </Box>
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button variant="outlined" onClick={() => setDetailAppId(null)}>Close</Button>
                {!app.installed ? (
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
                    setApps(prev => prev.map(a => a.id === app.id ? { ...a, installed: true } : a));
                    setDetailAppId(null);
                    setSnackbar(`${app.name} installed`);
                  }}>Install App</Button>
                ) : (
                  <Button variant="contained" startIcon={<DashboardIcon />} onClick={() => {
                    togglePublishedApp(app.id);
                    setDetailAppId(null);
                    setSnackbar(publishedApps.includes(app.id) ? 'Removed from Dashboard' : 'Published to Dashboard');
                  }}>{publishedApps.includes(app.id) ? 'Remove from Dashboard' : 'Publish to Dashboard'}</Button>
                )}
              </DialogActions>
            </Dialog>
          );
        })()}
      </Box>
    </AnimatedPage>
  );
}
