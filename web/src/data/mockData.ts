// Mock data for SpatialVerse Pulse - AWC Malaysia Properties

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type WorkOrderStatus = 'open' | 'assigned' | 'in_progress' | 'pending_parts' | 'resolved' | 'closed';
export type WorkOrderApprovalStatus = 'not_required' | 'pending_supervisor' | 'pending_manager' | 'approved' | 'rejected';
export type WorkOrderApprovalRole = 'Supervisor' | 'FM Manager';
export type AssetType = 'HVAC' | 'Electrical' | 'Plumbing' | 'Fire Safety' | 'Elevator' | 'Structural' | 'IT/AV' | 'General';
export type AssetHealthStatus = 'critical' | 'warning' | 'good';
export type SensorType = 'temperature' | 'humidity' | 'vibration' | 'powerDraw' | 'pressure';
export type SensorStatus = 'normal' | 'warning' | 'critical';
export type SensorUnit = '°C' | '%' | 'mm/s' | 'kW' | 'bar';
export type PMFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
export type PMStatus = 'upcoming' | 'overdue' | 'done';
export type PermitType = 'hot_work' | 'confined_space' | 'electrical_isolation' | 'working_at_height' | 'general';
export type PermitStatus = 'draft' | 'issued' | 'active' | 'closed' | 'cancelled';
export type PermitRiskLevel = 'low' | 'medium' | 'high';
export type PermitChecklistPhase = 'pre' | 'during' | 'post';
export type RootCause =
  | 'age_wear'
  | 'abuse_misuse'
  | 'design_flaw'
  | 'installation_error'
  | 'environmental'
  | 'unknown';

export interface WorkOrderApprovalStep {
  level: 1 | 2;
  role: WorkOrderApprovalRole;
  approverId?: string;
  approverName?: string;
  action?: 'approved' | 'rejected';
  comment?: string;
  timestamp?: string;
}

export interface WorkOrderChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface WorkOrderTimelineEntry {
  id: string;
  type: string;
  description: string;
  userId: string;
  createdAt: string;
}

export interface WorkOrderComment {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
}

export interface WorkOrderLabourEntry {
  id: string;
  technicianId: string;
  technicianName: string;
  hours: number;
  ratePerHour: number;
  date: string;
  description?: string;
}

export interface WorkOrderPartUsedEntry {
  id: string;
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  date: string;
}

export interface AssetFailureEvent {
  date: string;
  woId: string;
  failureMode: string;
  rootCause: RootCause;
  downtimeHours: number;
}

export interface WorkOrderEscalationEntry {
  timestamp: string;
  notifiedRole: 'Supervisor' | 'FM Manager' | 'Director';
  notifiedName: string;
  method: 'system' | 'email' | 'sms';
  message: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  timezone: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'technician' | 'viewer';
  avatar?: string;
  siteIds: string[];
}

export interface SensorThreshold {
  warning: number;
  critical: number;
}

export interface SensorReading {
  value: number;
  unit: SensorUnit;
  threshold: SensorThreshold;
  min: number;
  max: number;
}

export interface AssetSensors {
  temperature?: SensorReading;
  humidity?: SensorReading;
  vibration?: SensorReading;
  powerDraw?: SensorReading;
  pressure?: SensorReading;
}

export interface SensorHistoryPoint {
  timestamp: string;
  readings: Record<string, number>;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  siteId: string;
  location: { lat: number; lng: number };
  floor?: string;
  zone?: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyExpiry?: string;
  healthScore: number;
  healthStatus: AssetHealthStatus;
  lastServiceDate?: string;
  openWorkOrdersCount: number;
  failureHistory?: AssetFailureEvent[];
  mtbfDays?: number;
  sensors?: AssetSensors;
  sensorHistory?: SensorHistoryPoint[];
  sensorStatus?: SensorStatus;
}

export interface WorkOrder {
  id: string;
  number: string;
  siteId: string;
  assetId: string;
  title: string;
  description: string;
  faultType: string;
  priority: Priority;
  status: WorkOrderStatus;
  assignedToId?: string;
  reportedById?: string;
  contractorId?: string;
  estimatedHours?: number;
  slaDeadline: string;
  slaBreached: boolean;
  slaBreachTime?: string;
  escalationLog: WorkOrderEscalationEntry[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  rootCause?: RootCause;
  correctiveAction?: string;
  failureMode?: string;
  checklist?: WorkOrderChecklistItem[];
  timeline?: WorkOrderTimelineEntry[];
  comments?: WorkOrderComment[];
  labourEntries: WorkOrderLabourEntry[];
  partsUsed: WorkOrderPartUsedEntry[];
  totalLabourCost: number;
  totalPartsCost: number;
  totalCost: number;
  approvalStatus?: WorkOrderApprovalStatus;
  approvalChain?: WorkOrderApprovalStep[];
}

export interface Contractor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  specialties: AssetType[];
  licenseNumber?: string;
  licenseExpiry?: string;
  insuranceExpiry?: string;
  performanceScore: number;
  avgResponseTime: number;
  completionRate: number;
  activeWorkOrdersCount: number;
  siteIds: string[];
}

export interface PMSchedule {
  id: string;
  name: string;
  assetId: string;
  siteId: string;
  frequency: PMFrequency;
  lastDoneDate?: string;
  nextDueDate: string;
  status: PMStatus;
  autoCreateWO: boolean;
  checklist: string[];
  assignedToId?: string;
  estimatedDuration: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  assetTypes: AssetType[];
  quantityOnHand: number;
  minimumStock: number;
  unitCost?: number;
  location?: string;
  siteId: string;
}

export interface Alert {
  id: string;
  type: 'sla_breach' | 'critical_fault' | 'low_stock' | 'license_expiry' | 'pm_overdue';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  relatedEntityId?: string;
  relatedEntityType?: 'work_order' | 'asset' | 'contractor' | 'inventory' | 'pm_schedule';
  createdAt: string;
}

export interface ThresholdRule {
  id: string;
  name: string;
  description?: string;
  assetType: AssetType | 'all';
  sensorType: SensorType;
  warning: number;
  critical: number;
  enabled: boolean;
  autoCreateWorkOrder: boolean;
}

export interface AppNotification {
  id: string;
  type: 'work_order' | 'pm' | 'inventory' | 'contractor';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'critical' | 'warning' | 'info';
}

export interface PermitSafetyChecklistItem {
  id: string;
  phase: PermitChecklistPhase;
  item: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface Permit {
  id: string;
  workOrderId: string;
  permitNumber: string;
  type: PermitType;
  status: PermitStatus;
  issuedById: string;
  issuedByName: string;
  validFrom: string;
  validTo: string;
  location: string;
  riskLevel: PermitRiskLevel;
  precautions: string[];
  safetyChecklist: PermitSafetyChecklistItem[];
}

export type UtilityType = 'Electricity' | 'Water' | 'Gas' | 'Chilled Water' | 'Sewerage';

export interface UtilityBill {
  id: string;
  utilityType: UtilityType;
  siteId: string;
  billingPeriod: string;
  amountRM: number;
  units: number;
  unitLabel: string;
  remarks?: string;
  recordedAt: string;
}

export interface MeterReading {
  id: string;
  utilityType: UtilityType;
  siteId: string;
  meterId: string;
  readingDate: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  unitLabel: string;
}

export type DLPSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type DLPStatus = 'open' | 'in_progress' | 'verified' | 'accepted';

export interface DLPDefect {
  id: string;
  defectNo: string;
  siteId: string;
  location: string;
  description: string;
  contractorId: string;
  severity: DLPSeverity;
  status: DLPStatus;
  reportedAt: string;
  targetRectificationDate: string;
  verifiedAt?: string;
  acceptedAt?: string;
  dlpExpiryDate: string;
}

export type DrawingFormat = 'CAD' | 'JPEG' | 'PDF';

export interface DrawingVersion {
  id: string;
  versionLabel: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  note?: string;
}

export interface DrawingDocument {
  id: string;
  documentNo: string;
  title: string;
  siteId: string;
  location: string;
  assetTag: string;
  format: DrawingFormat;
  discipline: string;
  currentVersion: string;
  uploadedBy: string;
  uploadedAt: string;
  versions: DrawingVersion[];
}

export type SpaceReservationStatus = 'pending' | 'approved' | 'rejected';

export interface SpaceReservation {
  id: string;
  siteId: string;
  room: string;
  startDateTime: string;
  endDateTime: string;
  requester: string;
  event: string;
  participants: number;
  status: SpaceReservationStatus;
  requestedAt: string;
  remarks?: string;
}

export interface KpiMonthlyRecord {
  id: string;
  month: string;
  css: number;
  customerRating: number;
  responseTime: number;
  pmCompliance: number;
  woCompletion: number;
  slaAdherence: number;
  apdDeductionRM: number;
}

// Sites - Malaysian Malls
export const sites: Site[] = [
  {
    id: 'site-1',
    name: 'Pavilion KL',
    address: '168 Jalan Bukit Bintang, 55100 Kuala Lumpur',
    location: { lat: 3.1488, lng: 101.7131 },
    timezone: 'Asia/Kuala_Lumpur',
  },
  {
    id: 'site-2',
    name: 'Sunway Pyramid',
    address: '3 Jalan PJS 11/15, Bandar Sunway, 47500 Subang Jaya',
    location: { lat: 3.0733, lng: 101.6078 },
    timezone: 'Asia/Kuala_Lumpur',
  },
  {
    id: 'site-3',
    name: 'Mid Valley Megamall',
    address: 'Mid Valley City, 58000 Kuala Lumpur',
    location: { lat: 3.1178, lng: 101.6773 },
    timezone: 'Asia/Kuala_Lumpur',
  },
];

// Users
export const users: User[] = [
  { id: 'user-1', email: 'ahmad@twinmatrix.com', firstName: 'Ahmad', lastName: 'Rahman', role: 'admin', siteIds: ['site-1', 'site-2', 'site-3'] },
  { id: 'user-2', email: 'lee@twinmatrix.com', firstName: 'Lee', lastName: 'Wei Ming', role: 'manager', siteIds: ['site-1'] },
  { id: 'user-3', email: 'kumar@twinmatrix.com', firstName: 'Kumar', lastName: 'Suresh', role: 'manager', siteIds: ['site-2'] },
  { id: 'user-4', email: 'fatimah@twinmatrix.com', firstName: 'Fatimah', lastName: 'Abdullah', role: 'manager', siteIds: ['site-3'] },
  { id: 'user-5', email: 'wong@twinmatrix.com', firstName: 'Wong', lastName: 'Chun Kit', role: 'technician', siteIds: ['site-1', 'site-2'] },
  { id: 'user-6', email: 'raj@twinmatrix.com', firstName: 'Raj', lastName: 'Krishnan', role: 'technician', siteIds: ['site-1', 'site-3'] },
  { id: 'user-7', email: 'mei@twinmatrix.com', firstName: 'Mei', lastName: 'Ling', role: 'technician', siteIds: ['site-2', 'site-3'] },
  { id: 'user-8', email: 'zain@twinmatrix.com', firstName: 'Zain', lastName: 'Hassan', role: 'technician', siteIds: ['site-1'] },
];

export const technicians = users.filter((user) => user.role === 'technician');

export const workOrderFaultTypes = [
  'Mechanical',
  'Electrical',
  'Plumbing',
  'Fire Safety',
  'HVAC',
  'IT/AV',
  'Structural',
  'Other',
] as const;

export const prioritySLAHours: Record<Priority, number> = {
  P1: 4,
  P2: 8,
  P3: 24,
  P4: 72,
};

export const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  pending_parts: 'Pending Parts',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const permitTypeLabels: Record<PermitType, string> = {
  hot_work: 'Hot Work',
  confined_space: 'Confined Space',
  electrical_isolation: 'Electrical Isolation',
  working_at_height: 'Working at Height',
  general: 'General',
};

export const permitStatusLabels: Record<PermitStatus, string> = {
  draft: 'Draft',
  issued: 'Issued',
  active: 'Active',
  closed: 'Closed',
  cancelled: 'Cancelled',
};

export const permitRiskLabels: Record<PermitRiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const nextStatusMap: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  open: ['assigned', 'in_progress', 'resolved'],
  assigned: ['in_progress', 'pending_parts', 'resolved'],
  in_progress: ['pending_parts', 'resolved'],
  pending_parts: ['assigned', 'in_progress', 'resolved'],
  resolved: ['closed'],
  closed: [],
};

const checklistTemplatesByType: Record<string, string[]> = {
  HVAC: ['Check refrigerant levels', 'Inspect filters', 'Test airflow', 'Check electrical connections', 'Log readings'],
  Mechanical: ['Inspect moving components', 'Verify alignment', 'Check lubrication points', 'Tighten mounting hardware', 'Log vibration readings'],
  Electrical: ['Lockout/tagout verification', 'Inspect breakers and relays', 'Check insulation resistance', 'Test voltage under load', 'Record measurements'],
  Plumbing: ['Check for visible leaks', 'Inspect valves and joints', 'Verify pressure levels', 'Flush and clean strainers', 'Log flow readings'],
  'Fire Safety': ['Check alarm panel status', 'Inspect detectors', 'Test audible/visual alarms', 'Verify pump pressure', 'Document compliance checklist'],
  'IT/AV': ['Check network connectivity', 'Inspect cable terminations', 'Validate device firmware', 'Run system diagnostics', 'Capture incident notes'],
  Structural: ['Inspect visible cracks', 'Check anchor points', 'Assess corrosion areas', 'Verify load-bearing condition', 'Photograph and log findings'],
  Other: ['Visual inspection', 'Functional check', 'Safety verification', 'Rectification action', 'Complete service notes'],
};

const defaultCommentTemplates = [
  { userId: 'user-2', message: 'Initial assessment completed. Monitoring for updates.' },
  { userId: 'user-5', message: 'Technician acknowledged and preparing required tools.' },
  { userId: 'user-3', message: 'Site operations notified. Access coordinated.' },
];

// Helper to generate dates
const now = new Date();
const addHours = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
const addDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();
const subDays = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

const sensorTypeOrder: SensorType[] = ['temperature', 'humidity', 'vibration', 'powerDraw', 'pressure'];

const sensorConfigs: Record<SensorType, Omit<SensorReading, 'value'>> = {
  temperature: {
    unit: '°C',
    threshold: { warning: 32, critical: 38 },
    min: 12,
    max: 60,
  },
  humidity: {
    unit: '%',
    threshold: { warning: 68, critical: 80 },
    min: 25,
    max: 95,
  },
  vibration: {
    unit: 'mm/s',
    threshold: { warning: 4.5, critical: 6.2 },
    min: 0.2,
    max: 12,
  },
  powerDraw: {
    unit: 'kW',
    threshold: { warning: 64, critical: 82 },
    min: 3,
    max: 140,
  },
  pressure: {
    unit: 'bar',
    threshold: { warning: 6.2, critical: 7.8 },
    min: 0.5,
    max: 12,
  },
};

const sensorsByAssetType: Record<AssetType, SensorType[]> = {
  HVAC: ['temperature', 'vibration', 'powerDraw'],
  Elevator: ['vibration', 'temperature'],
  Electrical: ['powerDraw', 'temperature'],
  Plumbing: ['pressure', 'temperature'],
  'Fire Safety': ['pressure'],
  Structural: ['temperature', 'humidity'],
  'IT/AV': ['temperature', 'humidity'],
  General: ['temperature', 'humidity'],
};

const clampSensor = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sensorPrecision: Record<SensorType, number> = {
  temperature: 1,
  humidity: 0,
  vibration: 2,
  powerDraw: 2,
  pressure: 2,
};

const roundSensorValue = (sensorType: SensorType, value: number) =>
  Number(value.toFixed(sensorPrecision[sensorType]));

const seedFromString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

const deterministicNoise = (seed: number) => {
  const raw = Math.sin(seed * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
};

const calculateSensorStatus = (sensors: AssetSensors): SensorStatus => {
  let status: SensorStatus = 'normal';

  sensorTypeOrder.forEach((sensorType) => {
    const sensor = sensors[sensorType];
    if (!sensor) {
      return;
    }

    if (sensor.value >= sensor.threshold.critical) {
      status = 'critical';
      return;
    }

    if (sensor.value >= sensor.threshold.warning && status !== 'critical') {
      status = 'warning';
    }
  });

  return status;
};

const createSensorReading = (
  asset: Pick<Asset, 'id' | 'healthStatus'>,
  sensorType: SensorType,
  sequence: number
): SensorReading => {
  const config = sensorConfigs[sensorType];
  const noiseSeed = seedFromString(`${asset.id}-${sensorType}-${sequence}`);
  const stateFactor: Record<AssetHealthStatus, number> = {
    good: 0.7,
    warning: 0.9,
    critical: 1.03,
  };

  const jitter = (deterministicNoise(noiseSeed) - 0.5) * 0.12;
  let rawValue = config.threshold.warning * (stateFactor[asset.healthStatus] + jitter);

  if (asset.healthStatus === 'critical') {
    rawValue = Math.max(rawValue, config.threshold.critical * (1 + deterministicNoise(noiseSeed + 11) * 0.06));
  }

  const value = roundSensorValue(sensorType, clampSensor(rawValue, config.min, config.max));

  return {
    value,
    unit: config.unit,
    threshold: { ...config.threshold },
    min: config.min,
    max: config.max,
  };
};

const createSensorsForAsset = (asset: Pick<Asset, 'id' | 'type' | 'healthStatus'>): AssetSensors => {
  const configuredSensors = sensorsByAssetType[asset.type] || ['temperature'];

  return configuredSensors.reduce<AssetSensors>((accumulator, sensorType, index) => {
    return {
      ...accumulator,
      [sensorType]: createSensorReading(asset, sensorType, index),
    };
  }, {});
};

const createSensorHistory = (assetId: string, sensors: AssetSensors): SensorHistoryPoint[] => {
  const nowTime = Date.now();

  return Array.from({ length: 24 }, (_, index) => {
    const hoursAgo = 23 - index;
    const timestamp = new Date(nowTime - hoursAgo * 60 * 60 * 1000).toISOString();
    const readings: Record<string, number> = {};

    sensorTypeOrder.forEach((sensorType) => {
      const sensor = sensors[sensorType];
      if (!sensor) {
        return;
      }

      const baseSeed = seedFromString(`${assetId}-${sensorType}`);
      const drift = Math.sin((index + baseSeed % 9) / 3.6) * sensor.value * 0.02;
      const randomNoise = (deterministicNoise(baseSeed + index * 17) - 0.5) * sensor.value * 0.03;
      const slowTrend = (index - 12) * sensor.value * 0.0015;
      const nextValue = clampSensor(sensor.value + drift + randomNoise + slowTrend, sensor.min, sensor.max);
      readings[sensorType] = roundSensorValue(sensorType, nextValue);
    });

    return { timestamp, readings };
  });
};

// Assets - 50+ across all sites
const baseAssets: Asset[] = [
  // Pavilion KL - HVAC
  { id: 'asset-1', name: 'AHU-PKL-01', type: 'HVAC', siteId: 'site-1', location: { lat: 3.1490, lng: 101.7133 }, floor: 'B2', zone: 'Zone A', description: 'Main Air Handling Unit - Level B2', manufacturer: 'Daikin', model: 'AHU-5000', serialNumber: 'DK2021-001', healthScore: 92, healthStatus: 'good', lastServiceDate: subDays(15), openWorkOrdersCount: 0 },
  {
    id: 'asset-2',
    name: 'AHU-PKL-02',
    type: 'HVAC',
    siteId: 'site-1',
    location: { lat: 3.1489, lng: 101.7135 },
    floor: 'B2',
    zone: 'Zone B',
    description: 'Air Handling Unit - Zone B',
    manufacturer: 'Daikin',
    model: 'AHU-3000',
    serialNumber: 'DK2021-002',
    healthScore: 45,
    healthStatus: 'critical',
    lastServiceDate: subDays(60),
    openWorkOrdersCount: 2,
    mtbfDays: 26,
    failureHistory: [
      { date: subDays(120), woId: 'wo-h-1001', failureMode: 'Supply fan bearing noise', rootCause: 'age_wear', downtimeHours: 3.5 },
      { date: subDays(74), woId: 'wo-h-1002', failureMode: 'Belt slippage', rootCause: 'installation_error', downtimeHours: 2 },
      { date: subDays(32), woId: 'wo-h-1003', failureMode: 'Motor overheating trip', rootCause: 'environmental', downtimeHours: 4.5 },
      { date: subDays(4), woId: 'wo-h-1004', failureMode: 'Compressor contactor chatter', rootCause: 'age_wear', downtimeHours: 2.8 },
    ],
  },
  { id: 'asset-3', name: 'Chiller-PKL-01', type: 'HVAC', siteId: 'site-1', location: { lat: 3.1487, lng: 101.7130 }, floor: 'B3', zone: 'Plant Room', description: 'Primary Chiller Unit', manufacturer: 'Carrier', model: 'CH-2000', serialNumber: 'CR2020-001', healthScore: 78, healthStatus: 'warning', lastServiceDate: subDays(30), openWorkOrdersCount: 1 },
  { id: 'asset-4', name: 'FCU-PKL-L1-01', type: 'HVAC', siteId: 'site-1', location: { lat: 3.1491, lng: 101.7132 }, floor: 'L1', zone: 'Main Atrium', description: 'Fan Coil Unit - Main Atrium', manufacturer: 'Trane', model: 'FCU-500', serialNumber: 'TR2022-001', healthScore: 95, healthStatus: 'good', lastServiceDate: subDays(7), openWorkOrdersCount: 0 },

  // Pavilion KL - Electrical
  { id: 'asset-5', name: 'MDB-PKL-01', type: 'Electrical', siteId: 'site-1', location: { lat: 3.1486, lng: 101.7129 }, floor: 'B3', zone: 'Electrical Room', description: 'Main Distribution Board', manufacturer: 'Schneider', model: 'Prisma P', serialNumber: 'SE2019-001', healthScore: 88, healthStatus: 'good', lastServiceDate: subDays(45), openWorkOrdersCount: 0 },
  { id: 'asset-6', name: 'Generator-PKL-01', type: 'Electrical', siteId: 'site-1', location: { lat: 3.1485, lng: 101.7128 }, floor: 'B3', zone: 'Generator Room', description: 'Emergency Backup Generator', manufacturer: 'Caterpillar', model: 'CAT 3512', serialNumber: 'CAT2018-001', healthScore: 82, healthStatus: 'good', lastServiceDate: subDays(20), openWorkOrdersCount: 0 },
  {
    id: 'asset-7',
    name: 'UPS-PKL-01',
    type: 'Electrical',
    siteId: 'site-1',
    location: { lat: 3.1486, lng: 101.7127 },
    floor: 'B3',
    zone: 'Server Room',
    description: 'Uninterruptible Power Supply - Server Room',
    manufacturer: 'APC',
    model: 'Symmetra PX',
    serialNumber: 'APC2021-001',
    healthScore: 35,
    healthStatus: 'critical',
    lastServiceDate: subDays(90),
    openWorkOrdersCount: 1,
    mtbfDays: 41,
    failureHistory: [
      { date: subDays(166), woId: 'wo-h-1005', failureMode: 'Battery bank degradation', rootCause: 'age_wear', downtimeHours: 5 },
      { date: subDays(125), woId: 'wo-h-1006', failureMode: 'Bypass transfer fault', rootCause: 'design_flaw', downtimeHours: 2.2 },
      { date: subDays(84), woId: 'wo-4', failureMode: 'Battery string failure', rootCause: 'age_wear', downtimeHours: 6.5 },
    ],
  },

  // Pavilion KL - Elevator
  { id: 'asset-8', name: 'Lift-PKL-01', type: 'Elevator', siteId: 'site-1', location: { lat: 3.1492, lng: 101.7134 }, floor: 'All', zone: 'Main Lobby', description: 'Passenger Elevator #1', manufacturer: 'KONE', model: 'MonoSpace 700', serialNumber: 'KN2019-001', healthScore: 90, healthStatus: 'good', lastServiceDate: subDays(5), openWorkOrdersCount: 0 },
  {
    id: 'asset-9',
    name: 'Lift-PKL-02',
    type: 'Elevator',
    siteId: 'site-1',
    location: { lat: 3.1493, lng: 101.7134 },
    floor: 'All',
    zone: 'Main Lobby',
    description: 'Passenger Elevator #2',
    manufacturer: 'KONE',
    model: 'MonoSpace 700',
    serialNumber: 'KN2019-002',
    healthScore: 55,
    healthStatus: 'warning',
    lastServiceDate: subDays(25),
    openWorkOrdersCount: 1,
    mtbfDays: 34,
    failureHistory: [
      { date: subDays(74), woId: 'wo-h-1007', failureMode: 'Door lock circuit intermittent', rootCause: 'abuse_misuse', downtimeHours: 3.2 },
      { date: subDays(40), woId: 'wo-h-1008', failureMode: 'Floor leveling offset', rootCause: 'installation_error', downtimeHours: 2.4 },
      { date: subDays(1), woId: 'wo-8', failureMode: 'Control encoder drift', rootCause: 'unknown', downtimeHours: 1.6 },
    ],
  },
  { id: 'asset-10', name: 'Escalator-PKL-01', type: 'Elevator', siteId: 'site-1', location: { lat: 3.1488, lng: 101.7131 }, floor: 'GF-L1', zone: 'Main Entrance', description: 'Escalator - Main Entrance', manufacturer: 'Schindler', model: 'Schindler 9300', serialNumber: 'SC2020-001', healthScore: 85, healthStatus: 'good', lastServiceDate: subDays(10), openWorkOrdersCount: 0 },

  // Pavilion KL - Fire Safety
  { id: 'asset-11', name: 'FirePump-PKL-01', type: 'Fire Safety', siteId: 'site-1', location: { lat: 3.1484, lng: 101.7126 }, floor: 'B3', zone: 'Fire Pump Room', description: 'Main Fire Pump', manufacturer: 'Grundfos', model: 'NKF 80-250', serialNumber: 'GF2020-001', healthScore: 95, healthStatus: 'good', lastServiceDate: subDays(3), openWorkOrdersCount: 0 },
  { id: 'asset-12', name: 'FirePanel-PKL-01', type: 'Fire Safety', siteId: 'site-1', location: { lat: 3.1490, lng: 101.7130 }, floor: 'B1', zone: 'Security Office', description: 'Fire Alarm Control Panel', manufacturer: 'Honeywell', model: 'Notifier NFS2-3030', serialNumber: 'HW2019-001', healthScore: 98, healthStatus: 'good', lastServiceDate: subDays(2), openWorkOrdersCount: 0 },

  // Pavilion KL - Plumbing
  { id: 'asset-13', name: 'WaterPump-PKL-01', type: 'Plumbing', siteId: 'site-1', location: { lat: 3.1483, lng: 101.7125 }, floor: 'B3', zone: 'Pump Room', description: 'Domestic Water Pump', manufacturer: 'Grundfos', model: 'CR 45-3', serialNumber: 'GF2021-002', healthScore: 75, healthStatus: 'warning', lastServiceDate: subDays(40), openWorkOrdersCount: 1 },
  { id: 'asset-14', name: 'STP-PKL-01', type: 'Plumbing', siteId: 'site-1', location: { lat: 3.1482, lng: 101.7124 }, floor: 'B3', zone: 'STP Room', description: 'Sewage Treatment Plant', manufacturer: 'Envirogen', model: 'MBR-500', serialNumber: 'EG2020-001', healthScore: 70, healthStatus: 'warning', lastServiceDate: subDays(35), openWorkOrdersCount: 0 },

  // Pavilion KL - IT/AV
  { id: 'asset-15', name: 'PA-PKL-01', type: 'IT/AV', siteId: 'site-1', location: { lat: 3.1491, lng: 101.7133 }, floor: 'B1', zone: 'Control Room', description: 'Public Address System', manufacturer: 'TOA', model: 'VM-3240VA', serialNumber: 'TOA2021-001', healthScore: 88, healthStatus: 'good', lastServiceDate: subDays(12), openWorkOrdersCount: 0 },
  { id: 'asset-16', name: 'CCTV-Server-PKL', type: 'IT/AV', siteId: 'site-1', location: { lat: 3.1490, lng: 101.7129 }, floor: 'B1', zone: 'Security Office', description: 'CCTV Recording Server', manufacturer: 'Hikvision', model: 'DS-96256NI-I24', serialNumber: 'HK2022-001', healthScore: 92, healthStatus: 'good', lastServiceDate: subDays(8), openWorkOrdersCount: 0 },

  // Sunway Pyramid - HVAC
  { id: 'asset-17', name: 'AHU-SP-01', type: 'HVAC', siteId: 'site-2', location: { lat: 3.0735, lng: 101.6080 }, floor: 'B2', zone: 'Zone A', description: 'Main Air Handling Unit', manufacturer: 'Daikin', model: 'AHU-6000', serialNumber: 'DK2020-011', healthScore: 88, healthStatus: 'good', lastServiceDate: subDays(12), openWorkOrdersCount: 0 },
  { id: 'asset-18', name: 'AHU-SP-02', type: 'HVAC', siteId: 'site-2', location: { lat: 3.0734, lng: 101.6082 }, floor: 'B2', zone: 'Zone B', description: 'Air Handling Unit - Ice Rink Area', manufacturer: 'Carrier', model: 'AHU-4500', serialNumber: 'CR2020-011', healthScore: 72, healthStatus: 'warning', lastServiceDate: subDays(28), openWorkOrdersCount: 1 },
  { id: 'asset-19', name: 'Chiller-SP-01', type: 'HVAC', siteId: 'site-2', location: { lat: 3.0732, lng: 101.6076 }, floor: 'B3', zone: 'Plant Room', description: 'Primary Chiller', manufacturer: 'York', model: 'YK-2500', serialNumber: 'YK2019-011', healthScore: 85, healthStatus: 'good', lastServiceDate: subDays(18), openWorkOrdersCount: 0 },
  { id: 'asset-20', name: 'Chiller-SP-02', type: 'HVAC', siteId: 'site-2', location: { lat: 3.0731, lng: 101.6077 }, floor: 'B3', zone: 'Plant Room', description: 'Secondary Chiller', manufacturer: 'York', model: 'YK-2500', serialNumber: 'YK2019-012', healthScore: 40, healthStatus: 'critical', lastServiceDate: subDays(55), openWorkOrdersCount: 2 },

  // Sunway Pyramid - Electrical
  {
    id: 'asset-21',
    name: 'MDB-SP-01',
    type: 'Electrical',
    siteId: 'site-2',
    location: { lat: 3.0730, lng: 101.6075 },
    floor: 'B3',
    zone: 'Electrical Room',
    description: 'Main Distribution Board',
    manufacturer: 'ABB',
    model: 'MNS 3.0',
    serialNumber: 'ABB2018-011',
    healthScore: 90,
    healthStatus: 'good',
    lastServiceDate: subDays(22),
    openWorkOrdersCount: 0,
    mtbfDays: 72,
    failureHistory: [
      { date: subDays(210), woId: 'wo-h-1009', failureMode: 'Loose feeder termination', rootCause: 'installation_error', downtimeHours: 2.1 },
      { date: subDays(138), woId: 'wo-h-1010', failureMode: 'Thermal hotspot at breaker B4', rootCause: 'environmental', downtimeHours: 2.8 },
      { date: subDays(10), woId: 'wo-17', failureMode: 'Busbar thermal hotspot', rootCause: 'age_wear', downtimeHours: 1.4 },
    ],
  },
  { id: 'asset-22', name: 'Generator-SP-01', type: 'Electrical', siteId: 'site-2', location: { lat: 3.0729, lng: 101.6074 }, floor: 'B3', zone: 'Generator Room', description: 'Emergency Generator #1', manufacturer: 'Cummins', model: 'C2500D5', serialNumber: 'CM2017-011', healthScore: 78, healthStatus: 'warning', lastServiceDate: subDays(35), openWorkOrdersCount: 0 },
  { id: 'asset-23', name: 'Generator-SP-02', type: 'Electrical', siteId: 'site-2', location: { lat: 3.0728, lng: 101.6074 }, floor: 'B3', zone: 'Generator Room', description: 'Emergency Generator #2', manufacturer: 'Cummins', model: 'C2500D5', serialNumber: 'CM2017-012', healthScore: 80, healthStatus: 'good', lastServiceDate: subDays(35), openWorkOrdersCount: 0 },

  // Sunway Pyramid - Elevator
  { id: 'asset-24', name: 'Lift-SP-01', type: 'Elevator', siteId: 'site-2', location: { lat: 3.0736, lng: 101.6081 }, floor: 'All', zone: 'Blue Atrium', description: 'Panoramic Elevator #1', manufacturer: 'Otis', model: 'Gen2 Premier', serialNumber: 'OT2020-011', healthScore: 94, healthStatus: 'good', lastServiceDate: subDays(4), openWorkOrdersCount: 0 },
  { id: 'asset-25', name: 'Lift-SP-02', type: 'Elevator', siteId: 'site-2', location: { lat: 3.0737, lng: 101.6081 }, floor: 'All', zone: 'Blue Atrium', description: 'Panoramic Elevator #2', manufacturer: 'Otis', model: 'Gen2 Premier', serialNumber: 'OT2020-012', healthScore: 92, healthStatus: 'good', lastServiceDate: subDays(4), openWorkOrdersCount: 0 },
  { id: 'asset-26', name: 'Escalator-SP-01', type: 'Elevator', siteId: 'site-2', location: { lat: 3.0733, lng: 101.6078 }, floor: 'GF-L1', zone: 'Main Entrance', description: 'Main Entrance Escalator', manufacturer: 'Mitsubishi', model: 'Series Z', serialNumber: 'MT2019-011', healthScore: 65, healthStatus: 'warning', lastServiceDate: subDays(20), openWorkOrdersCount: 1 },

  // Sunway Pyramid - Fire Safety
  { id: 'asset-27', name: 'FirePump-SP-01', type: 'Fire Safety', siteId: 'site-2', location: { lat: 3.0727, lng: 101.6073 }, floor: 'B3', zone: 'Fire Pump Room', description: 'Main Fire Pump', manufacturer: 'Grundfos', model: 'NKF 100-315', serialNumber: 'GF2019-011', healthScore: 96, healthStatus: 'good', lastServiceDate: subDays(5), openWorkOrdersCount: 0 },
  { id: 'asset-28', name: 'Sprinkler-SP-IceRink', type: 'Fire Safety', siteId: 'site-2', location: { lat: 3.0738, lng: 101.6083 }, floor: 'L2', zone: 'Ice Rink', description: 'Ice Rink Sprinkler System', manufacturer: 'Tyco', model: 'TY-FRB', serialNumber: 'TY2020-011', healthScore: 100, healthStatus: 'good', lastServiceDate: subDays(1), openWorkOrdersCount: 0 },

  // Sunway Pyramid - Plumbing
  { id: 'asset-29', name: 'WaterPump-SP-01', type: 'Plumbing', siteId: 'site-2', location: { lat: 3.0726, lng: 101.6072 }, floor: 'B3', zone: 'Pump Room', description: 'Domestic Water Booster Pump', manufacturer: 'Wilo', model: 'Helix V 5204', serialNumber: 'WL2021-011', healthScore: 82, healthStatus: 'good', lastServiceDate: subDays(14), openWorkOrdersCount: 0 },
  { id: 'asset-30', name: 'CoolingTower-SP-01', type: 'HVAC', siteId: 'site-2', location: { lat: 3.0740, lng: 101.6085 }, floor: 'Roof', zone: 'Roof Plant', description: 'Cooling Tower #1', manufacturer: 'BAC', model: 'Series 3000', serialNumber: 'BAC2018-011', healthScore: 68, healthStatus: 'warning', lastServiceDate: subDays(45), openWorkOrdersCount: 1 },

  // Mid Valley Megamall - HVAC
  { id: 'asset-31', name: 'AHU-MV-01', type: 'HVAC', siteId: 'site-3', location: { lat: 3.1180, lng: 101.6775 }, floor: 'B2', zone: 'Zone A', description: 'Main AHU - North Wing', manufacturer: 'Trane', model: 'Climate Changer', serialNumber: 'TR2019-021', healthScore: 86, healthStatus: 'good', lastServiceDate: subDays(16), openWorkOrdersCount: 0 },
  { id: 'asset-32', name: 'AHU-MV-02', type: 'HVAC', siteId: 'site-3', location: { lat: 3.1179, lng: 101.6777 }, floor: 'B2', zone: 'Zone B', description: 'Main AHU - South Wing', manufacturer: 'Trane', model: 'Climate Changer', serialNumber: 'TR2019-022', healthScore: 84, healthStatus: 'good', lastServiceDate: subDays(16), openWorkOrdersCount: 0 },
  { id: 'asset-33', name: 'AHU-MV-03', type: 'HVAC', siteId: 'site-3', location: { lat: 3.1178, lng: 101.6779 }, floor: 'B2', zone: 'Zone C', description: 'AHU - Food Court', manufacturer: 'Carrier', model: 'AquaEdge', serialNumber: 'CR2020-021', healthScore: 52, healthStatus: 'warning', lastServiceDate: subDays(38), openWorkOrdersCount: 1 },
  { id: 'asset-34', name: 'Chiller-MV-01', type: 'HVAC', siteId: 'site-3', location: { lat: 3.1176, lng: 101.6771 }, floor: 'B3', zone: 'Plant Room', description: 'Central Chiller #1', manufacturer: 'McQuay', model: 'PFS', serialNumber: 'MQ2018-021', healthScore: 90, healthStatus: 'good', lastServiceDate: subDays(10), openWorkOrdersCount: 0 },
  { id: 'asset-35', name: 'Chiller-MV-02', type: 'HVAC', siteId: 'site-3', location: { lat: 3.1175, lng: 101.6772 }, floor: 'B3', zone: 'Plant Room', description: 'Central Chiller #2', manufacturer: 'McQuay', model: 'PFS', serialNumber: 'MQ2018-022', healthScore: 88, healthStatus: 'good', lastServiceDate: subDays(10), openWorkOrdersCount: 0 },

  // Mid Valley Megamall - Electrical
  { id: 'asset-36', name: 'MDB-MV-01', type: 'Electrical', siteId: 'site-3', location: { lat: 3.1174, lng: 101.6770 }, floor: 'B3', zone: 'Electrical Room', description: 'Main Distribution Board - North', manufacturer: 'Siemens', model: 'SIVACON S8', serialNumber: 'SI2017-021', healthScore: 92, healthStatus: 'good', lastServiceDate: subDays(30), openWorkOrdersCount: 0 },
  {
    id: 'asset-37',
    name: 'MDB-MV-02',
    type: 'Electrical',
    siteId: 'site-3',
    location: { lat: 3.1173, lng: 101.6771 },
    floor: 'B3',
    zone: 'Electrical Room',
    description: 'Main Distribution Board - South',
    manufacturer: 'Siemens',
    model: 'SIVACON S8',
    serialNumber: 'SI2017-022',
    healthScore: 30,
    healthStatus: 'critical',
    lastServiceDate: subDays(95),
    openWorkOrdersCount: 2,
    mtbfDays: 24,
    failureHistory: [
      { date: subDays(118), woId: 'wo-h-1011', failureMode: 'Breaker thermal trip', rootCause: 'age_wear', downtimeHours: 4.2 },
      { date: subDays(46), woId: 'wo-h-1012', failureMode: 'Phase imbalance alarm', rootCause: 'design_flaw', downtimeHours: 3.1 },
      { date: subDays(1), woId: 'wo-2', failureMode: 'Panel overheating alert', rootCause: 'environmental', downtimeHours: 2.7 },
    ],
  },
  { id: 'asset-38', name: 'Generator-MV-01', type: 'Electrical', siteId: 'site-3', location: { lat: 3.1172, lng: 101.6769 }, floor: 'B3', zone: 'Generator Room', description: 'Backup Generator - Primary', manufacturer: 'Perkins', model: '4012-46TAG2A', serialNumber: 'PK2016-021', healthScore: 75, healthStatus: 'warning', lastServiceDate: subDays(42), openWorkOrdersCount: 0 },
  { id: 'asset-39', name: 'Transformer-MV-01', type: 'Electrical', siteId: 'site-3', location: { lat: 3.1171, lng: 101.6768 }, floor: 'B3', zone: 'Substation', description: 'Main Transformer', manufacturer: 'ABB', model: 'Distribution Transformer', serialNumber: 'ABB2015-021', healthScore: 85, healthStatus: 'good', lastServiceDate: subDays(60), openWorkOrdersCount: 0 },

  // Mid Valley Megamall - Elevator
  { id: 'asset-40', name: 'Lift-MV-01', type: 'Elevator', siteId: 'site-3', location: { lat: 3.1181, lng: 101.6776 }, floor: 'All', zone: 'Centre Court', description: 'Glass Elevator #1', manufacturer: 'ThyssenKrupp', model: 'synergy', serialNumber: 'TK2018-021', healthScore: 91, healthStatus: 'good', lastServiceDate: subDays(6), openWorkOrdersCount: 0 },
  { id: 'asset-41', name: 'Lift-MV-02', type: 'Elevator', siteId: 'site-3', location: { lat: 3.1182, lng: 101.6776 }, floor: 'All', zone: 'Centre Court', description: 'Glass Elevator #2', manufacturer: 'ThyssenKrupp', model: 'synergy', serialNumber: 'TK2018-022', healthScore: 89, healthStatus: 'good', lastServiceDate: subDays(6), openWorkOrdersCount: 0 },
  { id: 'asset-42', name: 'Lift-MV-Cargo', type: 'Elevator', siteId: 'site-3', location: { lat: 3.1177, lng: 101.6773 }, floor: 'All', zone: 'Loading Bay', description: 'Cargo Elevator', manufacturer: 'Fujitec', model: 'GLVF-CO', serialNumber: 'FJ2017-021', healthScore: 60, healthStatus: 'warning', lastServiceDate: subDays(32), openWorkOrdersCount: 1 },
  { id: 'asset-43', name: 'Escalator-MV-01', type: 'Elevator', siteId: 'site-3', location: { lat: 3.1178, lng: 101.6774 }, floor: 'GF-L3', zone: 'Centre Court', description: 'Main Escalator Bank', manufacturer: 'Hitachi', model: 'GX-21', serialNumber: 'HT2019-021', healthScore: 87, healthStatus: 'good', lastServiceDate: subDays(9), openWorkOrdersCount: 0 },

  // Mid Valley Megamall - Fire Safety
  { id: 'asset-44', name: 'FirePump-MV-01', type: 'Fire Safety', siteId: 'site-3', location: { lat: 3.1170, lng: 101.6767 }, floor: 'B3', zone: 'Fire Pump Room', description: 'Electric Fire Pump', manufacturer: 'Armstrong', model: 'Vertical In-Line', serialNumber: 'AR2018-021', healthScore: 94, healthStatus: 'good', lastServiceDate: subDays(7), openWorkOrdersCount: 0 },
  { id: 'asset-45', name: 'FirePump-MV-02', type: 'Fire Safety', siteId: 'site-3', location: { lat: 3.1169, lng: 101.6766 }, floor: 'B3', zone: 'Fire Pump Room', description: 'Diesel Fire Pump', manufacturer: 'Clarke', model: 'JU6H-UF40', serialNumber: 'CL2018-021', healthScore: 88, healthStatus: 'good', lastServiceDate: subDays(14), openWorkOrdersCount: 0 },
  { id: 'asset-46', name: 'FirePanel-MV-01', type: 'Fire Safety', siteId: 'site-3', location: { lat: 3.1180, lng: 101.6774 }, floor: 'B1', zone: 'Fire Command Centre', description: 'Main Fire Alarm Panel', manufacturer: 'Edwards', model: 'EST3', serialNumber: 'ED2017-021', healthScore: 97, healthStatus: 'good', lastServiceDate: subDays(3), openWorkOrdersCount: 0 },

  // Mid Valley Megamall - Plumbing
  { id: 'asset-47', name: 'WaterTank-MV-01', type: 'Plumbing', siteId: 'site-3', location: { lat: 3.1183, lng: 101.6780 }, floor: 'Roof', zone: 'Roof Tank Room', description: 'Roof Water Storage Tank', manufacturer: 'Sintex', model: 'ISI Certified', serialNumber: 'SX2016-021', healthScore: 80, healthStatus: 'good', lastServiceDate: subDays(25), openWorkOrdersCount: 0 },
  { id: 'asset-48', name: 'STP-MV-01', type: 'Plumbing', siteId: 'site-3', location: { lat: 3.1168, lng: 101.6765 }, floor: 'B3', zone: 'STP Room', description: 'Sewage Treatment Plant', manufacturer: 'Kubota', model: 'Submerged MBR', serialNumber: 'KB2019-021', healthScore: 76, healthStatus: 'warning', lastServiceDate: subDays(28), openWorkOrdersCount: 0 },

  // Mid Valley Megamall - IT/AV
  { id: 'asset-49', name: 'BMS-Server-MV', type: 'IT/AV', siteId: 'site-3', location: { lat: 3.1179, lng: 101.6773 }, floor: 'B1', zone: 'BMS Room', description: 'Building Management System Server', manufacturer: 'Johnson Controls', model: 'Metasys ADX', serialNumber: 'JC2020-021', healthScore: 95, healthStatus: 'good', lastServiceDate: subDays(5), openWorkOrdersCount: 0 },
  { id: 'asset-50', name: 'LED-Display-MV', type: 'IT/AV', siteId: 'site-3', location: { lat: 3.1181, lng: 101.6775 }, floor: 'GF', zone: 'Centre Court', description: 'Giant LED Display - Centre Court', manufacturer: 'Samsung', model: 'IF Series', serialNumber: 'SS2021-021', healthScore: 98, healthStatus: 'good', lastServiceDate: subDays(2), openWorkOrdersCount: 0 },

  // Additional assets for variety
  {
    id: 'asset-51',
    name: 'CRAC-SP-Server',
    type: 'HVAC',
    siteId: 'site-2',
    location: { lat: 3.0739, lng: 101.6084 },
    floor: 'B1',
    zone: 'Server Room',
    description: 'Computer Room Air Conditioner',
    manufacturer: 'Liebert',
    model: 'DS',
    serialNumber: 'LB2021-011',
    healthScore: 83,
    healthStatus: 'good',
    lastServiceDate: subDays(11),
    openWorkOrdersCount: 0,
    mtbfDays: 29,
    failureHistory: [
      { date: subDays(95), woId: 'wo-h-1013', failureMode: 'Compressor short cycling', rootCause: 'design_flaw', downtimeHours: 4.5 },
      { date: subDays(38), woId: 'wo-h-1014', failureMode: 'Condenser fan speed variance', rootCause: 'installation_error', downtimeHours: 3.8 },
      { date: subDays(4), woId: 'wo-26', failureMode: 'Supply air temperature drift', rootCause: 'environmental', downtimeHours: 4.1 },
    ],
  },
  { id: 'asset-52', name: 'VRV-PKL-Office', type: 'HVAC', siteId: 'site-1', location: { lat: 3.1494, lng: 101.7136 }, floor: 'L5', zone: 'Management Office', description: 'VRV System - Management Office', manufacturer: 'Daikin', model: 'VRV IV', serialNumber: 'DK2022-003', healthScore: 96, healthStatus: 'good', lastServiceDate: subDays(4), openWorkOrdersCount: 0 },
  {
    id: 'asset-53',
    name: 'EV-Charger-MV-01',
    type: 'Electrical',
    siteId: 'site-3',
    location: { lat: 3.1167, lng: 101.6764 },
    floor: 'B2',
    zone: 'Car Park A',
    description: 'EV Charging Station #1',
    manufacturer: 'Tesla',
    model: 'Wall Connector',
    serialNumber: 'TS2023-021',
    healthScore: 100,
    healthStatus: 'good',
    lastServiceDate: subDays(1),
    openWorkOrdersCount: 0,
    mtbfDays: 45,
    failureHistory: [
      { date: subDays(51), woId: 'wo-h-1015', failureMode: 'Connector overheating', rootCause: 'abuse_misuse', downtimeHours: 2.3 },
      { date: subDays(6), woId: 'wo-27', failureMode: 'Control board communication fault', rootCause: 'design_flaw', downtimeHours: 3.4 },
    ],
  },
  {
    id: 'asset-54',
    name: 'Travellator-SP-01',
    type: 'Elevator',
    siteId: 'site-2',
    location: { lat: 3.0741, lng: 101.6086 },
    floor: 'L1-L2',
    zone: 'East Wing',
    description: 'Moving Walkway',
    manufacturer: 'KONE',
    model: 'TravelMaster 115',
    serialNumber: 'KN2020-011',
    healthScore: 79,
    healthStatus: 'warning',
    lastServiceDate: subDays(22),
    openWorkOrdersCount: 1,
    mtbfDays: 64,
    failureHistory: [
      { date: subDays(150), woId: 'wo-h-1016', failureMode: 'Handrail speed mismatch', rootCause: 'installation_error', downtimeHours: 1.8 },
      { date: subDays(86), woId: 'wo-h-1017', failureMode: 'Drive chain stretch', rootCause: 'age_wear', downtimeHours: 3.3 },
      { date: subDays(20), woId: 'wo-20', failureMode: 'Speed control drift', rootCause: 'unknown', downtimeHours: 2.1 },
    ],
  },
  { id: 'asset-55', name: 'Smoke-Exhaust-PKL', type: 'Fire Safety', siteId: 'site-1', location: { lat: 3.1489, lng: 101.7128 }, floor: 'All', zone: 'Central Shaft', description: 'Smoke Extraction System', manufacturer: 'Systemair', model: 'AXC', serialNumber: 'SY2019-001', healthScore: 91, healthStatus: 'good', lastServiceDate: subDays(8), openWorkOrdersCount: 0 },
];

export const assets: Asset[] = baseAssets.map((asset) => {
  const sensors = createSensorsForAsset(asset);
  const sensorHistory = createSensorHistory(asset.id, sensors);
  const latestReadings = sensorHistory[sensorHistory.length - 1]?.readings || {};
  const sensorsWithLatestValues = sensorTypeOrder.reduce<AssetSensors>((accumulator, sensorType) => {
    const currentSensor = sensors[sensorType];
    if (!currentSensor) {
      return accumulator;
    }

    return {
      ...accumulator,
      [sensorType]: {
        ...currentSensor,
        value: latestReadings[sensorType] ?? currentSensor.value,
      },
    };
  }, {});

  return {
    ...asset,
    sensors: sensorsWithLatestValues,
    sensorHistory,
    sensorStatus: calculateSensorStatus(sensorsWithLatestValues),
  };
});

// Work Orders
const createApprovalChain = (chain?: WorkOrderApprovalStep[]): WorkOrderApprovalStep[] => {
  const source =
    chain ||
    [
      { level: 1 as const, role: 'Supervisor' as const },
      { level: 2 as const, role: 'FM Manager' as const },
    ];

  return source.map((step) => ({ ...step }));
};

const seededApprovalStates: Record<string, { approvalStatus: WorkOrderApprovalStatus; approvalChain: WorkOrderApprovalStep[] }> = {
  'wo-1': {
    approvalStatus: 'pending_supervisor',
    approvalChain: createApprovalChain(),
  },
  'wo-2': {
    approvalStatus: 'pending_supervisor',
    approvalChain: createApprovalChain(),
  },
  'wo-3': {
    approvalStatus: 'pending_supervisor',
    approvalChain: createApprovalChain(),
  },
  'wo-4': {
    approvalStatus: 'pending_supervisor',
    approvalChain: createApprovalChain(),
  },
  'wo-5': {
    approvalStatus: 'pending_supervisor',
    approvalChain: createApprovalChain(),
  },
  'wo-6': {
    approvalStatus: 'rejected',
    approvalChain: createApprovalChain([
      {
        level: 1,
        role: 'Supervisor',
        approverId: 'user-3',
        approverName: 'Kumar Suresh',
        action: 'rejected',
        comment: 'Insufficient fault details. Please attach supporting diagnostics.',
        timestamp: subDays(0.7),
      },
      { level: 2, role: 'FM Manager' },
    ]),
  },
  'wo-7': {
    approvalStatus: 'rejected',
    approvalChain: createApprovalChain([
      {
        level: 1,
        role: 'Supervisor',
        approverId: 'user-2',
        approverName: 'Lee Wei Ming',
        action: 'approved',
        comment: 'Supervisor approved for manager review.',
        timestamp: subDays(1.8),
      },
      {
        level: 2,
        role: 'FM Manager',
        approverId: 'user-4',
        approverName: 'Fatimah Abdullah',
        action: 'rejected',
        comment: 'Budget hold this week. Re-submit next cycle.',
        timestamp: subDays(1.6),
      },
    ]),
  },
};

const seededWorkOrders: Array<
  Omit<WorkOrder, 'labourEntries' | 'partsUsed' | 'totalLabourCost' | 'totalPartsCost' | 'totalCost' | 'approvalStatus' | 'approvalChain' | 'slaBreached' | 'escalationLog'> &
  Partial<Pick<WorkOrder, 'slaBreached' | 'slaBreachTime' | 'escalationLog'>>
> = [
  // Open Work Orders
  {
    id: 'wo-1', number: 'WO-2024-00001', siteId: 'site-1', assetId: 'asset-2', title: 'AHU-PKL-02 Making Unusual Noise', description: 'Reported unusual grinding noise from AHU-PKL-02. Possible bearing failure.', faultType: 'Mechanical Failure', priority: 'P1', status: 'open', slaDeadline: addHours(4), createdAt: subDays(0.1), updatedAt: subDays(0.1),
    timeline: [{ id: 'tl-1', type: 'created', description: 'Work order created', userId: 'user-2', createdAt: subDays(0.1) }]
  },
  {
    id: 'wo-2', number: 'WO-2024-00002', siteId: 'site-3', assetId: 'asset-37', title: 'MDB-MV-02 Overheating Alert', description: 'BMS triggered overheating alert on MDB-MV-02. Thermal imaging required.', faultType: 'Electrical Fault', priority: 'P1', status: 'open', slaDeadline: addHours(-3), slaBreached: true, slaBreachTime: addHours(-3), createdAt: subDays(0.05), updatedAt: subDays(0.05),
    escalationLog: [
      { timestamp: addHours(-2.8), notifiedRole: 'Supervisor', notifiedName: 'Nur Aisyah Ismail', method: 'system', message: 'P1 WO exceeded SLA. Immediate dispatch confirmation required.' },
      { timestamp: addHours(-2.3), notifiedRole: 'FM Manager', notifiedName: 'Daniel Tan', method: 'email', message: 'Escalated: MDB overheating unresolved after SLA breach threshold.' },
      { timestamp: addHours(-1.6), notifiedRole: 'Director', notifiedName: 'Priya Menon', method: 'sms', message: 'Critical SLA breach on WO-2024-00002. Executive visibility enabled.' },
    ],
    timeline: [{ id: 'tl-2', type: 'created', description: 'Work order created via BMS alert', userId: 'user-1', createdAt: subDays(0.05) }]
  },
  {
    id: 'wo-3', number: 'WO-2024-00003', siteId: 'site-2', assetId: 'asset-20', title: 'Chiller-SP-02 Low Refrigerant', description: 'Chiller showing low refrigerant pressure. Suspected leak in system.', faultType: 'Refrigerant Leak', priority: 'P2', status: 'open', slaDeadline: addHours(-10), slaBreached: true, slaBreachTime: addHours(-10), createdAt: subDays(0.2), updatedAt: subDays(0.2),
    escalationLog: [
      { timestamp: addHours(-9.7), notifiedRole: 'Supervisor', notifiedName: 'Farid Rahman', method: 'system', message: 'P2 refrigerant leak WO breached SLA. Site attendance overdue.' },
      { timestamp: addHours(-8.9), notifiedRole: 'FM Manager', notifiedName: 'Kavitha Nair', method: 'email', message: 'Escalation reminder sent for overdue chiller refrigerant issue.' },
    ],
    timeline: [{ id: 'tl-3', type: 'created', description: 'Work order created', userId: 'user-3', createdAt: subDays(0.2) }]
  },

  // Assigned Work Orders
  {
    id: 'wo-4', number: 'WO-2024-00004', siteId: 'site-1', assetId: 'asset-7', title: 'UPS Battery Replacement', description: 'UPS batteries are past end of life. Replacement required.', faultType: 'Battery Failure', priority: 'P2', status: 'assigned', assignedToId: 'user-5', slaDeadline: addHours(-6), slaBreached: true, slaBreachTime: addHours(-6), createdAt: subDays(0.5), updatedAt: subDays(0.3),
    escalationLog: [
      { timestamp: addHours(-5.5), notifiedRole: 'Supervisor', notifiedName: 'Nur Aisyah Ismail', method: 'system', message: 'Assigned WO breached SLA. UPS resilience risk elevated.' },
      { timestamp: addHours(-4.4), notifiedRole: 'FM Manager', notifiedName: 'Daniel Tan', method: 'email', message: 'Follow-up: UPS replacement pending beyond SLA commitment.' },
    ],
    timeline: [
      { id: 'tl-4', type: 'created', description: 'Work order created', userId: 'user-2', createdAt: subDays(0.5) },
      { id: 'tl-5', type: 'assigned', description: 'Assigned to Wong Chun Kit', userId: 'user-2', createdAt: subDays(0.3) }
    ]
  },
  {
    id: 'wo-5', number: 'WO-2024-00005', siteId: 'site-3', assetId: 'asset-42', title: 'Cargo Elevator Door Malfunction', description: 'Cargo elevator door not closing properly. Safety sensor may need adjustment.', faultType: 'Door Mechanism', priority: 'P2', status: 'assigned', assignedToId: 'user-6', contractorId: 'contractor-3', slaDeadline: addHours(-2), slaBreached: true, slaBreachTime: addHours(-2), createdAt: subDays(0.4), updatedAt: subDays(0.2),
    escalationLog: [
      { timestamp: addHours(-1.8), notifiedRole: 'Supervisor', notifiedName: 'Farid Rahman', method: 'system', message: 'Elevator safety-related WO exceeded SLA window.' },
      { timestamp: addHours(-1.2), notifiedRole: 'FM Manager', notifiedName: 'Kavitha Nair', method: 'sms', message: 'Contractor follow-up required for breached cargo elevator WO.' },
    ],
    timeline: [
      { id: 'tl-6', type: 'created', description: 'Work order created', userId: 'user-4', createdAt: subDays(0.4) },
      { id: 'tl-7', type: 'assigned', description: 'Assigned to Fujitec contractor', userId: 'user-4', createdAt: subDays(0.2) }
    ]
  },
  {
    id: 'wo-6', number: 'WO-2024-00006', siteId: 'site-2', assetId: 'asset-26', title: 'Escalator Step Misalignment', description: 'Escalator steps showing slight misalignment. Inspection required.', faultType: 'Mechanical Adjustment', priority: 'P3', status: 'assigned', assignedToId: 'user-7', contractorId: 'contractor-3', slaDeadline: addHours(48), createdAt: subDays(1), updatedAt: subDays(0.8),
    timeline: [
      { id: 'tl-8', type: 'created', description: 'Work order created', userId: 'user-3', createdAt: subDays(1) },
      { id: 'tl-9', type: 'assigned', description: 'Assigned to vertical transport contractor', userId: 'user-3', createdAt: subDays(0.8) }
    ]
  },

  // In Progress Work Orders
  {
    id: 'wo-7', number: 'WO-2024-00007', siteId: 'site-1', assetId: 'asset-3', title: 'Chiller-PKL-01 Compressor Service', description: 'Scheduled compressor service and oil change.', faultType: 'Preventive Maintenance', priority: 'P3', status: 'in_progress', assignedToId: 'user-5', contractorId: 'contractor-1', slaDeadline: addHours(72), createdAt: subDays(2), updatedAt: subDays(0.1),
    timeline: [
      { id: 'tl-10', type: 'created', description: 'Work order created from PM schedule', userId: 'user-1', createdAt: subDays(2) },
      { id: 'tl-11', type: 'assigned', description: 'Assigned to HVAC contractor', userId: 'user-2', createdAt: subDays(1.5) },
      { id: 'tl-12', type: 'status_change', description: 'Work started', userId: 'user-5', createdAt: subDays(0.1) }
    ],
    checklist: [
      { id: 'cl-1', text: 'Isolate and lock out chiller', completed: true },
      { id: 'cl-2', text: 'Check oil level and condition', completed: true },
      { id: 'cl-3', text: 'Drain old oil', completed: false },
      { id: 'cl-4', text: 'Replace oil filter', completed: false },
      { id: 'cl-5', text: 'Fill with new oil', completed: false },
      { id: 'cl-6', text: 'Test run and check for leaks', completed: false }
    ]
  },
  {
    id: 'wo-8', number: 'WO-2024-00008', siteId: 'site-1', assetId: 'asset-9', title: 'Lift-PKL-02 Leveling Issue', description: 'Elevator not leveling correctly at some floors.', faultType: 'Control System', priority: 'P2', status: 'in_progress', assignedToId: 'user-8', contractorId: 'contractor-3', slaDeadline: addHours(-5), slaBreached: true, slaBreachTime: addHours(-5), createdAt: subDays(0.8), updatedAt: subDays(0.2),
    escalationLog: [
      { timestamp: addHours(-4.8), notifiedRole: 'Supervisor', notifiedName: 'Nur Aisyah Ismail', method: 'system', message: 'Lift leveling fault remains unresolved after SLA deadline.' },
      { timestamp: addHours(-3.6), notifiedRole: 'FM Manager', notifiedName: 'Daniel Tan', method: 'email', message: 'Escalation triggered for passenger lift SLA breach in main lobby.' },
      { timestamp: addHours(-2.4), notifiedRole: 'Director', notifiedName: 'Priya Menon', method: 'sms', message: 'High-visibility elevator SLA breach still active at Pavilion KL.' },
    ],
    timeline: [
      { id: 'tl-13', type: 'created', description: 'Work order created', userId: 'user-2', createdAt: subDays(0.8) },
      { id: 'tl-14', type: 'assigned', description: 'Assigned to KONE technician', userId: 'user-2', createdAt: subDays(0.6) },
      { id: 'tl-15', type: 'status_change', description: 'Technician on site', userId: 'user-8', createdAt: subDays(0.2) }
    ]
  },
  {
    id: 'wo-9', number: 'WO-2024-00009', siteId: 'site-2', assetId: 'asset-30', title: 'Cooling Tower Fan Vibration', description: 'Excessive vibration detected in cooling tower fan. Balance check required.', faultType: 'Vibration', priority: 'P3', status: 'in_progress', assignedToId: 'user-7', slaDeadline: addHours(36), createdAt: subDays(1.5), updatedAt: subDays(0.3),
    timeline: [
      { id: 'tl-16', type: 'created', description: 'Work order created', userId: 'user-3', createdAt: subDays(1.5) },
      { id: 'tl-17', type: 'assigned', description: 'Assigned to Mei Ling', userId: 'user-3', createdAt: subDays(1.2) },
      { id: 'tl-18', type: 'status_change', description: 'Started vibration analysis', userId: 'user-7', createdAt: subDays(0.3) }
    ]
  },

  // Pending Parts Work Orders
  {
    id: 'wo-10', number: 'WO-2024-00010', siteId: 'site-1', assetId: 'asset-13', title: 'Water Pump Seal Replacement', description: 'Mechanical seal leaking. Replacement parts ordered.', faultType: 'Seal Leak', priority: 'P3', status: 'pending_parts', assignedToId: 'user-6', slaDeadline: addDays(3), createdAt: subDays(3), updatedAt: subDays(1),
    timeline: [
      { id: 'tl-19', type: 'created', description: 'Work order created', userId: 'user-2', createdAt: subDays(3) },
      { id: 'tl-20', type: 'status_change', description: 'Parts ordered - ETA 2 days', userId: 'user-6', createdAt: subDays(1) }
    ]
  },
  {
    id: 'wo-11', number: 'WO-2024-00011', siteId: 'site-2', assetId: 'asset-18', title: 'AHU Belt Replacement', description: 'Fan belt worn. Waiting for correct size belt.', faultType: 'Belt Wear', priority: 'P3', status: 'pending_parts', assignedToId: 'user-5', slaDeadline: addDays(2), createdAt: subDays(2.5), updatedAt: subDays(0.5),
    timeline: [
      { id: 'tl-21', type: 'created', description: 'Work order created', userId: 'user-3', createdAt: subDays(2.5) },
      { id: 'tl-22', type: 'status_change', description: 'Belt on order from supplier', userId: 'user-5', createdAt: subDays(0.5) }
    ]
  },
  {
    id: 'wo-12', number: 'WO-2024-00012', siteId: 'site-3', assetId: 'asset-33', title: 'AHU-MV-03 Filter Replacement', description: 'HEPA filters due for replacement. Awaiting delivery.', faultType: 'Filter Change', priority: 'P4', status: 'pending_parts', assignedToId: 'user-7', slaDeadline: addDays(5), createdAt: subDays(4), updatedAt: subDays(2),
    timeline: [
      { id: 'tl-23', type: 'created', description: 'Scheduled filter change', userId: 'user-4', createdAt: subDays(4) },
      { id: 'tl-24', type: 'status_change', description: 'Filters ordered', userId: 'user-7', createdAt: subDays(2) }
    ]
  },

  // Resolved Work Orders
  {
    id: 'wo-13', number: 'WO-2024-00013', siteId: 'site-1', assetId: 'asset-4', title: 'FCU Thermostat Calibration', description: 'Thermostat reading 2 degrees off. Recalibrated successfully.', faultType: 'Calibration', priority: 'P4', status: 'resolved', assignedToId: 'user-8', slaDeadline: addDays(1), createdAt: subDays(3), updatedAt: subDays(1), resolvedAt: subDays(1), rootCause: 'installation_error', failureMode: 'Thermostat sensor offset', correctiveAction: 'Recalibrated thermostat, replaced weak sensor connector, and validated readings against handheld probe for 30 minutes.',
    timeline: [
      { id: 'tl-25', type: 'created', description: 'Work order created', userId: 'user-2', createdAt: subDays(3) },
      { id: 'tl-26', type: 'assigned', description: 'Assigned to Zain Hassan', userId: 'user-2', createdAt: subDays(2.5) },
      { id: 'tl-27', type: 'status_change', description: 'Calibration completed', userId: 'user-8', createdAt: subDays(1) }
    ]
  },
  {
    id: 'wo-14', number: 'WO-2024-00014', siteId: 'site-2', assetId: 'asset-24', title: 'Elevator Door Sensor Replacement', description: 'Door sensor replaced and tested.', faultType: 'Sensor Failure', priority: 'P2', status: 'resolved', assignedToId: 'user-5', contractorId: 'contractor-3', slaDeadline: addHours(8), createdAt: subDays(2), updatedAt: subDays(1.5), resolvedAt: subDays(1.5), rootCause: 'age_wear', failureMode: 'Door edge safety sensor no response', correctiveAction: 'Replaced door edge sensor pair, aligned brackets, and ran 50 open/close cycles with no repeat fault.',
    timeline: [
      { id: 'tl-28', type: 'created', description: 'Emergency work order created', userId: 'user-3', createdAt: subDays(2) },
      { id: 'tl-29', type: 'assigned', description: 'Otis technician dispatched', userId: 'user-3', createdAt: subDays(1.9) },
      { id: 'tl-30', type: 'status_change', description: 'Sensor replaced and tested', userId: 'user-5', createdAt: subDays(1.5) }
    ]
  },
  {
    id: 'wo-15', number: 'WO-2024-00015', siteId: 'site-3', assetId: 'asset-46', title: 'Fire Panel Zone Test', description: 'Monthly zone test completed. All zones functioning.', faultType: 'Testing', priority: 'P3', status: 'resolved', assignedToId: 'user-6', slaDeadline: addDays(2), createdAt: subDays(5), updatedAt: subDays(3), resolvedAt: subDays(3), rootCause: 'unknown', failureMode: 'Intermittent zone communication timeout', correctiveAction: 'Cleaned terminal points, reseated zone card, and performed full panel self-test with no further timeout.',
    timeline: [
      { id: 'tl-31', type: 'created', description: 'Monthly test scheduled', userId: 'user-4', createdAt: subDays(5) },
      { id: 'tl-32', type: 'status_change', description: 'Testing completed - all zones OK', userId: 'user-6', createdAt: subDays(3) }
    ]
  },

  // Closed Work Orders
  {
    id: 'wo-16', number: 'WO-2024-00016', siteId: 'site-1', assetId: 'asset-11', title: 'Fire Pump Annual Test', description: 'Annual fire pump test completed and certified.', faultType: 'Annual Inspection', priority: 'P2', status: 'closed', assignedToId: 'user-6', contractorId: 'contractor-5', slaDeadline: addDays(1), createdAt: subDays(7), updatedAt: subDays(5), resolvedAt: subDays(5.5), closedAt: subDays(5), rootCause: 'age_wear', failureMode: 'Pressure fluctuation at high load', correctiveAction: 'Replaced worn coupling bush and rebalanced impeller alignment to restore stable discharge pressure.',
  },
  {
    id: 'wo-17', number: 'WO-2024-00017', siteId: 'site-2', assetId: 'asset-21', title: 'MDB Thermal Imaging', description: 'Thermal imaging completed. Minor hotspots identified and rectified.', faultType: 'Inspection', priority: 'P3', status: 'closed', assignedToId: 'user-7', contractorId: 'contractor-2', slaDeadline: addDays(3), createdAt: subDays(10), updatedAt: subDays(8), resolvedAt: subDays(8.5), closedAt: subDays(8), rootCause: 'installation_error', failureMode: 'Loose cable lug at outgoing feeder', correctiveAction: 'Reterminated feeder lug, applied torque to OEM specification, and added torque-check label for monthly rounds.',
  },
  {
    id: 'wo-18', number: 'WO-2024-00018', siteId: 'site-3', assetId: 'asset-40', title: 'Glass Elevator Cleaning', description: 'Quarterly glass cleaning completed.', faultType: 'Cleaning', priority: 'P4', status: 'closed', assignedToId: 'user-7', slaDeadline: addDays(5), createdAt: subDays(12), updatedAt: subDays(10), resolvedAt: subDays(10.5), closedAt: subDays(10), rootCause: 'abuse_misuse', failureMode: 'Door track contamination and drag', correctiveAction: 'Removed debris buildup from sill channel, adjusted door gap, and briefed cleaning contractor on protected zones.',
  },

  // More recent work orders for variety
  {
    id: 'wo-19', number: 'WO-2024-00019', siteId: 'site-1', assetId: 'asset-2', title: 'AHU-PKL-02 Emergency Repair', description: 'Bearing failure confirmed. Emergency repair in progress.', faultType: 'Bearing Failure', priority: 'P1', status: 'in_progress', assignedToId: 'user-5', contractorId: 'contractor-1', slaDeadline: addHours(-1), slaBreached: true, slaBreachTime: addHours(-1), createdAt: subDays(0.15), updatedAt: subDays(0.08),
    escalationLog: [
      { timestamp: addHours(-0.9), notifiedRole: 'Supervisor', notifiedName: 'Farid Rahman', method: 'system', message: 'Emergency AHU repair has breached SLA by 1 hour.' },
    ],
    timeline: [
      { id: 'tl-33', type: 'created', description: 'Emergency work order created', userId: 'user-2', createdAt: subDays(0.15) },
      { id: 'tl-34', type: 'assigned', description: 'Daikin emergency team dispatched', userId: 'user-2', createdAt: subDays(0.12) },
      { id: 'tl-35', type: 'status_change', description: 'Technician on site, bearing confirmed failed', userId: 'user-5', createdAt: subDays(0.08) }
    ]
  },
  {
    id: 'wo-20', number: 'WO-2024-00020', siteId: 'site-2', assetId: 'asset-54', title: 'Travellator Speed Adjustment', description: 'Travellator running slower than spec. Speed control check needed.', faultType: 'Speed Control', priority: 'P3', status: 'assigned', assignedToId: 'user-7', slaDeadline: addHours(48), createdAt: subDays(0.5), updatedAt: subDays(0.3),
  },
  {
    id: 'wo-21', number: 'WO-2024-00021', siteId: 'site-3', assetId: 'asset-37', title: 'MDB-MV-02 Breaker Replacement', description: 'Main breaker tripping intermittently. Replacement scheduled.', faultType: 'Breaker Failure', priority: 'P1', status: 'assigned', assignedToId: 'user-6', contractorId: 'contractor-2', slaDeadline: addHours(4), createdAt: subDays(0.1), updatedAt: subDays(0.05),
  },

  // Additional work orders to reach 30+
  { id: 'wo-22', number: 'WO-2024-00022', siteId: 'site-1', assetId: 'asset-15', title: 'PA System Static Noise', description: 'Static noise reported on PA system in L3.', faultType: 'Audio Issue', priority: 'P4', status: 'open', slaDeadline: addDays(3), createdAt: subDays(0.3), updatedAt: subDays(0.3) },
  { id: 'wo-23', number: 'WO-2024-00023', siteId: 'site-2', assetId: 'asset-29', title: 'Water Pump Pressure Drop', description: 'Domestic water pressure lower than normal.', faultType: 'Pressure Issue', priority: 'P3', status: 'in_progress', assignedToId: 'user-5', slaDeadline: addHours(24), createdAt: subDays(0.8), updatedAt: subDays(0.2) },
  { id: 'wo-24', number: 'WO-2024-00024', siteId: 'site-3', assetId: 'asset-48', title: 'STP Odor Complaint', description: 'Odor complaint near STP area. Inspection needed.', faultType: 'Environmental', priority: 'P2', status: 'assigned', assignedToId: 'user-6', slaDeadline: addHours(8), createdAt: subDays(0.2), updatedAt: subDays(0.1) },
  { id: 'wo-25', number: 'WO-2024-00025', siteId: 'site-1', assetId: 'asset-52', title: 'VRV System Error Code', description: 'Error code E3 displayed on VRV controller.', faultType: 'Control Error', priority: 'P3', status: 'resolved', assignedToId: 'user-8', slaDeadline: addHours(24), createdAt: subDays(2), updatedAt: subDays(1), resolvedAt: subDays(1), rootCause: 'design_flaw', failureMode: 'Indoor-outdoor communication board reset loop', correctiveAction: 'Upgraded control board firmware and added signal stabilizer module based on OEM bulletin.' },
  { id: 'wo-26', number: 'WO-2024-00026', siteId: 'site-2', assetId: 'asset-51', title: 'Server Room Temperature High', description: 'CRAC unit not maintaining temperature.', faultType: 'Temperature Control', priority: 'P1', status: 'closed', assignedToId: 'user-7', slaDeadline: addHours(2), createdAt: subDays(4), updatedAt: subDays(3.5), resolvedAt: subDays(3.6), closedAt: subDays(3.5), rootCause: 'environmental', failureMode: 'Condenser airflow restriction', correctiveAction: 'Cleared condenser coil blockage, restored airflow pathway, and set weekly PM checklist for coil inspection.' },
  { id: 'wo-27', number: 'WO-2024-00027', siteId: 'site-3', assetId: 'asset-53', title: 'EV Charger Fault', description: 'EV charger #1 showing fault code.', faultType: 'Charger Fault', priority: 'P3', status: 'closed', assignedToId: 'user-6', slaDeadline: addHours(48), createdAt: subDays(6), updatedAt: subDays(5), resolvedAt: subDays(5.2), closedAt: subDays(5), rootCause: 'abuse_misuse', failureMode: 'Charge connector latch damage', correctiveAction: 'Replaced connector head and installed usage signage to reduce forced disconnect events.' },
  { id: 'wo-28', number: 'WO-2024-00028', siteId: 'site-1', assetId: 'asset-55', title: 'Smoke Exhaust Fan Test', description: 'Quarterly smoke exhaust test due.', faultType: 'Testing', priority: 'P3', status: 'resolved', assignedToId: 'user-8', slaDeadline: addDays(5), createdAt: subDays(8), updatedAt: subDays(6), resolvedAt: subDays(6) },
  { id: 'wo-29', number: 'WO-2024-00029', siteId: 'site-2', assetId: 'asset-22', title: 'Generator Load Bank Test', description: 'Annual load bank test scheduled.', faultType: 'Testing', priority: 'P3', status: 'pending_parts', assignedToId: 'user-5', slaDeadline: addDays(7), createdAt: subDays(3), updatedAt: subDays(1) },
  { id: 'wo-30', number: 'WO-2024-00030', siteId: 'site-3', assetId: 'asset-38', title: 'Generator Fuel Filter Change', description: 'Scheduled fuel filter replacement.', faultType: 'Filter Change', priority: 'P4', status: 'closed', assignedToId: 'user-6', slaDeadline: addDays(10), createdAt: subDays(15), updatedAt: subDays(12), resolvedAt: subDays(12.5), closedAt: subDays(12), rootCause: 'age_wear', failureMode: 'Fuel filter saturation', correctiveAction: 'Replaced primary and secondary fuel filters and moved replacement interval from quarterly to bi-monthly.' },
  { id: 'wo-31', number: 'WO-2024-00031', siteId: 'site-1', assetId: 'asset-6', title: 'Generator Monthly Run', description: 'Monthly generator run and inspection.', faultType: 'Preventive Maintenance', priority: 'P4', status: 'closed', assignedToId: 'user-8', slaDeadline: addDays(3), createdAt: subDays(20), updatedAt: subDays(18), resolvedAt: subDays(18.5), closedAt: subDays(18) },
  { id: 'wo-32', number: 'WO-2024-00032', siteId: 'site-2', assetId: 'asset-28', title: 'Sprinkler System Inspection', description: 'Annual sprinkler inspection and certification.', faultType: 'Annual Inspection', priority: 'P2', status: 'closed', assignedToId: 'user-7', contractorId: 'contractor-5', slaDeadline: addDays(5), createdAt: subDays(14), updatedAt: subDays(12), resolvedAt: subDays(12.5), closedAt: subDays(12) },
];

const workOrderCostSeeds: Partial<
  Record<
    string,
    Pick<WorkOrder, 'labourEntries' | 'partsUsed' | 'totalLabourCost' | 'totalPartsCost' | 'totalCost'>
  >
> = {
  'wo-1': {
    labourEntries: [
      {
        id: 'lab-wo-1-1',
        technicianId: 'user-5',
        technicianName: 'Wong Chun Kit',
        hours: 2.5,
        ratePerHour: 95,
        date: subDays(0.09),
        description: 'Inspected AHU bearings and verified shaft alignment.',
      },
      {
        id: 'lab-wo-1-2',
        technicianId: 'user-6',
        technicianName: 'Raj Krishnan',
        hours: 1.5,
        ratePerHour: 110,
        date: subDays(0.08),
        description: 'Applied emergency balancing and test run.',
      },
    ],
    partsUsed: [
      {
        id: 'part-wo-1-1',
        inventoryItemId: 'inv-20',
        itemName: 'Bearing 6205 2RS',
        quantity: 4,
        unitCost: 22,
        date: subDays(0.08),
      },
      {
        id: 'part-wo-1-2',
        inventoryItemId: 'inv-22',
        itemName: 'Lubricant Grease 500g',
        quantity: 2,
        unitCost: 18,
        date: subDays(0.08),
      },
    ],
    totalLabourCost: 402.5,
    totalPartsCost: 124,
    totalCost: 526.5,
  },
  'wo-3': {
    labourEntries: [
      {
        id: 'lab-wo-3-1',
        technicianId: 'user-7',
        technicianName: 'Mei Ling',
        hours: 3,
        ratePerHour: 105,
        date: subDays(0.19),
        description: 'Performed leak check and pressure verification.',
      },
      {
        id: 'lab-wo-3-2',
        technicianId: 'user-5',
        technicianName: 'Wong Chun Kit',
        hours: 1.5,
        ratePerHour: 95,
        date: subDays(0.18),
        description: 'Recharged system and monitored superheat values.',
      },
    ],
    partsUsed: [
      {
        id: 'part-wo-3-1',
        inventoryItemId: 'inv-3',
        itemName: 'Refrigerant R410A 11.3kg',
        quantity: 2,
        unitCost: 320,
        date: subDays(0.18),
      },
      {
        id: 'part-wo-3-2',
        inventoryItemId: 'inv-4',
        itemName: 'Compressor Oil POE 5L',
        quantity: 1,
        unitCost: 95,
        date: subDays(0.18),
      },
    ],
    totalLabourCost: 457.5,
    totalPartsCost: 735,
    totalCost: 1192.5,
  },
  'wo-7': {
    labourEntries: [
      {
        id: 'lab-wo-7-1',
        technicianId: 'user-5',
        technicianName: 'Wong Chun Kit',
        hours: 4,
        ratePerHour: 95,
        date: subDays(1.95),
        description: 'Completed compressor teardown and servicing.',
      },
      {
        id: 'lab-wo-7-2',
        technicianId: 'user-6',
        technicianName: 'Raj Krishnan',
        hours: 2,
        ratePerHour: 110,
        date: subDays(1.9),
        description: 'Commissioning checks and vibration reading.',
      },
    ],
    partsUsed: [
      {
        id: 'part-wo-7-1',
        inventoryItemId: 'inv-4',
        itemName: 'Compressor Oil POE 5L',
        quantity: 2,
        unitCost: 95,
        date: subDays(1.92),
      },
      {
        id: 'part-wo-7-2',
        inventoryItemId: 'inv-21',
        itemName: 'Bearing 6310 2RS',
        quantity: 2,
        unitCost: 45,
        date: subDays(1.92),
      },
    ],
    totalLabourCost: 600,
    totalPartsCost: 280,
    totalCost: 880,
  },
  'wo-14': {
    labourEntries: [
      {
        id: 'lab-wo-14-1',
        technicianId: 'user-5',
        technicianName: 'Wong Chun Kit',
        hours: 2.5,
        ratePerHour: 95,
        date: subDays(1.6),
        description: 'Removed faulty door sensor and recalibrated landing sensors.',
      },
    ],
    partsUsed: [
      {
        id: 'part-wo-14-1',
        inventoryItemId: 'inv-11',
        itemName: 'Door Sensor Pair',
        quantity: 1,
        unitCost: 220,
        date: subDays(1.6),
      },
    ],
    totalLabourCost: 237.5,
    totalPartsCost: 220,
    totalCost: 457.5,
  },
  'wo-19': {
    labourEntries: [
      {
        id: 'lab-wo-19-1',
        technicianId: 'user-5',
        technicianName: 'Wong Chun Kit',
        hours: 5,
        ratePerHour: 120,
        date: subDays(0.14),
        description: 'Emergency bearing replacement and alignment.',
      },
      {
        id: 'lab-wo-19-2',
        technicianId: 'user-6',
        technicianName: 'Raj Krishnan',
        hours: 3,
        ratePerHour: 110,
        date: subDays(0.12),
        description: 'Functional tests and balancing verification.',
      },
    ],
    partsUsed: [
      {
        id: 'part-wo-19-1',
        inventoryItemId: 'inv-20',
        itemName: 'Bearing 6205 2RS',
        quantity: 6,
        unitCost: 22,
        date: subDays(0.13),
      },
      {
        id: 'part-wo-19-2',
        inventoryItemId: 'inv-4',
        itemName: 'Compressor Oil POE 5L',
        quantity: 2,
        unitCost: 95,
        date: subDays(0.13),
      },
      {
        id: 'part-wo-19-3',
        inventoryItemId: 'inv-1',
        itemName: 'AHU V-Belt A68',
        quantity: 1,
        unitCost: 45,
        date: subDays(0.13),
      },
    ],
    totalLabourCost: 930,
    totalPartsCost: 367,
    totalCost: 1297,
  },
  'wo-21': {
    labourEntries: [
      {
        id: 'lab-wo-21-1',
        technicianId: 'user-6',
        technicianName: 'Raj Krishnan',
        hours: 3.5,
        ratePerHour: 110,
        date: subDays(0.09),
        description: 'Lockout and breaker replacement work.',
      },
      {
        id: 'lab-wo-21-2',
        technicianId: 'user-7',
        technicianName: 'Mei Ling',
        hours: 2,
        ratePerHour: 105,
        date: subDays(0.09),
        description: 'Thermal scan and panel testing after replacement.',
      },
    ],
    partsUsed: [
      {
        id: 'part-wo-21-1',
        inventoryItemId: 'inv-7',
        itemName: 'Circuit Breaker 100A 3P',
        quantity: 1,
        unitCost: 450,
        date: subDays(0.09),
      },
      {
        id: 'part-wo-21-2',
        inventoryItemId: 'inv-10',
        itemName: 'Fuse 63A HRC',
        quantity: 2,
        unitCost: 35,
        date: subDays(0.09),
      },
      {
        id: 'part-wo-21-3',
        inventoryItemId: 'inv-23',
        itemName: 'Cable Tie 300mm (100pc)',
        quantity: 1,
        unitCost: 12,
        date: subDays(0.09),
      },
    ],
    totalLabourCost: 595,
    totalPartsCost: 532,
    totalCost: 1127,
  },
};

const calculateLabourCost = (entries: WorkOrderLabourEntry[]) =>
  entries.reduce((sum, entry) => sum + entry.hours * entry.ratePerHour, 0);

const calculatePartsCost = (entries: WorkOrderPartUsedEntry[]) =>
  entries.reduce((sum, entry) => sum + entry.quantity * entry.unitCost, 0);

export const workOrders: WorkOrder[] = seededWorkOrders.map((workOrder) => {
  const seededCost = workOrderCostSeeds[workOrder.id];
  const seededApproval = seededApprovalStates[workOrder.id];
  const labourEntries = seededCost?.labourEntries || [];
  const partsUsed = seededCost?.partsUsed || [];
  const totalLabourCost = seededCost?.totalLabourCost ?? calculateLabourCost(labourEntries);
  const totalPartsCost = seededCost?.totalPartsCost ?? calculatePartsCost(partsUsed);

  return {
    ...workOrder,
    labourEntries,
    partsUsed,
    totalLabourCost,
    totalPartsCost,
    totalCost: seededCost?.totalCost ?? totalLabourCost + totalPartsCost,
    approvalStatus: seededApproval?.approvalStatus || 'not_required',
    approvalChain: createApprovalChain(seededApproval?.approvalChain),
    slaBreached: workOrder.slaBreached ?? false,
    escalationLog: workOrder.escalationLog ?? [],
  };
});

// Contractors
export const contractors: Contractor[] = [
  {
    id: 'contractor-1', companyName: 'CoolTech HVAC Solutions', contactName: 'Tan Ah Kow', email: 'ahkow@cooltech.com.my', phone: '+60 12-345 6789',
    specialties: ['HVAC'], licenseNumber: 'HVAC-KL-2019-0045', licenseExpiry: addDays(180), insuranceExpiry: addDays(90),
    performanceScore: 92, avgResponseTime: 2.5, completionRate: 96, activeWorkOrdersCount: 3, siteIds: ['site-1', 'site-2', 'site-3']
  },
  {
    id: 'contractor-2', companyName: 'PowerGrid Electrical Services', contactName: 'Muthu Krishnan', email: 'muthu@powergrid.com.my', phone: '+60 12-456 7890',
    specialties: ['Electrical'], licenseNumber: 'ELEC-SEL-2020-0123', licenseExpiry: addDays(365), insuranceExpiry: addDays(200),
    performanceScore: 88, avgResponseTime: 1.8, completionRate: 94, activeWorkOrdersCount: 2, siteIds: ['site-1', 'site-2', 'site-3']
  },
  {
    id: 'contractor-3', companyName: 'VerticalMove Elevator Services', contactName: 'Lim Boon Heng', email: 'boonheng@verticalmove.com.my', phone: '+60 12-567 8901',
    specialties: ['Elevator'], licenseNumber: 'LIFT-KL-2018-0089', licenseExpiry: addDays(45), insuranceExpiry: addDays(120),
    performanceScore: 95, avgResponseTime: 1.2, completionRate: 98, activeWorkOrdersCount: 4, siteIds: ['site-1', 'site-2', 'site-3']
  },
  {
    id: 'contractor-4', companyName: 'AquaFlow Plumbing', contactName: 'Rajan Suppiah', email: 'rajan@aquaflow.com.my', phone: '+60 12-678 9012',
    specialties: ['Plumbing'], licenseNumber: 'PLMB-KL-2021-0067', licenseExpiry: addDays(520), insuranceExpiry: addDays(300),
    performanceScore: 85, avgResponseTime: 3.0, completionRate: 90, activeWorkOrdersCount: 1, siteIds: ['site-1', 'site-3']
  },
  {
    id: 'contractor-5', companyName: 'FireSafe Systems', contactName: 'Azman bin Ahmad', email: 'azman@firesafe.com.my', phone: '+60 12-789 0123',
    specialties: ['Fire Safety'], licenseNumber: 'FIRE-MY-2019-0234', licenseExpiry: addDays(290), insuranceExpiry: addDays(250),
    performanceScore: 97, avgResponseTime: 0.8, completionRate: 99, activeWorkOrdersCount: 1, siteIds: ['site-1', 'site-2', 'site-3']
  },
  {
    id: 'contractor-6', companyName: 'BuildStrong Structural', contactName: 'Wong Yew Chuan', email: 'yewchuan@buildstrong.com.my', phone: '+60 12-890 1234',
    specialties: ['Structural'], licenseNumber: 'STRUC-KL-2017-0012', licenseExpiry: addDays(60), insuranceExpiry: addDays(30),
    performanceScore: 90, avgResponseTime: 4.0, completionRate: 95, activeWorkOrdersCount: 0, siteIds: ['site-1', 'site-2', 'site-3']
  },
  {
    id: 'contractor-7', companyName: 'TechConnect AV Solutions', contactName: 'Steven Goh', email: 'steven@techconnect.com.my', phone: '+60 12-901 2345',
    specialties: ['IT/AV'], licenseNumber: 'ITAV-SEL-2022-0056', licenseExpiry: addDays(400), insuranceExpiry: addDays(350),
    performanceScore: 91, avgResponseTime: 2.0, completionRate: 93, activeWorkOrdersCount: 0, siteIds: ['site-1', 'site-2', 'site-3']
  },
  {
    id: 'contractor-8', companyName: 'AllFix General Maintenance', contactName: 'Hassan Ibrahim', email: 'hassan@allfix.com.my', phone: '+60 12-012 3456',
    specialties: ['General', 'Plumbing'], licenseNumber: 'GEN-KL-2020-0189', licenseExpiry: addDays(150), insuranceExpiry: addDays(100),
    performanceScore: 82, avgResponseTime: 2.8, completionRate: 88, activeWorkOrdersCount: 2, siteIds: ['site-2', 'site-3']
  },
  {
    id: 'contractor-9', companyName: 'Arctic Air Conditioning', contactName: 'David Chen', email: 'david@arcticair.com.my', phone: '+60 12-123 4567',
    specialties: ['HVAC'], licenseNumber: 'HVAC-SEL-2021-0078', licenseExpiry: addDays(-15), insuranceExpiry: addDays(180),
    performanceScore: 78, avgResponseTime: 3.5, completionRate: 85, activeWorkOrdersCount: 1, siteIds: ['site-2']
  },
  {
    id: 'contractor-10', companyName: 'SafeLift Engineering', contactName: 'Ahmad Faizal', email: 'faizal@safelift.com.my', phone: '+60 12-234 5678',
    specialties: ['Elevator'], licenseNumber: 'LIFT-MY-2019-0156', licenseExpiry: addDays(220), insuranceExpiry: addDays(180),
    performanceScore: 89, avgResponseTime: 1.5, completionRate: 92, activeWorkOrdersCount: 0, siteIds: ['site-3']
  },
];

// PM Schedules
export const pmSchedules: PMSchedule[] = [
  // HVAC PM Schedules
  { id: 'pm-1', name: 'AHU Monthly Filter Check', assetId: 'asset-1', siteId: 'site-1', frequency: 'monthly', lastDoneDate: subDays(25), nextDueDate: addDays(5), status: 'upcoming', autoCreateWO: true, checklist: ['Check filter condition', 'Check belt tension', 'Check motor amperage', 'Log readings'], assignedToId: 'user-5', estimatedDuration: 45 },
  { id: 'pm-2', name: 'AHU-PKL-02 Emergency Inspection', assetId: 'asset-2', siteId: 'site-1', frequency: 'weekly', lastDoneDate: subDays(10), nextDueDate: subDays(3), status: 'overdue', autoCreateWO: true, checklist: ['Visual inspection', 'Check vibration', 'Check noise level', 'Check temperature'], assignedToId: 'user-5', estimatedDuration: 30 },
  { id: 'pm-3', name: 'Chiller Quarterly Service', assetId: 'asset-3', siteId: 'site-1', frequency: 'quarterly', lastDoneDate: subDays(85), nextDueDate: addDays(5), status: 'upcoming', autoCreateWO: true, checklist: ['Oil analysis', 'Refrigerant check', 'Compressor inspection', 'Control calibration', 'Performance test'], assignedToId: 'user-5', estimatedDuration: 240 },
  { id: 'pm-4', name: 'Chiller-SP-02 Monthly Check', assetId: 'asset-20', siteId: 'site-2', frequency: 'monthly', lastDoneDate: subDays(35), nextDueDate: subDays(5), status: 'overdue', autoCreateWO: true, checklist: ['Check refrigerant levels', 'Check oil level', 'Log operating parameters'], assignedToId: 'user-7', estimatedDuration: 60 },

  // Electrical PM Schedules
  { id: 'pm-5', name: 'MDB Thermal Imaging', assetId: 'asset-5', siteId: 'site-1', frequency: 'quarterly', lastDoneDate: subDays(80), nextDueDate: addDays(10), status: 'upcoming', autoCreateWO: true, checklist: ['Thermal imaging scan', 'Check connections', 'Document findings', 'Report generation'], assignedToId: 'user-6', estimatedDuration: 120 },
  { id: 'pm-6', name: 'Generator Monthly Test', assetId: 'asset-6', siteId: 'site-1', frequency: 'monthly', lastDoneDate: subDays(28), nextDueDate: addDays(2), status: 'upcoming', autoCreateWO: true, checklist: ['Start test', 'Load test 30 min', 'Check fuel level', 'Check coolant', 'Log readings'], assignedToId: 'user-8', estimatedDuration: 90 },
  { id: 'pm-7', name: 'UPS Battery Check', assetId: 'asset-7', siteId: 'site-1', frequency: 'monthly', lastDoneDate: subDays(45), nextDueDate: subDays(15), status: 'overdue', autoCreateWO: true, checklist: ['Check battery voltage', 'Check temperature', 'Visual inspection', 'Run diagnostics'], assignedToId: 'user-8', estimatedDuration: 45 },

  // Elevator PM Schedules
  { id: 'pm-8', name: 'Lift-PKL-01 Monthly Inspection', assetId: 'asset-8', siteId: 'site-1', frequency: 'monthly', lastDoneDate: subDays(5), nextDueDate: addDays(25), status: 'upcoming', autoCreateWO: true, checklist: ['Door operation', 'Safety devices', 'Leveling', 'Emergency phone', 'Cleaning'], assignedToId: 'user-8', estimatedDuration: 60 },
  { id: 'pm-9', name: 'Escalator Weekly Check', assetId: 'asset-10', siteId: 'site-1', frequency: 'weekly', lastDoneDate: subDays(5), nextDueDate: addDays(2), status: 'upcoming', autoCreateWO: true, checklist: ['Step condition', 'Handrail speed', 'Safety stops', 'Comb plates'], assignedToId: 'user-8', estimatedDuration: 30 },
  { id: 'pm-10', name: 'Lift-SP Quarterly Service', assetId: 'asset-24', siteId: 'site-2', frequency: 'quarterly', lastDoneDate: subDays(4), nextDueDate: addDays(86), status: 'upcoming', autoCreateWO: true, checklist: ['Full safety test', 'Governor test', 'Buffer test', 'Door force test', 'Rope inspection'], assignedToId: 'user-7', estimatedDuration: 180 },

  // Fire Safety PM Schedules
  { id: 'pm-11', name: 'Fire Pump Weekly Test', assetId: 'asset-11', siteId: 'site-1', frequency: 'weekly', lastDoneDate: subDays(3), nextDueDate: addDays(4), status: 'upcoming', autoCreateWO: true, checklist: ['Churn test', 'Check pressure', 'Visual inspection', 'Log results'], assignedToId: 'user-6', estimatedDuration: 30 },
  { id: 'pm-12', name: 'Fire Alarm Monthly Test', assetId: 'asset-12', siteId: 'site-1', frequency: 'monthly', lastDoneDate: subDays(2), nextDueDate: addDays(28), status: 'upcoming', autoCreateWO: true, checklist: ['Zone test', 'Detector test', 'Alarm verification', 'Panel check'], assignedToId: 'user-6', estimatedDuration: 120 },
  { id: 'pm-13', name: 'Sprinkler Annual Inspection', assetId: 'asset-28', siteId: 'site-2', frequency: 'annual', lastDoneDate: subDays(1), nextDueDate: addDays(364), status: 'done', autoCreateWO: true, checklist: ['Full system inspection', 'Flow test', 'Head inspection', 'Valve test', 'Certification'], assignedToId: 'user-7', estimatedDuration: 480 },

  // Plumbing PM Schedules
  { id: 'pm-14', name: 'Water Pump Quarterly Service', assetId: 'asset-13', siteId: 'site-1', frequency: 'quarterly', lastDoneDate: subDays(40), nextDueDate: addDays(50), status: 'upcoming', autoCreateWO: true, checklist: ['Seal inspection', 'Bearing check', 'Impeller inspection', 'Performance test'], assignedToId: 'user-6', estimatedDuration: 120 },
  { id: 'pm-15', name: 'STP Weekly Check', assetId: 'asset-14', siteId: 'site-1', frequency: 'weekly', lastDoneDate: subDays(6), nextDueDate: addDays(1), status: 'upcoming', autoCreateWO: true, checklist: ['Check BOD levels', 'Aeration check', 'Sludge level', 'Chemical dosing'], assignedToId: 'user-6', estimatedDuration: 45 },

  // More PM Schedules for all sites
  { id: 'pm-16', name: 'AHU-SP-01 Monthly Service', assetId: 'asset-17', siteId: 'site-2', frequency: 'monthly', lastDoneDate: subDays(12), nextDueDate: addDays(18), status: 'upcoming', autoCreateWO: true, checklist: ['Filter check', 'Coil cleaning', 'Fan inspection', 'Belt check'], assignedToId: 'user-7', estimatedDuration: 60 },
  { id: 'pm-17', name: 'Cooling Tower Monthly', assetId: 'asset-30', siteId: 'site-2', frequency: 'monthly', lastDoneDate: subDays(20), nextDueDate: addDays(10), status: 'upcoming', autoCreateWO: true, checklist: ['Water treatment', 'Fan check', 'Fill media inspection', 'Basin cleaning'], assignedToId: 'user-7', estimatedDuration: 90 },
  { id: 'pm-18', name: 'MDB-MV Annual Service', assetId: 'asset-36', siteId: 'site-3', frequency: 'annual', lastDoneDate: subDays(30), nextDueDate: addDays(335), status: 'upcoming', autoCreateWO: true, checklist: ['Full thermal imaging', 'Torque check', 'Insulation test', 'Protection test'], assignedToId: 'user-6', estimatedDuration: 360 },
  { id: 'pm-19', name: 'BMS Server Quarterly Check', assetId: 'asset-49', siteId: 'site-3', frequency: 'quarterly', lastDoneDate: subDays(5), nextDueDate: addDays(85), status: 'upcoming', autoCreateWO: true, checklist: ['Backup verification', 'Software updates', 'Performance check', 'Alarm review'], assignedToId: 'user-6', estimatedDuration: 60 },
  { id: 'pm-20', name: 'LED Display Weekly Check', assetId: 'asset-50', siteId: 'site-3', frequency: 'weekly', lastDoneDate: subDays(2), nextDueDate: addDays(5), status: 'upcoming', autoCreateWO: true, checklist: ['Pixel check', 'Brightness calibration', 'Content verification'], assignedToId: 'user-6', estimatedDuration: 20 },
];

// Inventory Items
export const inventoryItems: InventoryItem[] = [
  // HVAC Parts
  { id: 'inv-1', name: 'AHU V-Belt A68', sku: 'BELT-V-A68', description: 'V-Belt for AHU fan drive', assetTypes: ['HVAC'], quantityOnHand: 12, minimumStock: 5, unitCost: 45.00, location: 'Store A-1', siteId: 'site-1' },
  { id: 'inv-2', name: 'HEPA Filter 24x24x4', sku: 'FILT-HEPA-24', description: 'HEPA filter for AHU', assetTypes: ['HVAC'], quantityOnHand: 8, minimumStock: 10, unitCost: 180.00, location: 'Store A-2', siteId: 'site-1' },
  { id: 'inv-3', name: 'Refrigerant R410A 11.3kg', sku: 'REF-R410A-11', description: 'R410A refrigerant cylinder', assetTypes: ['HVAC'], quantityOnHand: 4, minimumStock: 3, unitCost: 320.00, location: 'Store A-3', siteId: 'site-1' },
  { id: 'inv-4', name: 'Compressor Oil POE 5L', sku: 'OIL-POE-5L', description: 'Polyol Ester oil for compressors', assetTypes: ['HVAC'], quantityOnHand: 6, minimumStock: 4, unitCost: 95.00, location: 'Store A-3', siteId: 'site-1' },
  { id: 'inv-5', name: 'Fan Motor 2HP 3PH', sku: 'MTR-FAN-2HP', description: '2HP 3-phase fan motor', assetTypes: ['HVAC'], quantityOnHand: 2, minimumStock: 2, unitCost: 850.00, location: 'Store B-1', siteId: 'site-2' },
  { id: 'inv-6', name: 'Pleated Filter 20x20x2', sku: 'FILT-PL-20', description: 'Pleated air filter', assetTypes: ['HVAC'], quantityOnHand: 24, minimumStock: 20, unitCost: 25.00, location: 'Store A-2', siteId: 'site-2' },

  // Electrical Parts
  { id: 'inv-7', name: 'Circuit Breaker 100A 3P', sku: 'CB-100A-3P', description: '100A 3-pole circuit breaker', assetTypes: ['Electrical'], quantityOnHand: 3, minimumStock: 2, unitCost: 450.00, location: 'Store C-1', siteId: 'site-1' },
  { id: 'inv-8', name: 'Contactor 40A 3P', sku: 'CONT-40A-3P', description: '40A 3-pole contactor', assetTypes: ['Electrical'], quantityOnHand: 5, minimumStock: 3, unitCost: 180.00, location: 'Store C-1', siteId: 'site-1' },
  { id: 'inv-9', name: 'UPS Battery 12V 100Ah', sku: 'BAT-12V-100', description: 'UPS replacement battery', assetTypes: ['Electrical'], quantityOnHand: 4, minimumStock: 8, unitCost: 280.00, location: 'Store C-2', siteId: 'site-1' },
  { id: 'inv-10', name: 'Fuse 63A HRC', sku: 'FUSE-63A-HRC', description: '63A HRC fuse link', assetTypes: ['Electrical'], quantityOnHand: 10, minimumStock: 6, unitCost: 35.00, location: 'Store C-1', siteId: 'site-3' },

  // Elevator Parts
  { id: 'inv-11', name: 'Door Sensor Pair', sku: 'ELEV-DOOR-SNR', description: 'Elevator door safety sensor pair', assetTypes: ['Elevator'], quantityOnHand: 4, minimumStock: 2, unitCost: 220.00, location: 'Store D-1', siteId: 'site-1' },
  { id: 'inv-12', name: 'Guide Shoe Insert', sku: 'ELEV-GUIDE-INS', description: 'Elevator guide shoe insert', assetTypes: ['Elevator'], quantityOnHand: 8, minimumStock: 4, unitCost: 85.00, location: 'Store D-1', siteId: 'site-2' },
  { id: 'inv-13', name: 'Escalator Step Chain', sku: 'ESC-CHAIN-1M', description: 'Escalator step chain per meter', assetTypes: ['Elevator'], quantityOnHand: 5, minimumStock: 3, unitCost: 150.00, location: 'Store D-2', siteId: 'site-2' },

  // Fire Safety Parts
  { id: 'inv-14', name: 'Smoke Detector Optical', sku: 'FIRE-DET-OPT', description: 'Optical smoke detector', assetTypes: ['Fire Safety'], quantityOnHand: 15, minimumStock: 10, unitCost: 65.00, location: 'Store E-1', siteId: 'site-1' },
  { id: 'inv-15', name: 'Sprinkler Head 68C', sku: 'FIRE-SPR-68', description: 'Sprinkler head 68°C fusible link', assetTypes: ['Fire Safety'], quantityOnHand: 20, minimumStock: 15, unitCost: 18.00, location: 'Store E-1', siteId: 'site-2' },
  { id: 'inv-16', name: 'Fire Pump Seal Kit', sku: 'FIRE-PUMP-SEAL', description: 'Mechanical seal kit for fire pump', assetTypes: ['Fire Safety'], quantityOnHand: 2, minimumStock: 2, unitCost: 380.00, location: 'Store E-2', siteId: 'site-3' },

  // Plumbing Parts
  { id: 'inv-17', name: 'Pump Mechanical Seal 50mm', sku: 'PLMB-SEAL-50', description: '50mm mechanical seal', assetTypes: ['Plumbing'], quantityOnHand: 3, minimumStock: 2, unitCost: 145.00, location: 'Store F-1', siteId: 'site-1' },
  { id: 'inv-18', name: 'Ball Valve 2" Brass', sku: 'PLMB-BV-2IN', description: '2 inch brass ball valve', assetTypes: ['Plumbing'], quantityOnHand: 6, minimumStock: 4, unitCost: 75.00, location: 'Store F-1', siteId: 'site-1' },
  { id: 'inv-19', name: 'Pressure Gauge 0-10 Bar', sku: 'PLMB-GAUGE-10', description: 'Pressure gauge 0-10 bar range', assetTypes: ['Plumbing'], quantityOnHand: 4, minimumStock: 3, unitCost: 55.00, location: 'Store F-2', siteId: 'site-2' },

  // General Parts
  { id: 'inv-20', name: 'Bearing 6205 2RS', sku: 'BRG-6205-2RS', description: 'Ball bearing 6205 2RS', assetTypes: ['HVAC', 'Plumbing', 'General'], quantityOnHand: 15, minimumStock: 10, unitCost: 22.00, location: 'Store G-1', siteId: 'site-1' },
  { id: 'inv-21', name: 'Bearing 6310 2RS', sku: 'BRG-6310-2RS', description: 'Ball bearing 6310 2RS', assetTypes: ['HVAC', 'Plumbing', 'General'], quantityOnHand: 8, minimumStock: 5, unitCost: 45.00, location: 'Store G-1', siteId: 'site-2' },
  { id: 'inv-22', name: 'Lubricant Grease 500g', sku: 'LUB-GREASE-500', description: 'Multi-purpose grease', assetTypes: ['HVAC', 'Elevator', 'General'], quantityOnHand: 12, minimumStock: 8, unitCost: 18.00, location: 'Store G-2', siteId: 'site-3' },
  { id: 'inv-23', name: 'Cable Tie 300mm (100pc)', sku: 'MISC-CT-300', description: 'Nylon cable tie 300mm pack', assetTypes: ['Electrical', 'IT/AV', 'General'], quantityOnHand: 5, minimumStock: 3, unitCost: 12.00, location: 'Store G-2', siteId: 'site-1' },
  { id: 'inv-24', name: 'LED Tube 4ft 18W', sku: 'LIGHT-LED-4FT', description: 'LED tube light 4 foot 18W', assetTypes: ['Electrical', 'General'], quantityOnHand: 30, minimumStock: 20, unitCost: 15.00, location: 'Store G-3', siteId: 'site-2' },
  { id: 'inv-25', name: 'Emergency Light Battery', sku: 'LIGHT-EMER-BAT', description: 'Emergency light NiCd battery', assetTypes: ['Electrical', 'Fire Safety'], quantityOnHand: 1, minimumStock: 5, unitCost: 45.00, location: 'Store G-3', siteId: 'site-3' },
];

// Alerts
export const alerts: Alert[] = [
  { id: 'alert-1', type: 'sla_breach', severity: 'critical', title: 'SLA Breach Warning', description: 'WO-2024-00002 MDB Overheating - P1 SLA deadline in 2 hours', relatedEntityId: 'wo-2', relatedEntityType: 'work_order', createdAt: subDays(0.05) },
  { id: 'alert-2', type: 'critical_fault', severity: 'critical', title: 'Critical Asset Fault', description: 'AHU-PKL-02 health score dropped to 45% - Bearing failure suspected', relatedEntityId: 'asset-2', relatedEntityType: 'asset', createdAt: subDays(0.1) },
  { id: 'alert-3', type: 'critical_fault', severity: 'critical', title: 'UPS Critical', description: 'UPS-PKL-01 battery health at 35% - Immediate replacement needed', relatedEntityId: 'asset-7', relatedEntityType: 'asset', createdAt: subDays(0.5) },
  { id: 'alert-4', type: 'pm_overdue', severity: 'warning', title: 'PM Schedule Overdue', description: 'AHU-PKL-02 weekly inspection overdue by 3 days', relatedEntityId: 'pm-2', relatedEntityType: 'pm_schedule', createdAt: subDays(0.2) },
  { id: 'alert-5', type: 'pm_overdue', severity: 'warning', title: 'PM Schedule Overdue', description: 'Chiller-SP-02 monthly check overdue by 5 days', relatedEntityId: 'pm-4', relatedEntityType: 'pm_schedule', createdAt: subDays(0.3) },
  { id: 'alert-6', type: 'low_stock', severity: 'warning', title: 'Low Inventory Stock', description: 'HEPA Filter 24x24x4 below minimum stock (8/10)', relatedEntityId: 'inv-2', relatedEntityType: 'inventory', createdAt: subDays(1) },
  { id: 'alert-7', type: 'low_stock', severity: 'critical', title: 'Critical Stock Level', description: 'UPS Battery 12V 100Ah critically low (4/8)', relatedEntityId: 'inv-9', relatedEntityType: 'inventory', createdAt: subDays(0.8) },
  { id: 'alert-8', type: 'license_expiry', severity: 'critical', title: 'License Expired', description: 'Arctic Air Conditioning license expired 15 days ago', relatedEntityId: 'contractor-9', relatedEntityType: 'contractor', createdAt: subDays(0.1) },
  { id: 'alert-9', type: 'license_expiry', severity: 'warning', title: 'License Expiring Soon', description: 'BuildStrong Structural insurance expires in 30 days', relatedEntityId: 'contractor-6', relatedEntityType: 'contractor', createdAt: subDays(2) },
  { id: 'alert-10', type: 'license_expiry', severity: 'warning', title: 'License Expiring Soon', description: 'VerticalMove Elevator Services license expires in 45 days', relatedEntityId: 'contractor-3', relatedEntityType: 'contractor', createdAt: subDays(5) },
];

export const thresholdRulesSeed: ThresholdRule[] = [
  { id: 'rule-1', name: 'HVAC Temperature Watch', assetType: 'HVAC', sensorType: 'temperature', warning: 30, critical: 36, enabled: true, autoCreateWorkOrder: true },
  { id: 'rule-2', name: 'HVAC Vibration Escalation', assetType: 'HVAC', sensorType: 'vibration', warning: 4.2, critical: 5.8, enabled: true, autoCreateWorkOrder: true },
  { id: 'rule-3', name: 'HVAC Power Draw Spike', assetType: 'HVAC', sensorType: 'powerDraw', warning: 60, critical: 78, enabled: true, autoCreateWorkOrder: true },
  { id: 'rule-4', name: 'Elevator Ride Comfort', assetType: 'Elevator', sensorType: 'vibration', warning: 3.8, critical: 5.2, enabled: true, autoCreateWorkOrder: true },
  { id: 'rule-5', name: 'Elevator Motor Heat', assetType: 'Elevator', sensorType: 'temperature', warning: 42, critical: 50, enabled: true, autoCreateWorkOrder: true },
  { id: 'rule-6', name: 'Electrical Panel Load', assetType: 'Electrical', sensorType: 'powerDraw', warning: 72, critical: 94, enabled: true, autoCreateWorkOrder: true },
  { id: 'rule-7', name: 'Electrical Thermal Stress', assetType: 'Electrical', sensorType: 'temperature', warning: 45, critical: 54, enabled: true, autoCreateWorkOrder: true },
  { id: 'rule-8', name: 'Plumbing Pump Pressure', assetType: 'Plumbing', sensorType: 'pressure', warning: 6.8, critical: 8.6, enabled: true, autoCreateWorkOrder: true },
  { id: 'rule-9', name: 'Plumbing Room Heat', assetType: 'Plumbing', sensorType: 'temperature', warning: 37, critical: 44, enabled: true, autoCreateWorkOrder: false },
  { id: 'rule-10', name: 'Fire Line Pressure', assetType: 'Fire Safety', sensorType: 'pressure', warning: 6.2, critical: 7.6, enabled: true, autoCreateWorkOrder: true },
  { id: 'rule-11', name: 'IT Rack Temperature', assetType: 'IT/AV', sensorType: 'temperature', warning: 28, critical: 35, enabled: true, autoCreateWorkOrder: false },
  { id: 'rule-12', name: 'Data Room Humidity', assetType: 'IT/AV', sensorType: 'humidity', warning: 65, critical: 78, enabled: true, autoCreateWorkOrder: false },
  { id: 'rule-13', name: 'Structural Moisture Alert', assetType: 'Structural', sensorType: 'humidity', warning: 72, critical: 84, enabled: false, autoCreateWorkOrder: false },
  { id: 'rule-14', name: 'General Thermal Baseline', assetType: 'General', sensorType: 'temperature', warning: 33, critical: 40, enabled: true, autoCreateWorkOrder: false },
  { id: 'rule-15', name: 'General Humidity Baseline', assetType: 'General', sensorType: 'humidity', warning: 70, critical: 82, enabled: false, autoCreateWorkOrder: false },
  { id: 'rule-16', name: 'Portfolio Vibration Watch', assetType: 'all', sensorType: 'vibration', warning: 4.8, critical: 6.6, enabled: true, autoCreateWorkOrder: true },
  { id: 'rule-17', name: 'Portfolio Pressure Integrity', assetType: 'all', sensorType: 'pressure', warning: 6.9, critical: 8.9, enabled: false, autoCreateWorkOrder: true },
  { id: 'rule-18', name: 'Portfolio Power Governance', assetType: 'all', sensorType: 'powerDraw', warning: 82, critical: 102, enabled: false, autoCreateWorkOrder: false },
];

export const notifications: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'work_order',
    title: 'P1 WO #WO-003: AHU-B2 Compressor Failure — SLA breach in 45 minutes',
    message: 'Immediate escalation required to avoid SLA violation.',
    timestamp: subDays(0.03),
    read: false,
    severity: 'critical',
  },
  {
    id: 'notif-2',
    type: 'pm',
    title: 'PM Overdue: Pavilion KL — Fire Suppression System (14 days overdue)',
    message: 'Preventive maintenance task is overdue and requires scheduling.',
    timestamp: subDays(0.2),
    read: false,
    severity: 'warning',
  },
  {
    id: 'notif-3',
    type: 'work_order',
    title: 'WO #WO-012 resolved by Ahmad Rizal — awaiting verification',
    message: 'Please review and verify closure details.',
    timestamp: subDays(0.45),
    read: false,
    severity: 'info',
  },
  {
    id: 'notif-4',
    type: 'inventory',
    title: 'Low stock alert: HVAC Filter 25x25 (3 units remaining, reorder at 10)',
    message: 'Inventory threshold breached for critical HVAC consumable.',
    timestamp: subDays(0.75),
    read: false,
    severity: 'warning',
  },
  {
    id: 'notif-5',
    type: 'contractor',
    title: 'Contractor license expiring: CoolTech Services — in 12 days',
    message: 'Renewal follow-up required to maintain compliance.',
    timestamp: subDays(1.2),
    read: false,
    severity: 'warning',
  },
];

const permitChecklistTemplate: Record<PermitChecklistPhase, string[]> = {
  pre: ['Review JSA and work scope', 'Confirm PPE and emergency equipment'],
  during: ['Maintain barricade and signage', 'Monitor hazards and gas/energy readings'],
  post: ['Restore area and remove temporary controls', 'Complete permit handover and closeout briefing'],
};

const createPermitChecklist = (
  permitId: string,
  completedIds: string[] = [],
  completedById = 'user-5'
): PermitSafetyChecklistItem[] => {
  return (Object.entries(permitChecklistTemplate) as [PermitChecklistPhase, string[]][]).flatMap(
    ([phase, items]) =>
      items.map((item, index) => {
        const checklistId = `${permitId}-${phase}-${index + 1}`;
        const completed = completedIds.includes(checklistId);

        return {
          id: checklistId,
          phase,
          item,
          completed,
          completedBy: completed ? completedById : undefined,
          completedAt: completed ? subDays(0.3 - index * 0.02) : undefined,
        };
      })
  );
};

export const permits: Permit[] = [
  {
    id: 'permit-1',
    workOrderId: 'wo-2',
    permitNumber: 'PTW-2026-0001',
    type: 'electrical_isolation',
    status: 'active',
    issuedById: 'user-2',
    issuedByName: 'Lee Wei Ming',
    validFrom: subDays(0.15),
    validTo: addHours(10),
    location: 'B3 • Electrical Room • MDB-MV-02',
    riskLevel: 'high',
    precautions: ['Apply LOTO on incoming feeder and downstream panel', 'Use CAT III insulated tools and arc-rated PPE', 'Assign standby person during energized testing'],
    safetyChecklist: createPermitChecklist('permit-1', ['permit-1-pre-1', 'permit-1-pre-2', 'permit-1-during-1'], 'user-6'),
  },
  {
    id: 'permit-2',
    workOrderId: 'wo-3',
    permitNumber: 'PTW-2026-0002',
    type: 'hot_work',
    status: 'issued',
    issuedById: 'user-3',
    issuedByName: 'Kumar Suresh',
    validFrom: subDays(0.1),
    validTo: addHours(12),
    location: 'B3 • Chiller Plant Room',
    riskLevel: 'medium',
    precautions: ['Remove combustibles within 10m radius', 'Station fire extinguisher and fire watch', 'Verify ventilation before brazing'],
    safetyChecklist: createPermitChecklist('permit-2', ['permit-2-pre-1'], 'user-7'),
  },
  {
    id: 'permit-3',
    workOrderId: 'wo-5',
    permitNumber: 'PTW-2026-0003',
    type: 'working_at_height',
    status: 'draft',
    issuedById: 'user-4',
    issuedByName: 'Fatimah Abdullah',
    validFrom: addHours(2),
    validTo: addHours(14),
    location: 'L4 • Cargo Lift Shaft Access',
    riskLevel: 'high',
    precautions: ['Inspect anchor points and full-body harness', 'Deploy exclusion zone below work area', 'Keep rescue kit and trained rescuer on standby'],
    safetyChecklist: createPermitChecklist('permit-3'),
  },
  {
    id: 'permit-4',
    workOrderId: 'wo-7',
    permitNumber: 'PTW-2026-0004',
    type: 'confined_space',
    status: 'active',
    issuedById: 'user-2',
    issuedByName: 'Lee Wei Ming',
    validFrom: subDays(0.3),
    validTo: addHours(6),
    location: 'B3 • Chiller Sump Access Hatch',
    riskLevel: 'high',
    precautions: ['Continuous gas monitor required at entry point', 'Entry attendant must remain outside space', 'Use intrinsically safe lighting only'],
    safetyChecklist: createPermitChecklist('permit-4', ['permit-4-pre-1', 'permit-4-pre-2', 'permit-4-during-1', 'permit-4-during-2'], 'user-5'),
  },
  {
    id: 'permit-5',
    workOrderId: 'wo-8',
    permitNumber: 'PTW-2026-0005',
    type: 'electrical_isolation',
    status: 'closed',
    issuedById: 'user-2',
    issuedByName: 'Lee Wei Ming',
    validFrom: subDays(1.2),
    validTo: subDays(0.7),
    location: 'Main Lobby Lift Control Panel',
    riskLevel: 'medium',
    precautions: ['Isolate lift controller and verify zero voltage', 'Barricade lift landing doors on affected floors', 'Perform test run with emergency stop validation'],
    safetyChecklist: createPermitChecklist(
      'permit-5',
      ['permit-5-pre-1', 'permit-5-pre-2', 'permit-5-during-1', 'permit-5-during-2', 'permit-5-post-1', 'permit-5-post-2'],
      'user-8'
    ),
  },
  {
    id: 'permit-6',
    workOrderId: 'wo-10',
    permitNumber: 'PTW-2026-0006',
    type: 'general',
    status: 'issued',
    issuedById: 'user-2',
    issuedByName: 'Lee Wei Ming',
    validFrom: subDays(0.4),
    validTo: addHours(18),
    location: 'B3 • Pump Room',
    riskLevel: 'low',
    precautions: ['Use drip trays and absorbent pads for seal work', 'Maintain housekeeping to avoid slip hazards', 'Confirm isolation valves are tagged'],
    safetyChecklist: createPermitChecklist('permit-6', ['permit-6-pre-1', 'permit-6-pre-2'], 'user-6'),
  },
  {
    id: 'permit-7',
    workOrderId: 'wo-19',
    permitNumber: 'PTW-2026-0007',
    type: 'hot_work',
    status: 'active',
    issuedById: 'user-2',
    issuedByName: 'Lee Wei Ming',
    validFrom: subDays(0.09),
    validTo: addHours(5),
    location: 'B2 • AHU Service Corridor',
    riskLevel: 'high',
    precautions: ['Coordinate temporary fire detection bypass with security', 'Use spark containment blankets around motor mount', 'Conduct 60-minute post-work fire watch'],
    safetyChecklist: createPermitChecklist('permit-7', ['permit-7-pre-1', 'permit-7-during-1'], 'user-5'),
  },
  {
    id: 'permit-8',
    workOrderId: 'wo-21',
    permitNumber: 'PTW-2026-0008',
    type: 'electrical_isolation',
    status: 'cancelled',
    issuedById: 'user-4',
    issuedByName: 'Fatimah Abdullah',
    validFrom: subDays(0.2),
    validTo: addHours(4),
    location: 'B3 • Electrical Room South',
    riskLevel: 'high',
    precautions: ['Verify replacement breaker rating and trip curve', 'Confirm temporary load transfer plan before shutdown', 'Escalate abnormal heat readings to duty engineer'],
    safetyChecklist: createPermitChecklist('permit-8', ['permit-8-pre-1'], 'user-6'),
  },
  {
    id: 'permit-9',
    workOrderId: 'wo-24',
    permitNumber: 'PTW-2026-0009',
    type: 'confined_space',
    status: 'draft',
    issuedById: 'user-3',
    issuedByName: 'Kumar Suresh',
    validFrom: addHours(1),
    validTo: addHours(9),
    location: 'B2 • STP Access Chamber',
    riskLevel: 'high',
    precautions: ['Verify H2S detector calibration before entry', 'Ensure forced ventilation runs continuously', 'Use full body harness with lifeline'],
    safetyChecklist: createPermitChecklist('permit-9'),
  },
];

export const utilityTypeLabels: Record<UtilityType, string> = {
  Electricity: 'Electricity',
  Water: 'Water',
  Gas: 'Gas',
  'Chilled Water': 'Chilled Water',
  Sewerage: 'Sewerage',
};

export const dlpStatusLabels: Record<DLPStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  verified: 'Verified',
  accepted: 'Accepted',
};

export const reservationStatusLabels: Record<SpaceReservationStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const utilityBillsSeed: UtilityBill[] = [
  { id: 'ub-1', utilityType: 'Electricity', siteId: 'site-1', billingPeriod: '2025-11', amountRM: 148200, units: 312500, unitLabel: 'kWh', recordedAt: subDays(165) },
  { id: 'ub-2', utilityType: 'Water', siteId: 'site-1', billingPeriod: '2025-11', amountRM: 42100, units: 24900, unitLabel: 'm³', recordedAt: subDays(165), remarks: 'Cooling tower usage higher than baseline' },
  { id: 'ub-3', utilityType: 'Electricity', siteId: 'site-2', billingPeriod: '2025-12', amountRM: 136400, units: 281400, unitLabel: 'kWh', recordedAt: subDays(135) },
  { id: 'ub-4', utilityType: 'Water', siteId: 'site-2', billingPeriod: '2025-12', amountRM: 36900, units: 21400, unitLabel: 'm³', recordedAt: subDays(135) },
  { id: 'ub-5', utilityType: 'Electricity', siteId: 'site-3', billingPeriod: '2026-01', amountRM: 139900, units: 286800, unitLabel: 'kWh', recordedAt: subDays(105) },
  { id: 'ub-6', utilityType: 'Gas', siteId: 'site-3', billingPeriod: '2026-01', amountRM: 22400, units: 7150, unitLabel: 'MMBtu', recordedAt: subDays(105) },
  { id: 'ub-7', utilityType: 'Electricity', siteId: 'site-1', billingPeriod: '2026-02', amountRM: 151800, units: 318100, unitLabel: 'kWh', recordedAt: subDays(75) },
  { id: 'ub-8', utilityType: 'Water', siteId: 'site-1', billingPeriod: '2026-02', amountRM: 43500, units: 25950, unitLabel: 'm³', recordedAt: subDays(75) },
  { id: 'ub-9', utilityType: 'Chilled Water', siteId: 'site-2', billingPeriod: '2026-03', amountRM: 49800, units: 18400, unitLabel: 'RT-hr', recordedAt: subDays(45) },
  { id: 'ub-10', utilityType: 'Electricity', siteId: 'site-2', billingPeriod: '2026-03', amountRM: 141600, units: 293100, unitLabel: 'kWh', recordedAt: subDays(45) },
  { id: 'ub-11', utilityType: 'Electricity', siteId: 'site-3', billingPeriod: '2026-04', amountRM: 146300, units: 302700, unitLabel: 'kWh', recordedAt: subDays(15) },
  { id: 'ub-12', utilityType: 'Sewerage', siteId: 'site-3', billingPeriod: '2026-04', amountRM: 9100, units: 12000, unitLabel: 'm³', recordedAt: subDays(15) },
];

export const meterReadingsSeed: MeterReading[] = [
  { id: 'mr-1', utilityType: 'Electricity', siteId: 'site-1', meterId: 'EM-PKL-01', readingDate: subDays(180), previousReading: 1342000, currentReading: 1371100, consumption: 29100, unitLabel: 'kWh' },
  { id: 'mr-2', utilityType: 'Water', siteId: 'site-1', meterId: 'WM-PKL-02', readingDate: subDays(165), previousReading: 484900, currentReading: 487240, consumption: 2340, unitLabel: 'm³' },
  { id: 'mr-3', utilityType: 'Electricity', siteId: 'site-2', meterId: 'EM-SP-01', readingDate: subDays(150), previousReading: 1118400, currentReading: 1147200, consumption: 28800, unitLabel: 'kWh' },
  { id: 'mr-4', utilityType: 'Water', siteId: 'site-2', meterId: 'WM-SP-01', readingDate: subDays(135), previousReading: 402220, currentReading: 404180, consumption: 1960, unitLabel: 'm³' },
  { id: 'mr-5', utilityType: 'Electricity', siteId: 'site-3', meterId: 'EM-MV-01', readingDate: subDays(120), previousReading: 1215400, currentReading: 1244800, consumption: 29400, unitLabel: 'kWh' },
  { id: 'mr-6', utilityType: 'Gas', siteId: 'site-3', meterId: 'GM-MV-01', readingDate: subDays(105), previousReading: 93600, currentReading: 94320, consumption: 720, unitLabel: 'MMBtu' },
  { id: 'mr-7', utilityType: 'Electricity', siteId: 'site-1', meterId: 'EM-PKL-01', readingDate: subDays(90), previousReading: 1371100, currentReading: 1402200, consumption: 31100, unitLabel: 'kWh' },
  { id: 'mr-8', utilityType: 'Water', siteId: 'site-1', meterId: 'WM-PKL-02', readingDate: subDays(75), previousReading: 487240, currentReading: 489610, consumption: 2370, unitLabel: 'm³' },
  { id: 'mr-9', utilityType: 'Chilled Water', siteId: 'site-2', meterId: 'CWM-SP-03', readingDate: subDays(60), previousReading: 221100, currentReading: 223020, consumption: 1920, unitLabel: 'RT-hr' },
  { id: 'mr-10', utilityType: 'Electricity', siteId: 'site-2', meterId: 'EM-SP-01', readingDate: subDays(45), previousReading: 1147200, currentReading: 1176400, consumption: 29200, unitLabel: 'kWh' },
  { id: 'mr-11', utilityType: 'Electricity', siteId: 'site-3', meterId: 'EM-MV-01', readingDate: subDays(30), previousReading: 1244800, currentReading: 1275000, consumption: 30200, unitLabel: 'kWh' },
  { id: 'mr-12', utilityType: 'Sewerage', siteId: 'site-3', meterId: 'SW-MV-01', readingDate: subDays(15), previousReading: 172900, currentReading: 173940, consumption: 1040, unitLabel: 'm³' },
];

export const dlpDefectsSeed: DLPDefect[] = [
  { id: 'dlp-1', defectNo: 'DLP-PKL-001', siteId: 'site-1', location: 'L2 Retail Corridor', description: 'Ceiling water stain recurring near AHU duct chase.', contractorId: 'contractor-2', severity: 'High', status: 'open', reportedAt: subDays(32), targetRectificationDate: addDays(5), dlpExpiryDate: addDays(90) },
  { id: 'dlp-2', defectNo: 'DLP-PKL-002', siteId: 'site-1', location: 'B2 Loading Bay', description: 'Expansion joint sealant cracked along 6m stretch.', contractorId: 'contractor-1', severity: 'Medium', status: 'in_progress', reportedAt: subDays(41), targetRectificationDate: addDays(2), dlpExpiryDate: addDays(76) },
  { id: 'dlp-3', defectNo: 'DLP-PKL-003', siteId: 'site-1', location: 'L4 Family Washroom', description: 'Wall tile hollow sound and grout separation.', contractorId: 'contractor-8', severity: 'Low', status: 'verified', reportedAt: subDays(54), targetRectificationDate: subDays(5), verifiedAt: subDays(3), dlpExpiryDate: addDays(82) },
  { id: 'dlp-4', defectNo: 'DLP-SP-004', siteId: 'site-2', location: 'Main Atrium Skylight Zone', description: 'Condensation drip at mullion joint during rain.', contractorId: 'contractor-4', severity: 'Critical', status: 'in_progress', reportedAt: subDays(20), targetRectificationDate: addDays(1), dlpExpiryDate: addDays(61) },
  { id: 'dlp-5', defectNo: 'DLP-SP-005', siteId: 'site-2', location: 'L1 North Entrance', description: 'Stone cladding corner chipped and requires replacement.', contractorId: 'contractor-1', severity: 'Medium', status: 'accepted', reportedAt: subDays(90), targetRectificationDate: subDays(48), verifiedAt: subDays(40), acceptedAt: subDays(35), dlpExpiryDate: addDays(45) },
  { id: 'dlp-6', defectNo: 'DLP-SP-006', siteId: 'site-2', location: 'B3 Pump Room', description: 'Pipe support bracket misalignment causing vibration.', contractorId: 'contractor-6', severity: 'High', status: 'open', reportedAt: subDays(12), targetRectificationDate: addDays(6), dlpExpiryDate: addDays(40) },
  { id: 'dlp-7', defectNo: 'DLP-MV-007', siteId: 'site-3', location: 'L3 Cinema Lobby', description: 'Gypsum partition hairline crack at door frame.', contractorId: 'contractor-8', severity: 'Low', status: 'accepted', reportedAt: subDays(88), targetRectificationDate: subDays(60), verifiedAt: subDays(56), acceptedAt: subDays(50), dlpExpiryDate: addDays(33) },
  { id: 'dlp-8', defectNo: 'DLP-MV-008', siteId: 'site-3', location: 'B2 Generator Room', description: 'Acoustic panel detachment at corner fixing points.', contractorId: 'contractor-3', severity: 'High', status: 'verified', reportedAt: subDays(38), targetRectificationDate: subDays(4), verifiedAt: subDays(1), dlpExpiryDate: addDays(54) },
  { id: 'dlp-9', defectNo: 'DLP-MV-009', siteId: 'site-3', location: 'L1 South Lift Lobby', description: 'Lift lobby floor tile level mismatch causing trip edge.', contractorId: 'contractor-5', severity: 'Critical', status: 'in_progress', reportedAt: subDays(15), targetRectificationDate: addDays(4), dlpExpiryDate: addDays(29) },
  { id: 'dlp-10', defectNo: 'DLP-PKL-010', siteId: 'site-1', location: 'Roof Mechanical Deck', description: 'Rainwater downpipe bracket corrosion on fresh install.', contractorId: 'contractor-6', severity: 'Medium', status: 'open', reportedAt: subDays(8), targetRectificationDate: addDays(8), dlpExpiryDate: addDays(23) },
  { id: 'dlp-11', defectNo: 'DLP-SP-011', siteId: 'site-2', location: 'L2 Fire Escape Stair C', description: 'Emergency lighting lux level below commissioning baseline.', contractorId: 'contractor-3', severity: 'High', status: 'verified', reportedAt: subDays(47), targetRectificationDate: subDays(10), verifiedAt: subDays(7), dlpExpiryDate: addDays(18) },
  { id: 'dlp-12', defectNo: 'DLP-MV-012', siteId: 'site-3', location: 'B1 Service Corridor', description: 'Door closer installation loose; door slams shut.', contractorId: 'contractor-5', severity: 'Medium', status: 'accepted', reportedAt: subDays(62), targetRectificationDate: subDays(24), verifiedAt: subDays(20), acceptedAt: subDays(18), dlpExpiryDate: addDays(12) },
];

const createDrawingVersions = (
  docId: string,
  extension: string,
  ownerId: string,
  latestNote: string
): DrawingVersion[] => [
  {
    id: `${docId}-v1`,
    versionLabel: 'v1.0',
    fileName: `${docId}-v1.${extension}`,
    uploadedBy: ownerId,
    uploadedAt: subDays(120),
    note: 'Initial issue for construction handover',
  },
  {
    id: `${docId}-v2`,
    versionLabel: 'v1.1',
    fileName: `${docId}-v2.${extension}`,
    uploadedBy: ownerId,
    uploadedAt: subDays(45),
    note: latestNote,
  },
];

export const drawingDocumentsSeed: DrawingDocument[] = [
  { id: 'drw-1', documentNo: 'AWC-PKL-ARC-001', title: 'L1 Architectural General Arrangement', siteId: 'site-1', location: 'L1 Main Concourse', assetTag: 'ARC-ZONE-L1', format: 'CAD', discipline: 'Architecture', currentVersion: 'v1.1', uploadedBy: 'user-2', uploadedAt: subDays(45), versions: createDrawingVersions('drw-1', 'dwg', 'user-2', 'Updated tenant frontage setback line') },
  { id: 'drw-2', documentNo: 'AWC-PKL-MEP-012', title: 'AHU Ducting Layout B2', siteId: 'site-1', location: 'B2 Plant Corridor', assetTag: 'AHU-PKL-01', format: 'PDF', discipline: 'Mechanical', currentVersion: 'v1.1', uploadedBy: 'user-5', uploadedAt: subDays(39), versions: createDrawingVersions('drw-2', 'pdf', 'user-5', 'As-built with balancing dampers') },
  { id: 'drw-3', documentNo: 'AWC-PKL-ELV-006', title: 'Lift Control Panel Schematic', siteId: 'site-1', location: 'B3 Electrical Room', assetTag: 'LIFT-PKL-CTRL-01', format: 'CAD', discipline: 'Electrical', currentVersion: 'v1.1', uploadedBy: 'user-6', uploadedAt: subDays(36), versions: createDrawingVersions('drw-3', 'dwg', 'user-6', 'Breaker tagging revised') },
  { id: 'drw-4', documentNo: 'AWC-SP-ARC-009', title: 'Food Court Seating Plan', siteId: 'site-2', location: 'L3 Food Court', assetTag: 'SPACE-SP-L3', format: 'JPEG', discipline: 'Architecture', currentVersion: 'v1.1', uploadedBy: 'user-3', uploadedAt: subDays(34), versions: createDrawingVersions('drw-4', 'jpg', 'user-3', 'Tenant circulation path clarified') },
  { id: 'drw-5', documentNo: 'AWC-SP-MEP-021', title: 'Chilled Water Branch Line Diagram', siteId: 'site-2', location: 'B3 Chiller Plant', assetTag: 'CHW-SP-PLANT-02', format: 'PDF', discipline: 'Mechanical', currentVersion: 'v1.1', uploadedBy: 'user-7', uploadedAt: subDays(31), versions: createDrawingVersions('drw-5', 'pdf', 'user-7', 'Valve numbering synchronized with BMS tags') },
  { id: 'drw-6', documentNo: 'AWC-SP-ELV-018', title: 'MDB Single Line Diagram', siteId: 'site-2', location: 'B3 Electrical Room', assetTag: 'MDB-SP-01', format: 'CAD', discipline: 'Electrical', currentVersion: 'v1.1', uploadedBy: 'user-3', uploadedAt: subDays(29), versions: createDrawingVersions('drw-6', 'dwg', 'user-3', 'Updated emergency feeder notation') },
  { id: 'drw-7', documentNo: 'AWC-MV-ARC-003', title: 'Basement Wayfinding Signage Layout', siteId: 'site-3', location: 'B1 Car Park', assetTag: 'WAYFIND-MV-B1', format: 'JPEG', discipline: 'Architecture', currentVersion: 'v1.1', uploadedBy: 'user-4', uploadedAt: subDays(26), versions: createDrawingVersions('drw-7', 'jpg', 'user-4', 'Signage numbering updated after audit') },
  { id: 'drw-8', documentNo: 'AWC-MV-MEP-014', title: 'Sewer Pump P&ID', siteId: 'site-3', location: 'B2 Pump Room', assetTag: 'PUMP-MV-SEW-01', format: 'PDF', discipline: 'Mechanical', currentVersion: 'v1.1', uploadedBy: 'user-6', uploadedAt: subDays(24), versions: createDrawingVersions('drw-8', 'pdf', 'user-6', 'Isolator and bypass branch added') },
  { id: 'drw-9', documentNo: 'AWC-MV-ELV-022', title: 'Fire Alarm Loop Diagram', siteId: 'site-3', location: 'L2 Fire Command Center', assetTag: 'FA-MV-LOOP-2', format: 'CAD', discipline: 'Fire Safety', currentVersion: 'v1.1', uploadedBy: 'user-4', uploadedAt: subDays(20), versions: createDrawingVersions('drw-9', 'dwg', 'user-4', 'Address mapping corrected') },
  { id: 'drw-10', documentNo: 'AWC-PKL-ARC-019', title: 'Roof Drainage As-Built', siteId: 'site-1', location: 'Roof Mechanical Deck', assetTag: 'ROOF-PKL-DRN', format: 'PDF', discipline: 'Civil', currentVersion: 'v1.1', uploadedBy: 'user-2', uploadedAt: subDays(16), versions: createDrawingVersions('drw-10', 'pdf', 'user-2', 'Added drain outlet invert references') },
  { id: 'drw-11', documentNo: 'AWC-SP-IT-007', title: 'BMS Network Cabinet Layout', siteId: 'site-2', location: 'B2 ICT Room', assetTag: 'BMS-SP-NET-01', format: 'JPEG', discipline: 'IT/AV', currentVersion: 'v1.1', uploadedBy: 'user-7', uploadedAt: subDays(11), versions: createDrawingVersions('drw-11', 'jpg', 'user-7', 'Patch panel allocations refreshed') },
  { id: 'drw-12', documentNo: 'AWC-MV-ARC-016', title: 'Tenant Utility Corridor Plan', siteId: 'site-3', location: 'L1 Service Corridor', assetTag: 'UTIL-MV-L1', format: 'CAD', discipline: 'Architecture', currentVersion: 'v1.1', uploadedBy: 'user-4', uploadedAt: subDays(8), versions: createDrawingVersions('drw-12', 'dwg', 'user-4', 'Door swing clashes resolved') },
];

export const spaceReservationsSeed: SpaceReservation[] = [
  { id: 'res-1', siteId: 'site-1', room: 'FM Command Room', startDateTime: subDays(3), endDateTime: subDays(3 - 0.1), requester: 'Ahmad Rahman', event: 'Weekly FM Review', participants: 12, status: 'approved', requestedAt: subDays(9) },
  { id: 'res-2', siteId: 'site-1', room: 'Training Room A', startDateTime: addDays(1), endDateTime: addDays(1.12), requester: 'Lee Wei Ming', event: 'Permit to Work Briefing', participants: 26, status: 'pending', requestedAt: subDays(1) },
  { id: 'res-3', siteId: 'site-1', room: 'Meeting Pod 2', startDateTime: addDays(2), endDateTime: addDays(2.08), requester: 'Ravi Kumar', event: 'Vendor Coordination', participants: 6, status: 'approved', requestedAt: subDays(0.8) },
  { id: 'res-4', siteId: 'site-2', room: 'Operations Boardroom', startDateTime: addDays(3), endDateTime: addDays(3.13), requester: 'Kumar Suresh', event: 'Monthly Safety Committee', participants: 18, status: 'approved', requestedAt: subDays(2.5) },
  { id: 'res-5', siteId: 'site-2', room: 'Training Room B', startDateTime: addDays(4), endDateTime: addDays(4.1), requester: 'Mei Ling', event: 'BMS User Training', participants: 15, status: 'pending', requestedAt: subDays(0.5) },
  { id: 'res-6', siteId: 'site-2', room: 'Operations Boardroom', startDateTime: addDays(4), endDateTime: addDays(4.08), requester: 'Vendor Team', event: 'Defect Handover Review', participants: 10, status: 'rejected', requestedAt: subDays(1.1), remarks: 'Conflict with internal governance session' },
  { id: 'res-7', siteId: 'site-3', room: 'FM Command Room', startDateTime: addDays(5), endDateTime: addDays(5.12), requester: 'Fatimah Abdullah', event: 'DLP Progress Meeting', participants: 16, status: 'approved', requestedAt: subDays(2.2) },
  { id: 'res-8', siteId: 'site-3', room: 'Meeting Pod 1', startDateTime: addDays(6), endDateTime: addDays(6.07), requester: 'Raj Krishnan', event: 'Toolbox Session', participants: 8, status: 'pending', requestedAt: subDays(1.6) },
  { id: 'res-9', siteId: 'site-3', room: 'Training Room C', startDateTime: addDays(7), endDateTime: addDays(7.16), requester: 'Jennifer Lim', event: 'Tenant Engagement Clinic', participants: 30, status: 'approved', requestedAt: subDays(4) },
  { id: 'res-10', siteId: 'site-1', room: 'FM Command Room', startDateTime: addDays(8), endDateTime: addDays(8.09), requester: 'Security Control', event: 'Emergency Drill Briefing', participants: 20, status: 'pending', requestedAt: subDays(0.3) },
  { id: 'res-11', siteId: 'site-2', room: 'Meeting Pod 3', startDateTime: addDays(9), endDateTime: addDays(9.07), requester: 'Siti Norzahra', event: 'Work Order Triage', participants: 7, status: 'approved', requestedAt: subDays(1.7) },
  { id: 'res-12', siteId: 'site-3', room: 'Operations Boardroom', startDateTime: addDays(10), endDateTime: addDays(10.12), requester: 'Contractor Coordination Team', event: 'Lifecycle Planning Workshop', participants: 14, status: 'pending', requestedAt: subDays(0.4) },
];

export const kpiMonthlyRecordsSeed: KpiMonthlyRecord[] = [
  { id: 'kpi-2025-05', month: '2025-05', css: 77, customerRating: 79, responseTime: 96, pmCompliance: 83, woCompletion: 86, slaAdherence: 88, apdDeductionRM: 15800 },
  { id: 'kpi-2025-06', month: '2025-06', css: 78, customerRating: 80, responseTime: 97, pmCompliance: 84, woCompletion: 87, slaAdherence: 89, apdDeductionRM: 14300 },
  { id: 'kpi-2025-07', month: '2025-07', css: 79, customerRating: 81, responseTime: 98, pmCompliance: 85, woCompletion: 88, slaAdherence: 90, apdDeductionRM: 12800 },
  { id: 'kpi-2025-08', month: '2025-08', css: 80, customerRating: 82, responseTime: 99, pmCompliance: 86, woCompletion: 89, slaAdherence: 91, apdDeductionRM: 11100 },
  { id: 'kpi-2025-09', month: '2025-09', css: 81, customerRating: 82, responseTime: 98, pmCompliance: 87, woCompletion: 89, slaAdherence: 91, apdDeductionRM: 10300 },
  { id: 'kpi-2025-10', month: '2025-10', css: 80, customerRating: 80, responseTime: 97, pmCompliance: 88, woCompletion: 90, slaAdherence: 92, apdDeductionRM: 9800 },
  { id: 'kpi-2025-11', month: '2025-11', css: 82, customerRating: 81, responseTime: 99, pmCompliance: 89, woCompletion: 90, slaAdherence: 93, apdDeductionRM: 9100 },
  { id: 'kpi-2025-12', month: '2025-12', css: 83, customerRating: 82, responseTime: 99, pmCompliance: 90, woCompletion: 91, slaAdherence: 93, apdDeductionRM: 8600 },
  { id: 'kpi-2026-01', month: '2026-01', css: 82, customerRating: 83, responseTime: 100, pmCompliance: 90, woCompletion: 92, slaAdherence: 94, apdDeductionRM: 7900 },
  { id: 'kpi-2026-02', month: '2026-02', css: 83, customerRating: 84, responseTime: 100, pmCompliance: 91, woCompletion: 93, slaAdherence: 95, apdDeductionRM: 6900 },
  { id: 'kpi-2026-03', month: '2026-03', css: 84, customerRating: 84, responseTime: 100, pmCompliance: 92, woCompletion: 93, slaAdherence: 95, apdDeductionRM: 6200 },
  { id: 'kpi-2026-04', month: '2026-04', css: 85, customerRating: 85, responseTime: 100, pmCompliance: 93, woCompletion: 94, slaAdherence: 96, apdDeductionRM: 5600 },
];

export const getChecklistTemplate = (faultType: string, assetType?: AssetType): WorkOrderChecklistItem[] => {
  const template = checklistTemplatesByType[faultType] || (assetType ? checklistTemplatesByType[assetType] : undefined) || checklistTemplatesByType.Other;
  return template.map((text, index) => ({
    id: `cl-${faultType.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
    text,
    completed: false,
  }));
};

export const getDefaultWorkOrderComments = (workOrderId: string): WorkOrderComment[] => {
  return defaultCommentTemplates.map((template, index) => ({
    id: `cm-${workOrderId}-${index + 1}`,
    userId: template.userId,
    message: template.message,
    createdAt: subDays(0.9 - index * 0.15),
  }));
};

// Helper functions
export const getAssetById = (id: string) => assets.find(a => a.id === id);
export const getAssetsBySite = (siteId: string) => assets.filter(a => a.siteId === siteId);
export const getWorkOrdersByStatus = (status: WorkOrderStatus) => workOrders.filter(wo => wo.status === status);
export const getWorkOrdersBySite = (siteId: string) => workOrders.filter(wo => wo.siteId === siteId);
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getContractorById = (id: string) => contractors.find(c => c.id === id);
export const getSiteById = (id: string) => sites.find(s => s.id === id);
export const getPMSchedulesByAsset = (assetId: string) => pmSchedules.filter(pm => pm.assetId === assetId);
export const getInventoryBySite = (siteId: string) => inventoryItems.filter(i => i.siteId === siteId);
export const getLowStockItems = () => inventoryItems.filter(i => i.quantityOnHand < i.minimumStock);

export const calculateAssetHealth = (
  assetId: string,
  sourceWorkOrders: WorkOrder[] = workOrders,
  sourcePMSchedules: PMSchedule[] = pmSchedules
) => {
  const isOpenWorkOrder = (status: WorkOrderStatus) => !['resolved', 'closed'].includes(status);
  const nowDate = new Date();
  let score = 100;

  const assetOpenWOs = sourceWorkOrders.filter(
    (workOrder) => workOrder.assetId === assetId && isOpenWorkOrder(workOrder.status)
  );

  assetOpenWOs.forEach((workOrder) => {
    if (workOrder.priority === 'P1' || workOrder.priority === 'P2') {
      score -= 15;
    } else if (workOrder.priority === 'P3') {
      score -= 8;
    } else {
      score -= 3;
    }
  });

  const assetPMs = sourcePMSchedules.filter((pmSchedule) => pmSchedule.assetId === assetId);
  const overdueDays = assetPMs
    .filter((pmSchedule) => pmSchedule.status !== 'done')
    .map((pmSchedule) => Math.floor((nowDate.getTime() - new Date(pmSchedule.nextDueDate).getTime()) / (1000 * 60 * 60 * 24)))
    .filter((days) => days > 0);

  const maxOverdueDays = overdueDays.length ? Math.max(...overdueDays) : 0;
  if (maxOverdueDays > 30) {
    score -= 20;
  } else if (maxOverdueDays >= 7) {
    score -= 10;
  }

  const lastCompletedPM = assetPMs
    .filter((pmSchedule) => pmSchedule.lastDoneDate)
    .sort((a, b) => new Date(b.lastDoneDate || 0).getTime() - new Date(a.lastDoneDate || 0).getTime())[0];

  if (
    lastCompletedPM?.lastDoneDate &&
    new Date(lastCompletedPM.lastDoneDate).getTime() <= new Date(lastCompletedPM.nextDueDate).getTime()
  ) {
    score += 5;
  }

  // Factor in failure history: repeated failures = chronic reliability issue
  const asset = assets.find(a => a.id === assetId);
  const failureCount = asset?.failureHistory?.length || 0;
  if (failureCount >= 4) {
    score -= 25; // chronic failure
  } else if (failureCount >= 3) {
    score -= 15;
  } else if (failureCount >= 2) {
    score -= 8;
  } else if (failureCount >= 1) {
    score -= 3;
  }

  return Math.max(0, Math.min(100, score));
};

// Dashboard KPIs calculation
export const getDashboardKPIs = (
  siteId?: string,
  sourceWorkOrders: WorkOrder[] = workOrders,
  sourceAssets: Asset[] = assets,
  sourcePMSchedules: PMSchedule[] = pmSchedules
) => {
  const filteredWOs = siteId ? sourceWorkOrders.filter(wo => wo.siteId === siteId) : sourceWorkOrders;
  const filteredAssets = siteId ? sourceAssets.filter(a => a.siteId === siteId) : sourceAssets;
  const filteredPMs = siteId ? sourcePMSchedules.filter(pm => pm.siteId === siteId) : sourcePMSchedules;

  const openWOs = filteredWOs.filter(wo => ['open', 'assigned', 'in_progress', 'pending_parts'].includes(wo.status)).length;
  const overdueWOs = filteredWOs.filter(wo => {
    if (['resolved', 'closed'].includes(wo.status)) return false;
    return new Date(wo.slaDeadline) < new Date();
  }).length;

  const totalAssets = filteredAssets.length;
  const criticalAssets = filteredAssets.filter(a => a.healthStatus === 'critical').length;

  const completedPMs = filteredPMs.filter(pm => pm.status === 'done').length;
  const totalPMs = filteredPMs.length;
  const pmComplianceRate = totalPMs > 0 ? Math.round((completedPMs / totalPMs) * 100) : 100;

  // Calculate MTTR from resolved/closed work orders
  const resolvedWOs = filteredWOs.filter(wo => wo.resolvedAt);
  let mttr = 0;
  if (resolvedWOs.length > 0) {
    const totalRepairTime = resolvedWOs.reduce((sum, wo) => {
      const created = new Date(wo.createdAt).getTime();
      const resolved = new Date(wo.resolvedAt!).getTime();
      return sum + (resolved - created);
    }, 0);
    mttr = Math.round((totalRepairTime / resolvedWOs.length) / (1000 * 60 * 60) * 10) / 10; // hours
  }

  return {
    openWorkOrders: openWOs,
    overdueWorkOrders: overdueWOs,
    totalAssets,
    criticalAssets,
    pmComplianceRate,
    mttr,
  };
};

export const getWorkOrdersByStatusCount = (
  siteId?: string,
  sourceWorkOrders: WorkOrder[] = workOrders
) => {
  const filteredWOs = siteId ? sourceWorkOrders.filter(wo => wo.siteId === siteId) : sourceWorkOrders;
  return {
    open: filteredWOs.filter(wo => wo.status === 'open').length,
    assigned: filteredWOs.filter(wo => wo.status === 'assigned').length,
    inProgress: filteredWOs.filter(wo => wo.status === 'in_progress').length,
    pendingParts: filteredWOs.filter(wo => wo.status === 'pending_parts').length,
    resolved: filteredWOs.filter(wo => wo.status === 'resolved').length,
    closed: filteredWOs.filter(wo => wo.status === 'closed').length,
  };
};
