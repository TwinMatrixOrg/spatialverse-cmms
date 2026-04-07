// Shared types for SpatialVerse CMMS

// ============ Enums ============

export enum Priority {
  P1 = 'P1', // Critical
  P2 = 'P2', // High
  P3 = 'P3', // Medium
  P4 = 'P4', // Low
}

export enum WorkOrderStatus {
  Open = 'open',
  Assigned = 'assigned',
  InProgress = 'in_progress',
  PendingParts = 'pending_parts',
  Resolved = 'resolved',
  Closed = 'closed',
}

export enum AssetType {
  HVAC = 'HVAC',
  Electrical = 'Electrical',
  Plumbing = 'Plumbing',
  FireSafety = 'Fire Safety',
  Elevator = 'Elevator',
  Structural = 'Structural',
  ITAV = 'IT/AV',
  General = 'General',
}

export enum AssetHealthStatus {
  Critical = 'critical',
  Warning = 'warning',
  Good = 'good',
}

export enum PMFrequency {
  Daily = 'daily',
  Weekly = 'weekly',
  BiWeekly = 'bi-weekly',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  SemiAnnual = 'semi-annual',
  Annual = 'annual',
}

export enum PMStatus {
  Upcoming = 'upcoming',
  Overdue = 'overdue',
  Done = 'done',
}

// ============ Base Types ============

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  location: GeoLocation;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'technician' | 'viewer';
  avatar?: string;
  siteIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  siteId: string;
  location: GeoLocation;
  floor?: string;
  zone?: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installDate?: Date;
  warrantyExpiry?: Date;
  healthScore: number; // 0-100
  healthStatus: AssetHealthStatus;
  lastServiceDate?: Date;
  openWorkOrdersCount: number;
  qrCode?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrder {
  id: string;
  number: string; // WO-2024-00001
  siteId: string;
  assetId: string;
  title: string;
  description: string;
  faultType: string;
  priority: Priority;
  status: WorkOrderStatus;
  assignedToId?: string;
  contractorId?: string;
  slaDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  checklist?: ChecklistItem[];
  timeline?: TimelineEntry[];
  attachments?: Attachment[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
  completedById?: string;
}

export interface TimelineEntry {
  id: string;
  type: 'created' | 'assigned' | 'status_change' | 'comment' | 'attachment' | 'checklist';
  description: string;
  userId: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedById: string;
  uploadedAt: Date;
}

export interface Contractor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  specialties: AssetType[];
  licenseNumber?: string;
  licenseExpiry?: Date;
  insuranceExpiry?: Date;
  performanceScore: number; // 0-100
  avgResponseTime: number; // hours
  completionRate: number; // percentage
  activeWorkOrdersCount: number;
  siteIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PMSchedule {
  id: string;
  name: string;
  assetId: string;
  siteId: string;
  frequency: PMFrequency;
  lastDoneDate?: Date;
  nextDueDate: Date;
  status: PMStatus;
  autoCreateWO: boolean;
  checklist: string[];
  assignedToId?: string;
  estimatedDuration: number; // minutes
  createdAt: Date;
  updatedAt: Date;
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
  supplierId?: string;
  siteId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Dashboard Types ============

export interface DashboardKPIs {
  openWorkOrders: number;
  overdueWorkOrders: number;
  totalAssets: number;
  criticalAssets: number;
  pmComplianceRate: number; // percentage
  mttr: number; // Mean Time To Repair in hours
}

export interface WorkOrdersByStatus {
  open: number;
  assigned: number;
  inProgress: number;
  pendingParts: number;
  resolved: number;
  closed: number;
}

export interface Alert {
  id: string;
  type: 'sla_breach' | 'critical_fault' | 'low_stock' | 'license_expiry' | 'pm_overdue';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  relatedEntityId?: string;
  relatedEntityType?: 'work_order' | 'asset' | 'contractor' | 'inventory' | 'pm_schedule';
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedById?: string;
}

// ============ Report Types ============

export interface ReportDateRange {
  startDate: Date;
  endDate: Date;
}

export interface WorkOrderCompletionReport {
  period: string;
  completed: number;
  total: number;
  rate: number;
}

export interface MTTRByAssetType {
  assetType: AssetType;
  mttr: number;
  workOrderCount: number;
}

export interface FaultCategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

// ============ API Response Types ============

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  skip: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
