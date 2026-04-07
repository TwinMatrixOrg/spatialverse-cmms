import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid2 as Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Bolt as BoltIcon,
  CheckCircle as AckIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import {
  Asset,
  AssetType,
  SensorReading,
  SensorStatus,
  SensorType,
  ThresholdRule,
} from '../data/mockData';
import { useStore } from '../store/useStore';

const sensorOrder: SensorType[] = ['temperature', 'humidity', 'vibration', 'powerDraw', 'pressure'];

const sensorLabels: Record<SensorType, string> = {
  temperature: 'Temperature',
  humidity: 'Humidity',
  vibration: 'Vibration',
  powerDraw: 'Power Draw',
  pressure: 'Pressure',
};

const statusColors: Record<SensorStatus, string> = {
  normal: '#43A047',
  warning: '#FB8C00',
  critical: '#E53935',
};

const sensorStatusLabel: Record<SensorStatus, string> = {
  normal: 'Normal',
  warning: 'Warning',
  critical: 'Critical',
};

type SensorSummary = {
  sensorType: SensorType;
  sensor: SensorReading;
  threshold: { warning: number; critical: number };
  status: SensorStatus;
};

type EvaluatedAsset = {
  asset: Asset;
  status: SensorStatus;
  sensors: SensorSummary[];
};

function SensorGauge({
  label,
  value,
  min,
  max,
  unit,
  status,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  status: SensorStatus;
}) {
  const progress = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mb: 0.5 }}>
      <svg width="130" height="130" viewBox="0 0 130 130" role="img" aria-label={`${label} gauge`}>
        <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke={statusColors[status]}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 65 65)"
        />
        <text x="65" y="56" textAnchor="middle" style={{ fontSize: 11, fill: '#94A3B8' }}>
          {label}
        </text>
        <text x="65" y="74" textAnchor="middle" style={{ fontSize: 21, fontWeight: 700, fill: '#F8FAFC' }}>
          {value}
        </text>
        <text x="65" y="87" textAnchor="middle" style={{ fontSize: 11, fill: '#CBD5E1' }}>
          {unit}
        </text>
      </svg>
      <Typography variant="caption" color="text.secondary">{`Min ${min} • Max ${max}`}</Typography>
    </Box>
  );
}

const applyRuleThreshold = (
  assetType: AssetType,
  sensorType: SensorType,
  fallback: SensorReading['threshold'],
  rules: ThresholdRule[]
) => {
  const applicableRules = rules.filter(
    (rule) =>
      rule.enabled &&
      rule.sensorType === sensorType &&
      (rule.assetType === 'all' || rule.assetType === assetType)
  );

  if (!applicableRules.length) {
    return fallback;
  }

  const warning = Math.min(fallback.warning, ...applicableRules.map((rule) => rule.warning));
  const critical = Math.min(fallback.critical, ...applicableRules.map((rule) => rule.critical));

  return {
    warning,
    critical: Math.max(critical, warning + 0.2),
  };
};

const getSensorStatus = (value: number, threshold: { warning: number; critical: number }): SensorStatus => {
  if (value >= threshold.critical) {
    return 'critical';
  }

  if (value >= threshold.warning) {
    return 'warning';
  }

  return 'normal';
};

export default function ConditionMonitoring() {
  const theme = useTheme();
  const {
    selectedSiteId,
    monitoredAssets,
    thresholdRules,
    acknowledgedAlerts,
    updateSensorReadings,
    addThresholdRule,
    toggleThresholdRule,
    acknowledgeAlert,
    createWorkOrder,
  } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | SensorStatus>('all');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [newRule, setNewRule] = useState<{
    name: string;
    assetType: AssetType | 'all';
    sensorType: SensorType;
    warning: string;
    critical: string;
    autoCreateWorkOrder: boolean;
  }>({
    name: '',
    assetType: 'all',
    sensorType: 'temperature',
    warning: '',
    critical: '',
    autoCreateWorkOrder: true,
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      updateSensorReadings();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [updateSensorReadings]);

  const evaluatedAssets = useMemo<EvaluatedAsset[]>(() => {
    const siteScopedAssets = selectedSiteId
      ? monitoredAssets.filter((asset) => asset.siteId === selectedSiteId)
      : monitoredAssets;

    return siteScopedAssets
      .map((asset) => {
        const sensors = sensorOrder.reduce<SensorSummary[]>((accumulator, sensorType) => {
          const sensor = asset.sensors?.[sensorType];
          if (!sensor) {
            return accumulator;
          }

          const threshold = applyRuleThreshold(asset.type, sensorType, sensor.threshold, thresholdRules);
          const status = getSensorStatus(sensor.value, threshold);

          return [
            ...accumulator,
            {
              sensorType,
              sensor,
              threshold,
              status,
            },
          ];
        }, []);

        const status: SensorStatus = sensors.some((entry) => entry.status === 'critical')
          ? 'critical'
          : sensors.some((entry) => entry.status === 'warning')
            ? 'warning'
            : 'normal';

        return {
          asset,
          status,
          sensors,
        };
      })
      .filter((entry) => entry.sensors.length > 0);
  }, [monitoredAssets, selectedSiteId, thresholdRules]);

  const filteredAssets = useMemo(() => {
    if (statusFilter === 'all') {
      return evaluatedAssets;
    }

    return evaluatedAssets.filter((asset) => asset.status === statusFilter);
  }, [evaluatedAssets, statusFilter]);

  useEffect(() => {
    if (!filteredAssets.length) {
      setSelectedAssetId(null);
      return;
    }

    if (!selectedAssetId || !filteredAssets.some((asset) => asset.asset.id === selectedAssetId)) {
      setSelectedAssetId(filteredAssets[0].asset.id);
    }
  }, [filteredAssets, selectedAssetId]);

  const selectedAsset = filteredAssets.find((asset) => asset.asset.id === selectedAssetId) || filteredAssets[0] || null;

  const activeAlerts = useMemo(() => {
    return evaluatedAssets
      .flatMap((assetEntry) =>
        assetEntry.sensors
          .filter((sensor) => sensor.status !== 'normal')
          .map((sensor) => ({
            id: `${assetEntry.asset.id}-${sensor.sensorType}`,
            assetId: assetEntry.asset.id,
            assetName: assetEntry.asset.name,
            sensorType: sensor.sensorType,
            value: sensor.sensor.value,
            unit: sensor.sensor.unit,
            status: sensor.status,
          }))
      )
      .filter((alert) => !acknowledgedAlerts.includes(alert.id))
      .sort((left, right) => (left.status === right.status ? 0 : left.status === 'critical' ? -1 : 1));
  }, [acknowledgedAlerts, evaluatedAssets]);

  const handleAddRule = () => {
    const warning = Number.parseFloat(newRule.warning);
    const critical = Number.parseFloat(newRule.critical);

    if (!newRule.name.trim() || !Number.isFinite(warning) || !Number.isFinite(critical) || critical <= warning) {
      setSnackbarMessage('Please provide valid rule values (critical must be greater than warning).');
      return;
    }

    addThresholdRule({
      name: newRule.name.trim(),
      description: `${sensorLabels[newRule.sensorType]} threshold for ${newRule.assetType}`,
      assetType: newRule.assetType,
      sensorType: newRule.sensorType,
      warning,
      critical,
      enabled: true,
      autoCreateWorkOrder: newRule.autoCreateWorkOrder,
    });

    setNewRule({
      name: '',
      assetType: 'all',
      sensorType: 'temperature',
      warning: '',
      critical: '',
      autoCreateWorkOrder: true,
    });
  };

  const handleAutoCreateWO = () => {
    if (!selectedAsset || selectedAsset.status !== 'critical') {
      return;
    }

    const criticalSensors = selectedAsset.sensors
      .filter((sensor) => sensor.status === 'critical')
      .map((sensor) => `${sensorLabels[sensor.sensorType]} ${sensor.sensor.value}${sensor.sensor.unit}`)
      .join(', ');

    const workOrder = createWorkOrder({
      assetId: selectedAsset.asset.id,
      faultType: 'Condition Monitoring Alert',
      description: `Auto-created from condition monitoring. Critical readings: ${criticalSensors}.`,
      priority: 'P1',
    });

    setSnackbarMessage(`Work order ${workOrder.number} auto-created for ${selectedAsset.asset.name}.`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '1.95rem' } }}>
          Condition Monitoring
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.8, borderRadius: 2, bgcolor: alpha('#2E7D32', 0.15) }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: '#43A047',
              animation: 'pulseGreen 1.4s ease-in-out infinite',
              '@keyframes pulseGreen': {
                '0%': { transform: 'scale(1)', opacity: 1 },
                '70%': { transform: 'scale(1.6)', opacity: 0.35 },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            }}
          />
          <Typography sx={{ color: '#66BB6A', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.75rem' }}>
            LIVE
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: '76vh' }}>
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Asset Sensor Status
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                color="primary"
                value={statusFilter}
                onChange={(_, nextFilter: 'all' | SensorStatus | null) => {
                  if (nextFilter) {
                    setStatusFilter(nextFilter);
                  }
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="normal">Normal</ToggleButton>
                <ToggleButton value="warning">Warning</ToggleButton>
                <ToggleButton value="critical">Critical</ToggleButton>
              </ToggleButtonGroup>
              <Stack spacing={1} sx={{ overflow: 'auto', pr: 0.5 }}>
                {filteredAssets.map((assetEntry) => (
                  <Card
                    key={assetEntry.asset.id}
                    onClick={() => setSelectedAssetId(assetEntry.asset.id)}
                    variant="outlined"
                    sx={{
                      borderWidth: 1.5,
                      borderColor:
                        selectedAsset?.asset.id === assetEntry.asset.id
                          ? theme.palette.primary.main
                          : alpha(theme.palette.divider, 0.9),
                      cursor: 'pointer',
                    }}
                  >
                    <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center', mb: 0.8 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {assetEntry.asset.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={sensorStatusLabel[assetEntry.status]}
                          sx={{
                            bgcolor: alpha(statusColors[assetEntry.status], 0.2),
                            color: statusColors[assetEntry.status],
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        />
                      </Box>
                      <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap">
                        {assetEntry.sensors.map((sensor) => (
                          <Tooltip key={`${assetEntry.asset.id}-${sensor.sensorType}`} title={`${sensorLabels[sensor.sensorType]} threshold ${sensor.threshold.warning}/${sensor.threshold.critical}`}>
                            <Chip
                              size="small"
                              label={`${sensorLabels[sensor.sensorType]} ${sensor.sensor.value}${sensor.sensor.unit}`}
                              sx={{
                                bgcolor: alpha(statusColors[sensor.status], 0.14),
                                color: statusColors[sensor.status],
                                fontWeight: 500,
                                fontSize: '0.65rem',
                              }}
                            />
                          </Tooltip>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
                {!filteredAssets.length && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                    No assets match the selected status filter.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '76vh' }}>
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {selectedAsset ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {selectedAsset.asset.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {`${selectedAsset.asset.type} • ${selectedAsset.asset.floor || 'N/A'} • ${selectedAsset.asset.zone || 'N/A'}`}
                      </Typography>
                    </Box>
                    {selectedAsset.status === 'critical' && (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<BoltIcon />}
                        onClick={handleAutoCreateWO}
                      >
                        Auto-Create WO
                      </Button>
                    )}
                  </Box>

                  <Grid container spacing={1.5} sx={{ overflow: 'auto', pr: 0.5 }}>
                    {selectedAsset.sensors.map((sensorEntry) => {
                      const chartData = (selectedAsset.asset.sensorHistory || []).map((point) => ({
                        time: format(new Date(point.timestamp), 'HH:mm'),
                        value: point.readings[sensorEntry.sensorType],
                        warning: sensorEntry.threshold.warning,
                        critical: sensorEntry.threshold.critical,
                      }));

                      return (
                        <Grid size={{ xs: 12, lg: 6 }} key={`${selectedAsset.asset.id}-${sensorEntry.sensorType}`}>
                          <Card variant="outlined" sx={{ p: 1.4 }}>
                            <SensorGauge
                              label={sensorLabels[sensorEntry.sensorType]}
                              value={sensorEntry.sensor.value}
                              min={sensorEntry.sensor.min}
                              max={sensorEntry.sensor.max}
                              unit={sensorEntry.sensor.unit}
                              status={sensorEntry.status}
                            />
                            <Box sx={{ height: 120 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 6, right: 6, left: -24, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="2 2" stroke={alpha('#94A3B8', 0.25)} />
                                  <XAxis dataKey="time" hide />
                                  <YAxis width={28} tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                                  <RechartsTooltip />
                                  <ReferenceLine y={sensorEntry.threshold.warning} stroke="#FB8C00" strokeDasharray="4 4" />
                                  <ReferenceLine y={sensorEntry.threshold.critical} stroke="#E53935" strokeDasharray="4 4" />
                                  <Line
                                    type="monotone"
                                    dataKey="value"
                                    dot={false}
                                    strokeWidth={2.2}
                                    stroke={statusColors[sensorEntry.status]}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </Box>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">Select an asset to inspect live sensor data.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ height: '76vh' }}>
            <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Threshold Rules
              </Typography>

              <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha('#E53935', 0.1), border: `1px solid ${alpha('#E53935', 0.3)}` }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.8 }}>
                  Active Alerts ({activeAlerts.length})
                </Typography>
                <Stack spacing={0.8} sx={{ maxHeight: 170, overflow: 'auto', pr: 0.5 }}>
                  {activeAlerts.map((alert) => (
                    <Box key={alert.id} sx={{ p: 0.9, borderRadius: 1.5, bgcolor: alpha('#0B1221', 0.25) }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Stack direction="row" spacing={0.6} alignItems="center">
                          {alert.status === 'critical' && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#E53935',
                                animation: 'pulseRed 1.2s ease-in-out infinite',
                                '@keyframes pulseRed': {
                                  '0%': { transform: 'scale(1)', opacity: 1 },
                                  '70%': { transform: 'scale(1.7)', opacity: 0.45 },
                                  '100%': { transform: 'scale(1)', opacity: 1 },
                                },
                              }}
                            />
                          )}
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {alert.assetName}
                          </Typography>
                        </Stack>
                        <Button
                          size="small"
                          color="inherit"
                          startIcon={<AckIcon />}
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Ack
                        </Button>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {`${sensorLabels[alert.sensorType]} ${alert.value}${alert.unit}`}
                      </Typography>
                    </Box>
                  ))}
                  {!activeAlerts.length && (
                    <Typography variant="caption" color="text.secondary">
                      No active sensor alerts.
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Stack spacing={1} sx={{ flex: 1, overflow: 'auto', pr: 0.5 }}>
                {thresholdRules.map((rule) => (
                  <Card key={rule.id} variant="outlined" sx={{ p: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {rule.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {`${rule.assetType} • ${sensorLabels[rule.sensorType]} ${rule.warning}/${rule.critical}`}
                        </Typography>
                      </Box>
                      <Switch checked={rule.enabled} onChange={() => toggleThresholdRule(rule.id)} />
                    </Box>
                  </Card>
                ))}
              </Stack>

              <Card variant="outlined" sx={{ p: 1.2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  Add Rule
                </Typography>
                <Stack spacing={1}>
                  <TextField
                    size="small"
                    label="Rule Name"
                    value={newRule.name}
                    onChange={(event) => setNewRule((state) => ({ ...state, name: event.target.value }))}
                  />
                  <FormControl size="small">
                    <InputLabel>Asset Type</InputLabel>
                    <Select
                      label="Asset Type"
                      value={newRule.assetType}
                      onChange={(event) =>
                        setNewRule((state) => ({ ...state, assetType: event.target.value as AssetType | 'all' }))
                      }
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="HVAC">HVAC</MenuItem>
                      <MenuItem value="Elevator">Elevator</MenuItem>
                      <MenuItem value="Electrical">Electrical</MenuItem>
                      <MenuItem value="Plumbing">Plumbing</MenuItem>
                      <MenuItem value="Fire Safety">Fire Safety</MenuItem>
                      <MenuItem value="IT/AV">IT/AV</MenuItem>
                      <MenuItem value="Structural">Structural</MenuItem>
                      <MenuItem value="General">General</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>Sensor</InputLabel>
                    <Select
                      label="Sensor"
                      value={newRule.sensorType}
                      onChange={(event) => setNewRule((state) => ({ ...state, sensorType: event.target.value as SensorType }))}
                    >
                      {sensorOrder.map((sensorType) => (
                        <MenuItem key={sensorType} value={sensorType}>
                          {sensorLabels[sensorType]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      label="Warning"
                      type="number"
                      value={newRule.warning}
                      onChange={(event) => setNewRule((state) => ({ ...state, warning: event.target.value }))}
                    />
                    <TextField
                      size="small"
                      label="Critical"
                      type="number"
                      value={newRule.critical}
                      onChange={(event) => setNewRule((state) => ({ ...state, critical: event.target.value }))}
                    />
                  </Stack>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddRule}
                  >
                    Add Rule
                  </Button>
                </Stack>
              </Card>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3200}
        onClose={() => setSnackbarMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbarMessage.includes('valid') ? 'warning' : 'success'}
          onClose={() => setSnackbarMessage('')}
          icon={snackbarMessage.includes('valid') ? <WarningIcon /> : undefined}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
