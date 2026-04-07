// Mock data for SpatialVerse Pulse - AWC Malaysia Properties

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type WorkOrderStatus = 'open' | 'assigned' | 'in_progress' | 'pending_parts' | 'resolved' | 'closed';
export type AssetType = 'HVAC' | 'Electrical' | 'Plumbing' | 'Fire Safety' | 'Elevator' | 'Structural' | 'IT/AV' | 'General';
export type AssetHealthStatus = 'critical' | 'warning' | 'good';
export type PMFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
export type PMStatus = 'upcoming' | 'overdue' | 'done';

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
  checklist?: WorkOrderChecklistItem[];
  timeline?: WorkOrderTimelineEntry[];
  comments?: WorkOrderComment[];
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

export interface AppNotification {
  id: string;
  type: 'work_order' | 'pm' | 'inventory' | 'contractor';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'critical' | 'warning' | 'info';
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

// Assets - 50+ across all sites
export const assets: Asset[] = [
  // Pavilion KL - HVAC
  { id: 'asset-1', name: 'AHU-PKL-01', type: 'HVAC', siteId: 'site-1', location: { lat: 3.1490, lng: 101.7133 }, floor: 'B2', zone: 'Zone A', description: 'Main Air Handling Unit - Level B2', manufacturer: 'Daikin', model: 'AHU-5000', serialNumber: 'DK2021-001', healthScore: 92, healthStatus: 'good', lastServiceDate: subDays(15), openWorkOrdersCount: 0 },
  { id: 'asset-2', name: 'AHU-PKL-02', type: 'HVAC', siteId: 'site-1', location: { lat: 3.1489, lng: 101.7135 }, floor: 'B2', zone: 'Zone B', description: 'Air Handling Unit - Zone B', manufacturer: 'Daikin', model: 'AHU-3000', serialNumber: 'DK2021-002', healthScore: 45, healthStatus: 'critical', lastServiceDate: subDays(60), openWorkOrdersCount: 2 },
  { id: 'asset-3', name: 'Chiller-PKL-01', type: 'HVAC', siteId: 'site-1', location: { lat: 3.1487, lng: 101.7130 }, floor: 'B3', zone: 'Plant Room', description: 'Primary Chiller Unit', manufacturer: 'Carrier', model: 'CH-2000', serialNumber: 'CR2020-001', healthScore: 78, healthStatus: 'warning', lastServiceDate: subDays(30), openWorkOrdersCount: 1 },
  { id: 'asset-4', name: 'FCU-PKL-L1-01', type: 'HVAC', siteId: 'site-1', location: { lat: 3.1491, lng: 101.7132 }, floor: 'L1', zone: 'Main Atrium', description: 'Fan Coil Unit - Main Atrium', manufacturer: 'Trane', model: 'FCU-500', serialNumber: 'TR2022-001', healthScore: 95, healthStatus: 'good', lastServiceDate: subDays(7), openWorkOrdersCount: 0 },

  // Pavilion KL - Electrical
  { id: 'asset-5', name: 'MDB-PKL-01', type: 'Electrical', siteId: 'site-1', location: { lat: 3.1486, lng: 101.7129 }, floor: 'B3', zone: 'Electrical Room', description: 'Main Distribution Board', manufacturer: 'Schneider', model: 'Prisma P', serialNumber: 'SE2019-001', healthScore: 88, healthStatus: 'good', lastServiceDate: subDays(45), openWorkOrdersCount: 0 },
  { id: 'asset-6', name: 'Generator-PKL-01', type: 'Electrical', siteId: 'site-1', location: { lat: 3.1485, lng: 101.7128 }, floor: 'B3', zone: 'Generator Room', description: 'Emergency Backup Generator', manufacturer: 'Caterpillar', model: 'CAT 3512', serialNumber: 'CAT2018-001', healthScore: 82, healthStatus: 'good', lastServiceDate: subDays(20), openWorkOrdersCount: 0 },
  { id: 'asset-7', name: 'UPS-PKL-01', type: 'Electrical', siteId: 'site-1', location: { lat: 3.1486, lng: 101.7127 }, floor: 'B3', zone: 'Server Room', description: 'Uninterruptible Power Supply - Server Room', manufacturer: 'APC', model: 'Symmetra PX', serialNumber: 'APC2021-001', healthScore: 35, healthStatus: 'critical', lastServiceDate: subDays(90), openWorkOrdersCount: 1 },

  // Pavilion KL - Elevator
  { id: 'asset-8', name: 'Lift-PKL-01', type: 'Elevator', siteId: 'site-1', location: { lat: 3.1492, lng: 101.7134 }, floor: 'All', zone: 'Main Lobby', description: 'Passenger Elevator #1', manufacturer: 'KONE', model: 'MonoSpace 700', serialNumber: 'KN2019-001', healthScore: 90, healthStatus: 'good', lastServiceDate: subDays(5), openWorkOrdersCount: 0 },
  { id: 'asset-9', name: 'Lift-PKL-02', type: 'Elevator', siteId: 'site-1', location: { lat: 3.1493, lng: 101.7134 }, floor: 'All', zone: 'Main Lobby', description: 'Passenger Elevator #2', manufacturer: 'KONE', model: 'MonoSpace 700', serialNumber: 'KN2019-002', healthScore: 55, healthStatus: 'warning', lastServiceDate: subDays(25), openWorkOrdersCount: 1 },
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
  { id: 'asset-21', name: 'MDB-SP-01', type: 'Electrical', siteId: 'site-2', location: { lat: 3.0730, lng: 101.6075 }, floor: 'B3', zone: 'Electrical Room', description: 'Main Distribution Board', manufacturer: 'ABB', model: 'MNS 3.0', serialNumber: 'ABB2018-011', healthScore: 90, healthStatus: 'good', lastServiceDate: subDays(22), openWorkOrdersCount: 0 },
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
  { id: 'asset-37', name: 'MDB-MV-02', type: 'Electrical', siteId: 'site-3', location: { lat: 3.1173, lng: 101.6771 }, floor: 'B3', zone: 'Electrical Room', description: 'Main Distribution Board - South', manufacturer: 'Siemens', model: 'SIVACON S8', serialNumber: 'SI2017-022', healthScore: 30, healthStatus: 'critical', lastServiceDate: subDays(95), openWorkOrdersCount: 2 },
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
  { id: 'asset-51', name: 'CRAC-SP-Server', type: 'HVAC', siteId: 'site-2', location: { lat: 3.0739, lng: 101.6084 }, floor: 'B1', zone: 'Server Room', description: 'Computer Room Air Conditioner', manufacturer: 'Liebert', model: 'DS', serialNumber: 'LB2021-011', healthScore: 83, healthStatus: 'good', lastServiceDate: subDays(11), openWorkOrdersCount: 0 },
  { id: 'asset-52', name: 'VRV-PKL-Office', type: 'HVAC', siteId: 'site-1', location: { lat: 3.1494, lng: 101.7136 }, floor: 'L5', zone: 'Management Office', description: 'VRV System - Management Office', manufacturer: 'Daikin', model: 'VRV IV', serialNumber: 'DK2022-003', healthScore: 96, healthStatus: 'good', lastServiceDate: subDays(4), openWorkOrdersCount: 0 },
  { id: 'asset-53', name: 'EV-Charger-MV-01', type: 'Electrical', siteId: 'site-3', location: { lat: 3.1167, lng: 101.6764 }, floor: 'B2', zone: 'Car Park A', description: 'EV Charging Station #1', manufacturer: 'Tesla', model: 'Wall Connector', serialNumber: 'TS2023-021', healthScore: 100, healthStatus: 'good', lastServiceDate: subDays(1), openWorkOrdersCount: 0 },
  { id: 'asset-54', name: 'Travellator-SP-01', type: 'Elevator', siteId: 'site-2', location: { lat: 3.0741, lng: 101.6086 }, floor: 'L1-L2', zone: 'East Wing', description: 'Moving Walkway', manufacturer: 'KONE', model: 'TravelMaster 115', serialNumber: 'KN2020-011', healthScore: 79, healthStatus: 'warning', lastServiceDate: subDays(22), openWorkOrdersCount: 1 },
  { id: 'asset-55', name: 'Smoke-Exhaust-PKL', type: 'Fire Safety', siteId: 'site-1', location: { lat: 3.1489, lng: 101.7128 }, floor: 'All', zone: 'Central Shaft', description: 'Smoke Extraction System', manufacturer: 'Systemair', model: 'AXC', serialNumber: 'SY2019-001', healthScore: 91, healthStatus: 'good', lastServiceDate: subDays(8), openWorkOrdersCount: 0 },
];

// Work Orders
const seededWorkOrders: Array<
  Omit<WorkOrder, 'slaBreached' | 'escalationLog'> &
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
    id: 'wo-13', number: 'WO-2024-00013', siteId: 'site-1', assetId: 'asset-4', title: 'FCU Thermostat Calibration', description: 'Thermostat reading 2 degrees off. Recalibrated successfully.', faultType: 'Calibration', priority: 'P4', status: 'resolved', assignedToId: 'user-8', slaDeadline: addDays(1), createdAt: subDays(3), updatedAt: subDays(1), resolvedAt: subDays(1),
    timeline: [
      { id: 'tl-25', type: 'created', description: 'Work order created', userId: 'user-2', createdAt: subDays(3) },
      { id: 'tl-26', type: 'assigned', description: 'Assigned to Zain Hassan', userId: 'user-2', createdAt: subDays(2.5) },
      { id: 'tl-27', type: 'status_change', description: 'Calibration completed', userId: 'user-8', createdAt: subDays(1) }
    ]
  },
  {
    id: 'wo-14', number: 'WO-2024-00014', siteId: 'site-2', assetId: 'asset-24', title: 'Elevator Door Sensor Replacement', description: 'Door sensor replaced and tested.', faultType: 'Sensor Failure', priority: 'P2', status: 'resolved', assignedToId: 'user-5', contractorId: 'contractor-3', slaDeadline: addHours(8), createdAt: subDays(2), updatedAt: subDays(1.5), resolvedAt: subDays(1.5),
    timeline: [
      { id: 'tl-28', type: 'created', description: 'Emergency work order created', userId: 'user-3', createdAt: subDays(2) },
      { id: 'tl-29', type: 'assigned', description: 'Otis technician dispatched', userId: 'user-3', createdAt: subDays(1.9) },
      { id: 'tl-30', type: 'status_change', description: 'Sensor replaced and tested', userId: 'user-5', createdAt: subDays(1.5) }
    ]
  },
  {
    id: 'wo-15', number: 'WO-2024-00015', siteId: 'site-3', assetId: 'asset-46', title: 'Fire Panel Zone Test', description: 'Monthly zone test completed. All zones functioning.', faultType: 'Testing', priority: 'P3', status: 'resolved', assignedToId: 'user-6', slaDeadline: addDays(2), createdAt: subDays(5), updatedAt: subDays(3), resolvedAt: subDays(3),
    timeline: [
      { id: 'tl-31', type: 'created', description: 'Monthly test scheduled', userId: 'user-4', createdAt: subDays(5) },
      { id: 'tl-32', type: 'status_change', description: 'Testing completed - all zones OK', userId: 'user-6', createdAt: subDays(3) }
    ]
  },

  // Closed Work Orders
  {
    id: 'wo-16', number: 'WO-2024-00016', siteId: 'site-1', assetId: 'asset-11', title: 'Fire Pump Annual Test', description: 'Annual fire pump test completed and certified.', faultType: 'Annual Inspection', priority: 'P2', status: 'closed', assignedToId: 'user-6', contractorId: 'contractor-5', slaDeadline: addDays(1), createdAt: subDays(7), updatedAt: subDays(5), resolvedAt: subDays(5.5), closedAt: subDays(5),
  },
  {
    id: 'wo-17', number: 'WO-2024-00017', siteId: 'site-2', assetId: 'asset-21', title: 'MDB Thermal Imaging', description: 'Thermal imaging completed. Minor hotspots identified and rectified.', faultType: 'Inspection', priority: 'P3', status: 'closed', assignedToId: 'user-7', contractorId: 'contractor-2', slaDeadline: addDays(3), createdAt: subDays(10), updatedAt: subDays(8), resolvedAt: subDays(8.5), closedAt: subDays(8),
  },
  {
    id: 'wo-18', number: 'WO-2024-00018', siteId: 'site-3', assetId: 'asset-40', title: 'Glass Elevator Cleaning', description: 'Quarterly glass cleaning completed.', faultType: 'Cleaning', priority: 'P4', status: 'closed', assignedToId: 'user-7', slaDeadline: addDays(5), createdAt: subDays(12), updatedAt: subDays(10), resolvedAt: subDays(10.5), closedAt: subDays(10),
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
  { id: 'wo-25', number: 'WO-2024-00025', siteId: 'site-1', assetId: 'asset-52', title: 'VRV System Error Code', description: 'Error code E3 displayed on VRV controller.', faultType: 'Control Error', priority: 'P3', status: 'resolved', assignedToId: 'user-8', slaDeadline: addHours(24), createdAt: subDays(2), updatedAt: subDays(1), resolvedAt: subDays(1) },
  { id: 'wo-26', number: 'WO-2024-00026', siteId: 'site-2', assetId: 'asset-51', title: 'Server Room Temperature High', description: 'CRAC unit not maintaining temperature.', faultType: 'Temperature Control', priority: 'P1', status: 'closed', assignedToId: 'user-7', slaDeadline: addHours(2), createdAt: subDays(4), updatedAt: subDays(3.5), resolvedAt: subDays(3.6), closedAt: subDays(3.5) },
  { id: 'wo-27', number: 'WO-2024-00027', siteId: 'site-3', assetId: 'asset-53', title: 'EV Charger Fault', description: 'EV charger #1 showing fault code.', faultType: 'Charger Fault', priority: 'P3', status: 'closed', assignedToId: 'user-6', slaDeadline: addHours(48), createdAt: subDays(6), updatedAt: subDays(5), resolvedAt: subDays(5.2), closedAt: subDays(5) },
  { id: 'wo-28', number: 'WO-2024-00028', siteId: 'site-1', assetId: 'asset-55', title: 'Smoke Exhaust Fan Test', description: 'Quarterly smoke exhaust test due.', faultType: 'Testing', priority: 'P3', status: 'resolved', assignedToId: 'user-8', slaDeadline: addDays(5), createdAt: subDays(8), updatedAt: subDays(6), resolvedAt: subDays(6) },
  { id: 'wo-29', number: 'WO-2024-00029', siteId: 'site-2', assetId: 'asset-22', title: 'Generator Load Bank Test', description: 'Annual load bank test scheduled.', faultType: 'Testing', priority: 'P3', status: 'pending_parts', assignedToId: 'user-5', slaDeadline: addDays(7), createdAt: subDays(3), updatedAt: subDays(1) },
  { id: 'wo-30', number: 'WO-2024-00030', siteId: 'site-3', assetId: 'asset-38', title: 'Generator Fuel Filter Change', description: 'Scheduled fuel filter replacement.', faultType: 'Filter Change', priority: 'P4', status: 'closed', assignedToId: 'user-6', slaDeadline: addDays(10), createdAt: subDays(15), updatedAt: subDays(12), resolvedAt: subDays(12.5), closedAt: subDays(12) },
  { id: 'wo-31', number: 'WO-2024-00031', siteId: 'site-1', assetId: 'asset-6', title: 'Generator Monthly Run', description: 'Monthly generator run and inspection.', faultType: 'Preventive Maintenance', priority: 'P4', status: 'closed', assignedToId: 'user-8', slaDeadline: addDays(3), createdAt: subDays(20), updatedAt: subDays(18), resolvedAt: subDays(18.5), closedAt: subDays(18) },
  { id: 'wo-32', number: 'WO-2024-00032', siteId: 'site-2', assetId: 'asset-28', title: 'Sprinkler System Inspection', description: 'Annual sprinkler inspection and certification.', faultType: 'Annual Inspection', priority: 'P2', status: 'closed', assignedToId: 'user-7', contractorId: 'contractor-5', slaDeadline: addDays(5), createdAt: subDays(14), updatedAt: subDays(12), resolvedAt: subDays(12.5), closedAt: subDays(12) },
];

export const workOrders: WorkOrder[] = seededWorkOrders.map((workOrder) => ({
  ...workOrder,
  slaBreached: workOrder.slaBreached ?? false,
  escalationLog: workOrder.escalationLog ?? [],
}));

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
