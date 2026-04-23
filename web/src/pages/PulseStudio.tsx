import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Button, TextField,
  Grid2 as Grid, IconButton, Divider, alpha, useTheme, Paper,
  Avatar, Menu, MenuItem, Snackbar, Alert, Tooltip, Badge,
} from '@mui/material';
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
                          <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{app.name}</Typography>
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
      </Box>
    </AnimatedPage>
  );
}
