import { useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Button, TextField,
  Grid2 as Grid, Drawer, IconButton, Divider, FormControl, InputLabel,
  Select, MenuItem, Switch, FormControlLabel, alpha, useTheme, Paper,
  Checkbox, Radio, RadioGroup, Slider, Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  SmartToy as AIIcon,
  Description as FormIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import AnimatedPage, { AnimatedPanel } from '../components/AnimatedPage';

// ── TPATA Form Types ─────────────────────────────────────────────
type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'slider' | 'date' | 'number' | 'yesno' | 'passfail';

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  value?: string | number | boolean;
  section?: string;
  notes?: string;
}

interface TPATAForm {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  fields: FormField[];
  icon: string;
}

interface CompletedForm {
  id: string;
  templateId: string;
  completedCode: string;
  site: string;
  inspector: string;
  date: string;
  status: 'completed' | 'in_progress' | 'draft';
  passCount: number;
  failCount: number;
  values: Record<string, unknown>;
}

// ── Pre-defined completed forms (demo) ──────────────────────────
const COMPLETED_FORMS: CompletedForm[] = [
  {
    id: 'cf-1',
    templateId: 'tp-01',
    completedCode: 'TPATA-F1-2026-0042',
    site: 'Pavilion KL, Block A',
    inspector: 'Raj Krishnan',
    date: '2026-04-18',
    status: 'completed',
    passCount: 14,
    failCount: 2,
    values: {
      'f1-1': 'Pavilion KL, Block A',
      'f1-2': '2026-04-18',
      'f1-3': 'Raj Krishnan',
      'f1-4': 'EL-2024-MY-88231',
      'f1-5': 'pass',
      'f1-6': 'pass',
      'f1-7': 'fail',
      'f1-8': 'pass',
      'f1-9': 'pass',
      'f1-10': '0.4',
      'f1-11': 'pass',
      'f1-12': 'pass',
      'f1-13': 'fail',
      'f1-14': '2.8',
      'f1-15': 'pass',
      'f1-16': 'pass',
      'f1-17': 'Phase imbalance on L3 (load 38A vs L1 25A). Trunking corrosion near B1 carpark — schedule replacement.',
      'f1-18': 'Raj Krishnan',
    },
  },
  {
    id: 'cf-2',
    templateId: 'tp-03',
    completedCode: 'TPATA-F3-2026-0018',
    site: 'Pavilion KL, Block A',
    inspector: 'Ahmad Faisal',
    date: '2026-04-20',
    status: 'completed',
    passCount: 11,
    failCount: 1,
    values: {
      'f3-1': 'Pavilion KL, Block A',
      'f3-2': '2026-04-20',
      'f3-3': 'Ahmad Faisal',
      'f3-4': '2026-09-15',
      'f3-5': 'pass',
      'f3-6': '12.5',
      'f3-7': 'pass',
      'f3-8': 'Normal',
      'f3-9': '25',
      'f3-10': 'pass',
      'f3-11': 'pass',
      'f3-12': 'pass',
      'f3-13': 'pass',
      'f3-14': 'fail',
      'f3-15': 'pass',
      'f3-16': 'Minor',
      'f3-17': 'Exit sign on L8 corridor not illuminated — bulb replacement needed. All other systems nominal. BOMBA certificate valid until Sep 2026.',
      'f3-18': 'Ahmad Faisal',
    },
  },
  {
    id: 'cf-3',
    templateId: 'tp-07',
    completedCode: 'TPATA-F7-2026-0055',
    site: 'KLCC East Wing',
    inspector: 'Siti Nurhaliza',
    date: '2026-04-22',
    status: 'completed',
    passCount: 8,
    failCount: 1,
    values: {
      'f7-1': 'KLCC East Wing',
      'f7-2': '2026-04-22',
      'f7-3': 'Siti Nurhaliza',
      'f7-4': 'Washrooms',
      'f7-5': '4',
      'f7-6': 'pass',
      'f7-7': '3',
      'f7-8': 'pass',
      'f7-9': 'pass',
      'f7-10': 'fail',
      'f7-11': 'no',
      'f7-12': 'pass',
      'f7-13': '7',
      'f7-14': 'Recycling bins missing near east pantry. Floor 12 washroom soap dispenser empty — restock required.',
      'f7-15': 'Siti Nurhaliza',
    },
  },
];

// ── Pre-defined TPATA Form Templates ─────────────────────────────
const TPATA_TEMPLATES: TPATAForm[] = [
  {
    id: 'tp-01',
    code: 'TPATA-F1',
    name: 'Electrical Installation Inspection',
    category: 'Electrical',
    description: 'TPATA Form 1 — Inspection of electrical installation, switchboards, earthing, and protection systems per JKR requirements.',
    icon: '⚡',
    fields: [
      { id: 'f1-1', label: 'Site Name', type: 'text', required: true },
      { id: 'f1-2', label: 'Inspection Date', type: 'date', required: true },
      { id: 'f1-3', label: 'Inspector Name', type: 'text', required: true },
      { id: 'f1-4', label: 'Electrician License No.', type: 'text', required: true },
      { id: 'f1-5', label: 'Switchboard Condition', type: 'passfail', section: 'Switchboard & Distribution', required: true },
      { id: 'f1-6', label: 'MCB/RCD functional test', type: 'passfail', section: 'Switchboard & Distribution', required: true },
      { id: 'f1-7', label: 'Phase balance check', type: 'passfail', section: 'Switchboard & Distribution' },
      { id: 'f1-8', label: 'Labeling of circuits', type: 'passfail', section: 'Switchboard & Distribution' },
      { id: 'f1-9', label: 'Earthing continuity', type: 'passfail', section: 'Earthing & Bonding', required: true },
      { id: 'f1-10', label: 'Earth electrode resistance (Ω)', type: 'number', section: 'Earthing & Bonding', notes: 'Must be < 1Ω' },
      { id: 'f1-11', label: 'Bonding of metallic parts', type: 'passfail', section: 'Earthing & Bonding' },
      { id: 'f1-12', label: 'Cable routing and containment', type: 'passfail', section: 'Wiring' },
      { id: 'f1-13', label: 'Conduit / trunking integrity', type: 'passfail', section: 'Wiring' },
      { id: 'f1-14', label: 'Insulation resistance (MΩ)', type: 'number', section: 'Wiring', notes: 'Test at 500V DC. Must be > 1MΩ.' },
      { id: 'f1-15', label: 'Emergency lighting tested', type: 'passfail', section: 'Emergency Systems' },
      { id: 'f1-16', label: 'ELV / UPS operational', type: 'passfail', section: 'Emergency Systems' },
      { id: 'f1-17', label: 'Remarks / Defects Noted', type: 'textarea' },
      { id: 'f1-18', label: 'Inspector Signature', type: 'text', required: true },
    ],
  },
  {
    id: 'tp-02',
    code: 'TPATA-F2',
    name: 'Air Conditioning & Mechanical Ventilation',
    category: 'HVAC',
    description: 'TPATA Form 2 — ACMV system inspection covering chillers, AHUs, FCUs, ductwork, controls, and refrigerant management.',
    icon: '❄️',
    fields: [
      { id: 'f2-1', label: 'Site Name', type: 'text', required: true },
      { id: 'f2-2', label: 'Inspection Date', type: 'date', required: true },
      { id: 'f2-3', label: 'Inspector Name', type: 'text', required: true },
      { id: 'f2-4', label: 'System / Zone', type: 'select', options: ['Chiller Plant', 'AHU Zone', 'FCU Zone', 'Ventilation', 'Kitchen Exhaust', 'Server Room'], required: true },
      { id: 'f2-5', label: 'Chiller COP (kW/ton)', type: 'number', section: 'Chiller Plant', notes: 'Target: < 0.6 kW/ton' },
      { id: 'f2-6', label: 'Condenser approach temp (°C)', type: 'number', section: 'Chiller Plant' },
      { id: 'f2-7', label: 'Refrigerant leak detected', type: 'yesno', section: 'Chiller Plant', required: true },
      { id: 'f2-8', label: 'AHU filter condition', type: 'select', options: ['Clean', 'Needs cleaning', 'Replace'], section: 'Air Handling' },
      { id: 'f2-9', label: 'Coil condition', type: 'passfail', section: 'Air Handling' },
      { id: 'f2-10', label: 'Belt / bearing condition', type: 'passfail', section: 'Air Handling' },
      { id: 'f2-11', label: 'Ductwork integrity', type: 'passfail', section: 'Ductwork' },
      { id: 'f2-12', label: 'Damper operation', type: 'passfail', section: 'Ductwork' },
      { id: 'f2-13', label: 'Supply air temp (°C)', type: 'number', section: 'Performance', notes: 'Typical: 12-16°C' },
      { id: 'f2-14', label: 'Return air temp (°C)', type: 'number', section: 'Performance' },
      { id: 'f2-15', label: 'Relative humidity (%)', type: 'number', section: 'Performance' },
      { id: 'f2-16', label: 'BMS control points functional', type: 'passfail', section: 'Controls' },
      { id: 'f2-17', label: 'Remarks / Defects Noted', type: 'textarea' },
      { id: 'f2-18', label: 'Inspector Signature', type: 'text', required: true },
    ],
  },
  {
    id: 'tp-03',
    code: 'TPATA-F3',
    name: 'Fire Protection System Inspection',
    category: 'Fire Safety',
    description: 'TPATA Form 3 — Fire protection systems: sprinklers, alarm, extinguishers, suppression, evacuation routes per BOMBA requirements.',
    icon: '🔥',
    fields: [
      { id: 'f3-1', label: 'Site Name', type: 'text', required: true },
      { id: 'f3-2', label: 'Inspection Date', type: 'date', required: true },
      { id: 'f3-3', label: 'Inspector Name', type: 'text', required: true },
      { id: 'f3-4', label: 'Fire Certificate Expiry', type: 'date', required: true },
      { id: 'f3-5', label: 'Sprinkler heads intact', type: 'passfail', section: 'Sprinkler System' },
      { id: 'f3-6', label: 'Pipe pressure (bar)', type: 'number', section: 'Sprinkler System' },
      { id: 'f3-7', label: 'Wet / dry riser tested', type: 'passfail', section: 'Sprinkler System' },
      { id: 'f3-8', label: 'Fire alarm panel status', type: 'select', options: ['Normal', 'Fault', 'Disabled'], section: 'Fire Alarm', required: true },
      { id: 'f3-9', label: 'Smoke detectors tested (sample %)', type: 'number', section: 'Fire Alarm', notes: 'Min 20% per quarter' },
      { id: 'f3-10', label: 'Manual call points tested', type: 'passfail', section: 'Fire Alarm' },
      { id: 'f3-11', label: 'Extinguishers — type & qty checked', type: 'passfail', section: 'Portable Equipment' },
      { id: 'f3-12', label: 'Hose reel pressure tested', type: 'passfail', section: 'Portable Equipment' },
      { id: 'f3-13', label: 'Emergency exits unobstructed', type: 'passfail', section: 'Evacuation', required: true },
      { id: 'f3-14', label: 'Exit signage illuminated', type: 'passfail', section: 'Evacuation' },
      { id: 'f3-15', label: 'Evacuation plan displayed', type: 'passfail', section: 'Evacuation' },
      { id: 'f3-16', label: 'Deficiency severity', type: 'select', options: ['None', 'Minor', 'Major', 'Critical'], section: 'Overall Assessment' },
      { id: 'f3-17', label: 'Remarks / Defects Noted', type: 'textarea' },
      { id: 'f3-18', label: 'Inspector Signature', type: 'text', required: true },
    ],
  },
  {
    id: 'tp-04',
    code: 'TPATA-F4',
    name: 'Plumbing & Sanitary Inspection',
    category: 'Plumbing',
    description: 'TPATA Form 4 — Plumbing systems: water supply, drainage, pumps, backflow prevention, and sanitary fixtures.',
    icon: '🔧',
    fields: [
      { id: 'f4-1', label: 'Site Name', type: 'text', required: true },
      { id: 'f4-2', label: 'Inspection Date', type: 'date', required: true },
      { id: 'f4-3', label: 'Inspector Name', type: 'text', required: true },
      { id: 'f4-4', label: 'Water pressure (bar)', type: 'number', section: 'Water Supply', notes: 'Min 2.0 bar for upper floors' },
      { id: 'f4-5', label: 'Backflow preventer tested', type: 'passfail', section: 'Water Supply', required: true },
      { id: 'f4-6', label: 'Hot water system operational', type: 'passfail', section: 'Water Supply' },
      { id: 'f4-7', label: 'Booster pump operational', type: 'passfail', section: 'Pumps & Tanks' },
      { id: 'f4-8', label: 'Water tank cleaning done', type: 'yesno', section: 'Pumps & Tanks', notes: 'Required every 6 months' },
      { id: 'f4-9', label: 'Pump pressure set correctly', type: 'passfail', section: 'Pumps & Tanks' },
      { id: 'f4-10', label: 'Floor traps clear', type: 'passfail', section: 'Drainage' },
      { id: 'f4-11', label: 'Sewer line flow test', type: 'passfail', section: 'Drainage' },
      { id: 'f4-12', label: 'Rainwater downpipe condition', type: 'passfail', section: 'Drainage' },
      { id: 'f4-13', label: 'Toilet fixtures condition', type: 'passfail', section: 'Sanitary' },
      { id: 'f4-14', label: 'Sensor taps functional', type: 'passfail', section: 'Sanitary' },
      { id: 'f4-15', label: 'Remarks / Defects Noted', type: 'textarea' },
      { id: 'f4-16', label: 'Inspector Signature', type: 'text', required: true },
    ],
  },
  {
    id: 'tp-05',
    code: 'TPATA-F5',
    name: 'Elevator & Lift Inspection',
    category: 'Elevator',
    description: 'TPATA Form 5 — Elevator maintenance inspection: mechanical, electrical, safety devices, JKR/DOSH compliance.',
    icon: '🛗',
    fields: [
      { id: 'f5-1', label: 'Site Name', type: 'text', required: true },
      { id: 'f5-2', label: 'Inspection Date', type: 'date', required: true },
      { id: 'f5-3', label: 'Inspector Name', type: 'text', required: true },
      { id: 'f5-4', label: 'Elevator ID / Location', type: 'text', required: true },
      { id: 'f5-5', label: 'DOSH Certificate Valid Until', type: 'date', required: true },
      { id: 'f5-6', label: 'Door interlock test', type: 'passfail', section: 'Safety Devices', required: true },
      { id: 'f5-7', label: 'Emergency stop functional', type: 'passfail', section: 'Safety Devices', required: true },
      { id: 'f5-8', label: 'Overload sensor calibrated', type: 'passfail', section: 'Safety Devices' },
      { id: 'f5-9', label: 'Rescue phone / intercom', type: 'passfail', section: 'Safety Devices' },
      { id: 'f5-10', label: 'Ride comfort (vibration)', type: 'select', options: ['Smooth', 'Minor vibration', 'Rough', 'Unsafe'], section: 'Performance' },
      { id: 'f5-11', label: 'Floor levelling accuracy (mm)', type: 'number', section: 'Performance', notes: 'Must be ≤ ±5mm' },
      { id: 'f5-12', label: 'Door open/close speed', type: 'passfail', section: 'Performance' },
      { id: 'f5-13', label: 'COP / LOP buttons functional', type: 'passfail', section: 'Electrical' },
      { id: 'f5-14', label: 'Car lighting adequate', type: 'passfail', section: 'Electrical' },
      { id: 'f5-15', label: 'Machine room condition', type: 'passfail', section: 'Machine Room' },
      { id: 'f5-16', label: 'Oil level / lubrication', type: 'passfail', section: 'Machine Room' },
      { id: 'f5-17', label: 'Remarks / Defects Noted', type: 'textarea' },
      { id: 'f5-18', label: 'Inspector Signature', type: 'text', required: true },
    ],
  },
  {
    id: 'tp-06',
    code: 'TPATA-F6',
    name: 'Building Structural Inspection',
    category: 'Structural',
    description: 'TPATA Form 6 — Structural integrity: concrete, steel, waterproofing, expansion joints, façade condition.',
    icon: '🏗️',
    fields: [
      { id: 'f6-1', label: 'Site Name', type: 'text', required: true },
      { id: 'f6-2', label: 'Inspection Date', type: 'date', required: true },
      { id: 'f6-3', label: 'Inspector Name', type: 'text', required: true },
      { id: 'f6-4', label: 'Concrete spalling / cracking', type: 'select', options: ['None', 'Minor hairline', 'Moderate', 'Severe'], section: 'Concrete & Masonry', required: true },
      { id: 'f6-5', label: 'Rebar exposure visible', type: 'yesno', section: 'Concrete & Masonry' },
      { id: 'f6-6', label: 'Masonry wall condition', type: 'passfail', section: 'Concrete & Masonry' },
      { id: 'f6-7', label: 'Steel corrosion', type: 'select', options: ['None', 'Surface rust', 'Moderate', 'Severe'], section: 'Steel Structure' },
      { id: 'f6-8', label: 'Bolted connections tight', type: 'passfail', section: 'Steel Structure' },
      { id: 'f6-9', label: 'Waterproofing membrane intact', type: 'passfail', section: 'Waterproofing', required: true },
      { id: 'f6-10', label: 'Leak signs (ceilings / walls)', type: 'yesno', section: 'Waterproofing' },
      { id: 'f6-11', label: 'Expansion joint condition', type: 'passfail', section: 'Joints & Movement' },
      { id: 'f6-12', label: 'Façade cladding secure', type: 'passfail', section: 'Facade' },
      { id: 'f6-13', label: 'Sealant / grout condition', type: 'passfail', section: 'Facade' },
      { id: 'f6-14', label: 'Remarks / Defects Noted', type: 'textarea' },
      { id: 'f6-15', label: 'Inspector Signature', type: 'text', required: true },
    ],
  },
  {
    id: 'tp-07',
    code: 'TPATA-F7',
    name: 'Cleaning & Housekeeping Audit',
    category: 'Cleaning',
    description: 'TPATA Form 7 — Cleaning standards audit: common areas, washrooms, exterior, waste management, hygiene compliance.',
    icon: '🧹',
    fields: [
      { id: 'f7-1', label: 'Site Name', type: 'text', required: true },
      { id: 'f7-2', label: 'Audit Date', type: 'date', required: true },
      { id: 'f7-3', label: 'Auditor Name', type: 'text', required: true },
      { id: 'f7-4', label: 'Area / Zone', type: 'select', options: ['Lobby', 'Corridors', 'Washrooms', 'Pantry', 'Staircase', 'Carpark', 'Exterior'], required: true },
      { id: 'f7-5', label: 'Floor cleanliness score (1-5)', type: 'slider', min: 1, max: 5, section: 'Cleanliness' },
      { id: 'f7-6', label: 'Glass / mirror condition', type: 'passfail', section: 'Cleanliness' },
      { id: 'f7-7', label: 'Washroom hygiene score (1-5)', type: 'slider', min: 1, max: 5, section: 'Washrooms' },
      { id: 'f7-8', label: 'Soap / sanitizer stocked', type: 'passfail', section: 'Washrooms' },
      { id: 'f7-9', label: 'Waste bins emptied', type: 'passfail', section: 'Waste Management' },
      { id: 'f7-10', label: 'Recycling segregation', type: 'passfail', section: 'Waste Management' },
      { id: 'f7-11', label: 'Pest activity observed', type: 'yesno', section: 'Pest Control' },
      { id: 'f7-12', label: 'Air freshener in place', type: 'passfail', section: 'Washrooms' },
      { id: 'f7-13', label: 'Overall score (1-10)', type: 'slider', min: 1, max: 10, section: 'Overall' },
      { id: 'f7-14', label: 'Remarks / Defects Noted', type: 'textarea' },
      { id: 'f7-15', label: 'Auditor Signature', type: 'text', required: true },
    ],
  },
  {
    id: 'tp-08',
    code: 'TPATA-F8',
    name: 'Waste Management Inspection',
    category: 'Waste',
    description: 'TPATA Form 8 — Waste management compliance: segregation, collection schedule, hazardous waste, DOE compliance.',
    icon: '♻️',
    fields: [
      { id: 'f8-1', label: 'Site Name', type: 'text', required: true },
      { id: 'f8-2', label: 'Inspection Date', type: 'date', required: true },
      { id: 'f8-3', label: 'Inspector Name', type: 'text', required: true },
      { id: 'f8-4', label: 'Waste segregation bins in place', type: 'passfail', section: 'Segregation', required: true },
      { id: 'f8-5', label: 'Correct labels on bins', type: 'passfail', section: 'Segregation' },
      { id: 'f8-6', label: 'Collection frequency adequate', type: 'yesno', section: 'Collection' },
      { id: 'f8-7', label: 'Collection schedule followed', type: 'passfail', section: 'Collection' },
      { id: 'f8-8', label: 'Compactor room clean', type: 'passfail', section: 'Storage' },
      { id: 'f8-9', label: 'Hazardous waste stored separately', type: 'passfail', section: 'Hazardous Waste', required: true },
      { id: 'f8-10', label: 'MSDS sheets available', type: 'passfail', section: 'Hazardous Waste' },
      { id: 'f8-11', label: 'Licensed waste contractor used', type: 'yesno', section: 'Compliance', required: true },
      { id: 'f8-12', label: 'DOE submission up to date', type: 'passfail', section: 'Compliance' },
      { id: 'f8-13', label: 'Remarks / Defects Noted', type: 'textarea' },
      { id: 'f8-14', label: 'Inspector Signature', type: 'text', required: true },
    ],
  },
  {
    id: 'tp-09',
    code: 'TPATA-F9',
    name: 'Utility & Energy Audit',
    category: 'Utilities',
    description: 'TPATA Form 9 — Utility consumption audit: electricity, water, gas readings, sub-metering, energy efficiency measures.',
    icon: '⚡',
    fields: [
      { id: 'f9-1', label: 'Site Name', type: 'text', required: true },
      { id: 'f9-2', label: 'Audit Date', type: 'date', required: true },
      { id: 'f9-3', label: 'Auditor Name', type: 'text', required: true },
      { id: 'f9-4', label: 'TNB account number', type: 'text', section: 'Electricity' },
      { id: 'f9-5', label: 'Main meter reading (kWh)', type: 'number', section: 'Electricity', required: true },
      { id: 'f9-6', label: 'kWh per sqft (benchmark)', type: 'number', section: 'Electricity', notes: 'Target: < 25 kWh/sqft/year' },
      { id: 'f9-7', label: 'Sub-meters functional', type: 'passfail', section: 'Electricity' },
      { id: 'f9-8', label: 'Power factor (> 0.85)', type: 'number', section: 'Electricity' },
      { id: 'f9-9', label: 'SYABAS meter reading (m³)', type: 'number', section: 'Water' },
      { id: 'f9-10', label: 'Visible leaks detected', type: 'yesno', section: 'Water' },
      { id: 'f9-11', label: 'Rainwater harvesting active', type: 'yesno', section: 'Water' },
      { id: 'f9-12', label: 'Solar PV generation (kWh/day)', type: 'number', section: 'Renewable' },
      { id: 'f9-13', label: 'Remarks / Defects Noted', type: 'textarea' },
      { id: 'f9-14', label: 'Auditor Signature', type: 'text', required: true },
    ],
  },
  {
    id: 'tp-10',
    code: 'TPATA-F10',
    name: 'General Workplace Inspection',
    category: 'General',
    description: 'TPATA Form 10 — General workplace safety and condition: lighting, ventilation, housekeeping, signage, PPE, general hazards.',
    icon: '📋',
    fields: [
      { id: 'f10-1', label: 'Site Name', type: 'text', required: true },
      { id: 'f10-2', label: 'Inspection Date', type: 'date', required: true },
      { id: 'f10-3', label: 'Inspector Name', type: 'text', required: true },
      { id: 'f10-4', label: 'Area Inspected', type: 'text', required: true },
      { id: 'f10-5', label: 'Illumination adequate', type: 'passfail', section: 'Environment' },
      { id: 'f10-6', label: 'Ventilation adequate', type: 'passfail', section: 'Environment' },
      { id: 'f10-7', label: 'Temperature comfortable', type: 'yesno', section: 'Environment' },
      { id: 'f10-8', label: 'Floors clean and dry', type: 'passfail', section: 'Housekeeping' },
      { id: 'f10-9', label: 'Walkways unobstructed', type: 'passfail', section: 'Housekeeping' },
      { id: 'f10-10', label: 'Warning signs posted', type: 'passfail', section: 'Signage' },
      { id: 'f10-11', label: 'Safety signage legible', type: 'passfail', section: 'Signage' },
      { id: 'f10-12', label: 'First aid kit stocked', type: 'passfail', section: 'Emergency' },
      { id: 'f10-13', label: 'AED accessible', type: 'passfail', section: 'Emergency' },
      { id: 'f10-14', label: 'Trip / fall hazards', type: 'yesno', section: 'Hazards' },
      { id: 'f10-15', label: 'Overhead falling objects risk', type: 'yesno', section: 'Hazards' },
      { id: 'f10-16', label: 'Remarks / Defects Noted', type: 'textarea' },
      { id: 'f10-17', label: 'Inspector Signature', type: 'text', required: true },
    ],
  },
];

// ── Field Renderer ───────────────────────────────────────────────
function FieldRenderer({ field, value, onChange }: { field: FormField; value: unknown; onChange: (v: unknown) => void }) {
  const theme = useTheme();

  switch (field.type) {
    case 'text':
      return <TextField size="small" fullWidth label={field.label} value={value ?? ''} onChange={e => onChange(e.target.value)} required={field.required} helperText={field.notes} />;
    case 'number':
      return <TextField size="small" type="number" fullWidth label={field.label} value={value ?? ''} onChange={e => onChange(Number(e.target.value))} required={field.required} helperText={field.notes} />;
    case 'date':
      return <TextField size="small" type="date" fullWidth label={field.label} value={value ?? ''} onChange={e => onChange(e.target.value)} required={field.required} InputLabelProps={{ shrink: true }} />;
    case 'textarea':
      return <TextField size="small" fullWidth multiline rows={3} label={field.label} value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    case 'select':
      return (
        <FormControl size="small" fullWidth>
          <InputLabel>{field.label}</InputLabel>
          <Select value={value ?? ''} onChange={e => onChange(e.target.value)} label={field.label}>
            {field.options?.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>
      );
    case 'passfail':
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}</Typography>
          <RadioGroup row value={value ?? ''} onChange={e => onChange(e.target.value)}>
            <FormControlLabel value="pass" control={<Radio size="small" />} label={<Chip size="small" label="Pass" color="success" variant={value === 'pass' ? 'filled' : 'outlined'} />} />
            <FormControlLabel value="fail" control={<Radio size="small" />} label={<Chip size="small" label="Fail" color="error" variant={value === 'fail' ? 'filled' : 'outlined'} />} />
            <FormControlLabel value="na" control={<Radio size="small" />} label={<Chip size="small" label="N/A" variant={value === 'na' ? 'filled' : 'outlined'} />} />
          </RadioGroup>
        </Box>
      );
    case 'yesno':
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}</Typography>
          <RadioGroup row value={value ?? ''} onChange={e => onChange(e.target.value)}>
            <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
            <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            <FormControlLabel value="na" control={<Radio size="small" />} label="N/A" />
          </RadioGroup>
        </Box>
      );
    case 'checkbox':
      return <FormControlLabel control={<Checkbox checked={Boolean(value)} onChange={e => onChange(e.target.checked)} />} label={field.label} />;
    case 'slider':
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5 }}>{field.label}: <strong>{(value as number) ?? field.min}</strong></Typography>
          <Slider size="small" value={(value as number) ?? field.min ?? 0} onChange={(_, v) => onChange(v)} min={field.min} max={field.max} marks step={1} />
        </Box>
      );
    default:
      return null;
  }
}

// ── Main Page ────────────────────────────────────────────────────
export default function TPATAForms() {
  const theme = useTheme();
  const [selectedForm, setSelectedForm] = useState<TPATAForm | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfHtml, setPdfHtml] = useState('');

  const openForm = (form: TPATAForm) => {
    setSelectedForm(form);
    setFormValues({});
    setDrawerOpen(true);
  };

  const updateField = useCallback((fieldId: string, value: unknown) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  // Generate professional PDF-style HTML report
  const generatePdfHtml = useCallback((form: TPATAForm, values: Record<string, unknown>): string => {
    const grouped: Record<string, FormField[]> = {};
    form.fields.forEach(f => {
      const section = f.section || 'General Information';
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(f);
    });

    const passCount = form.fields.filter(f => values[f.id] === 'pass').length;
    const failCount = form.fields.filter(f => values[f.id] === 'fail').length;
    const totalAnswered = form.fields.filter(f => values[f.id] !== undefined && values[f.id] !== '').length;
    const complianceRate = totalAnswered > 0 ? Math.round((passCount / (passCount + failCount || 1)) * 100) : 0;

    const sectionHtml = Object.entries(grouped).map(([section, fields]) => `
      <div class="section">
        <div class="section-header">${section}</div>
        <table class="field-table">
          ${fields.map(f => {
            let displayValue = '';
            const val = values[f.id];
            if (f.type === 'passfail') {
              displayValue = val === 'pass' ? '<span class="badge pass">✓ PASS</span>' : val === 'fail' ? '<span class="badge fail">✗ FAIL</span>' : val === 'na' ? '<span class="badge na">N/A</span>' : '—';
            } else if (f.type === 'yesno') {
              displayValue = val === 'yes' ? 'Yes' : val === 'no' ? 'No' : val === 'na' ? 'N/A' : '—';
            } else if (f.type === 'select') {
              displayValue = String(val || '—');
            } else if (f.type === 'slider') {
              displayValue = val !== undefined ? `${val} / ${f.max}` : '—';
            } else {
              displayValue = val !== undefined ? String(val) : '—';
            }
            return `<tr><td class="field-label">${f.label}${f.required ? ' <span class="req">*</span>' : ''}</td><td class="field-value">${displayValue}</td></tr>`;
          }).join('')}
        </table>
      </div>
    `).join('');

    const remarks = (values[form.fields.find(f => f.type === 'textarea')?.id || ''] as string) || '';
    const inspector = (values[form.fields.find(f => f.label.toLowerCase().includes('signature') || f.label.toLowerCase().includes('auditor'))?.id || ''] as string) || '';

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${form.code} — ${form.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', -apple-system, sans-serif; color: #1a1a2e; background: #f0f2f5; padding: 40px; }
  .report { max-width: 800px; margin: 0 auto; background: #fff; box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #0A4D8C 0%, #00A3A1 100%); color: #fff; padding: 32px 40px; }
  .header-row { display: flex; justify-content: space-between; align-items: flex-start; }
  .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .header .subtitle { font-size: 13px; opacity: 0.85; }
  .header .code { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600; }
  .meta-bar { display: flex; gap: 24px; padding: 16px 40px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
  .meta-item { }
  .meta-label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .meta-value { font-weight: 600; color: #1e293b; }
  .summary-bar { display: flex; gap: 16px; padding: 20px 40px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
  .summary-card { flex: 1; text-align: center; padding: 12px; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; }
  .summary-number { font-size: 28px; font-weight: 700; }
  .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
  .summary-number.green { color: #16a34a; }
  .summary-number.red { color: #dc2626; }
  .summary-number.blue { color: #2563eb; }
  .content { padding: 24px 40px; }
  .section { margin-bottom: 24px; }
  .section-header { font-size: 14px; font-weight: 700; color: #0A4D8C; padding: 8px 12px; background: #f0f7ff; border-left: 3px solid #0A4D8C; margin-bottom: 12px; }
  .field-table { width: 100%; border-collapse: collapse; }
  .field-table tr { border-bottom: 1px solid #f1f5f9; }
  .field-table td { padding: 8px 12px; font-size: 13px; vertical-align: middle; }
  .field-label { width: 55%; color: #475569; }
  .field-value { width: 45%; font-weight: 500; }
  .req { color: #dc2626; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
  .badge.pass { background: #dcfce7; color: #16a34a; }
  .badge.fail { background: #fee2e2; color: #dc2626; }
  .badge.na { background: #f1f5f9; color: #64748b; }
  .remarks-box { background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .remarks-title { font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 6px; }
  .remarks-text { font-size: 13px; color: #78350f; line-height: 1.5; }
  .signature-section { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 24px; border-top: 2px solid #e2e8f0; }
  .sig-block { width: 45%; }
  .sig-line { border-bottom: 1px solid #94a3b8; height: 40px; margin-bottom: 4px; }
  .sig-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
  .sig-name { font-size: 13px; font-weight: 600; }
  .footer { padding: 16px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg); font-size: 80px; color: rgba(0,0,0,0.03); font-weight: 900; pointer-events: none; z-index: 0; }
  @media print { body { padding: 0; background: #fff; } .report { box-shadow: none; } .watermark { display: none; } }
</style></head>
<body>
<div class="report">
  <div class="watermark">SpatialVerse</div>
  <div class="header">
    <div class="header-row">
      <div>
        <h1>${form.icon} ${form.name}</h1>
        <div class="subtitle">SpatialVerse Pulse — TPATA Compliance Inspection Report</div>
      </div>
      <div class="code">${form.code}</div>
    </div>
  </div>
  <div class="meta-bar">
    <div class="meta-item"><div class="meta-label">Site</div><div class="meta-value">${(values[form.fields.find(f => f.label === 'Site Name')?.id || ''] as string) || '—'}</div></div>
    <div class="meta-item"><div class="meta-label">Inspector</div><div class="meta-value">${inspector}</div></div>
    <div class="meta-item"><div class="meta-label">Date</div><div class="meta-value">${(values[form.fields.find(f => f.label.toLowerCase().includes('inspection date') || f.label.toLowerCase().includes('audit date'))?.id || ''] as string) || '—'}</div></div>
    <div class="meta-item"><div class="meta-label">Compliance Rate</div><div class="meta-value">${complianceRate}%</div></div>
  </div>
  <div class="summary-bar">
    <div class="summary-card"><div class="summary-number green">${passCount}</div><div class="summary-label">Passed</div></div>
    <div class="summary-card"><div class="summary-number red">${failCount}</div><div class="summary-label">Failed</div></div>
    <div class="summary-card"><div class="summary-number blue">${totalAnswered}</div><div class="summary-label">Total Fields</div></div>
    <div class="summary-card"><div class="summary-number" style="color: ${complianceRate >= 80 ? '#16a34a' : complianceRate >= 50 ? '#f59e0b' : '#dc2626'}">${complianceRate}%</div><div class="summary-label">Compliance</div></div>
  </div>
  <div class="content">
    ${sectionHtml}
    ${remarks ? `<div class="remarks-box"><div class="remarks-title">⚠️ Remarks / Defects Noted</div><div class="remarks-text">${remarks}</div></div>` : ''}
    <div class="signature-section">
      <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Inspector</div><div class="sig-name">${inspector}</div></div>
      <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Reviewed By</div><div class="sig-name">FM Manager</div></div>
    </div>
  </div>
  <div class="footer">
    Generated by SpatialVerse Pulse • ${form.code} • ${new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })} • Page 1 of 1
  </div>
</div>
</body></html>`;
  }, []);

  // Group fields by section
  const groupedFields = selectedForm ? (() => {
    const groups: Record<string, FormField[]> = {};
    selectedForm.fields.forEach(f => {
      const section = f.section || 'General Information';
      if (!groups[section]) groups[section] = [];
      groups[section].push(f);
    });
    return groups;
  })() : {};

  const handleChatSubmit = () => {
    if (!chatPrompt.trim()) return;
    const lower = chatPrompt.toLowerCase();
    const matched = TPATA_TEMPLATES.filter(t =>
      lower.includes(t.category.toLowerCase()) ||
      lower.includes(t.code.toLowerCase().replace('tpata-', '')) ||
      t.name.toLowerCase().split(' ').some(w => lower.includes(w.toLowerCase()))
    );
    if (matched.length > 0) {
      const form = matched[0];
      setChatResponse(`✅ I've identified the **${form.name}** (${form.code}) inspection form.\n\nThis form has ${form.fields.length} fields across ${Object.keys(form.fields.reduce((acc, f) => ({ ...acc, [f.section || 'general']: true }), {})).length} sections.\n\nClick "Open Form" to start filling it out.`);
    } else {
      setChatResponse(`🔍 Based on your request "${chatPrompt}", I recommend using the **General Workplace Inspection** (TPATA-F10) form.\n\nThis covers lighting, ventilation, housekeeping, signage, and general hazards — suitable for most ad-hoc inspections.\n\nAlternatively, describe the specific system (electrical, HVAC, plumbing, fire, elevator, structural) and I'll suggest the right form.`);
    }
  };

  return (
    <AnimatedPage>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.65rem', sm: '2rem' } }}>
            TPATA Inspection Forms
          </Typography>
        </Box>

        {/* AI Chatbot Section */}
        <AnimatedPanel>
          <Card sx={{
            mb: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha('#8b5cf6', 0.04)} 100%)`,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AIIcon sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={700}>AI Form Assistant</Typography>
                <Chip size="small" label="BETA" color="primary" variant="outlined" sx={{ ml: 1 }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Describe what you need to inspect and I'll recommend the right TPATA form — or customize one for you.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="e.g. 'I need to inspect the fire extinguishers on level 12' or 'electrical switchboard check'"
                  value={chatPrompt}
                  onChange={e => setChatPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
                />
                <Button variant="contained" onClick={handleChatSubmit} sx={{ flexShrink: 0 }}>Ask AI</Button>
              </Box>
              {chatResponse && (
                <Paper sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.background.paper, 0.8), borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{chatResponse}</Typography>
                  <Button size="small" startIcon={<FormIcon />} sx={{ mt: 1 }} onClick={() => {
                    const lower = chatPrompt.toLowerCase();
                    const matched = TPATA_TEMPLATES.filter(t =>
                      lower.includes(t.category.toLowerCase()) ||
                      t.name.toLowerCase().split(' ').some(w => lower.includes(w.toLowerCase()))
                    );
                    if (matched.length > 0) openForm(matched[0]);
                    else openForm(TPATA_TEMPLATES[9]); // General
                  }}>Open Form</Button>
                </Paper>
              )}
            </CardContent>
          </Card>
        </AnimatedPanel>

        {/* Quick presets */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {['electrical', 'HVAC', 'fire safety', 'plumbing', 'elevator', 'structural', 'cleaning', 'waste'].map(q => (
            <Chip key={q} label={`🔍 ${q}`} size="small" variant="outlined" clickable onClick={() => {
              setChatPrompt(`Inspect the ${q} system`);
              setTimeout(handleChatSubmit, 50);
            }} />
          ))}
        </Box>

        {/* Form Templates Grid */}
        <AnimatedPanel delay={1}>
          <Grid container spacing={2}>
            {TPATA_TEMPLATES.map((form, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={form.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                  }}
                  onClick={() => openForm(form)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>{form.icon}</Typography>
                      <Chip size="small" label={form.code} color="primary" variant="outlined" />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>{form.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {form.description.split('—')[0]}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <Chip size="small" label={`${form.fields.length} fields`} variant="outlined" />
                      <Chip size="small" label={form.category} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AnimatedPanel>

        {/* Completed Forms (Demo) */}
        <AnimatedPanel delay={2}>
          <Typography variant="h6" fontWeight={700} sx={{ mt: 4, mb: 2 }}>Recent Completed Inspections</Typography>
          <Grid container spacing={2}>
            {COMPLETED_FORMS.map(cf => {
              const template = TPATA_TEMPLATES.find(t => t.id === cf.templateId);
              return (
                <Grid size={{ xs: 12, md: 4 }} key={cf.id}>
                  <Card sx={{
                    cursor: 'pointer',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                  }} onClick={() => {
                    if (template) {
                      setSelectedForm(template);
                      setFormValues(cf.values);
                      setDrawerOpen(true);
                    }
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '1.3rem' }}>{template?.icon || '📋'}</Typography>
                          <Typography variant="subtitle2" fontWeight={700}>{cf.completedCode}</Typography>
                        </Box>
                        <Chip size="small" label={cf.status} color={cf.status === 'completed' ? 'success' : cf.status === 'in_progress' ? 'warning' : 'default'} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {template?.name || 'Unknown Form'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip size="small" label={cf.site} variant="outlined" />
                        <Chip size="small" label={new Date(cf.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })} variant="outlined" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">Inspector: {cf.inspector}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip size="small" label={`✓ ${cf.passCount}`} sx={{ bgcolor: alpha('#22c55e', 0.1), color: '#16a34a', fontSize: '0.7rem', height: 20 }} />
                          {cf.failCount > 0 && <Chip size="small" label={`✗ ${cf.failCount}`} sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#dc2626', fontSize: '0.7rem', height: 20 }} />}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </AnimatedPanel>

        {/* Form Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: { xs: '100%', sm: 560 } } }}
        >
          {selectedForm && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.3rem' }}>{selectedForm.icon}</Typography>
                    <Typography variant="h6" fontWeight={700}>{selectedForm.name}</Typography>
                  </Box>
                  <Chip size="small" label={selectedForm.code} color="primary" variant="outlined" sx={{ mt: 0.5 }} />
                </Box>
                <Box>
                  <IconButton onClick={() => {
                    const html = generatePdfHtml(selectedForm, formValues);
                    setPdfHtml(html);
                    setPdfViewerOpen(true);
                  }} title="View Report"><PrintIcon /></IconButton>
                  <IconButton onClick={() => {
                    const html = generatePdfHtml(selectedForm, formValues);
                    const blob = new Blob([html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `${selectedForm.code}-report.html`; a.click();
                    URL.revokeObjectURL(url);
                  }} title="Download Report"><DownloadIcon /></IconButton>
                  <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{selectedForm.description}</Typography>

              {Object.entries(groupedFields).map(([section, fields]) => (
                <Box key={section} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{
                    mb: 1.5, pb: 0.5, borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    color: 'primary.main',
                  }}>
                    {section}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fields.map(field => (
                      <FieldRenderer
                        key={field.id}
                        field={field}
                        value={formValues[field.id]}
                        onChange={v => updateField(field.id, v)}
                      />
                    ))}
                  </Box>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" fullWidth onClick={() => {
                  const filledCount = selectedForm.fields.filter(f => formValues[f.id] !== undefined && formValues[f.id] !== '').length;
                  alert(`Form submitted! ${filledCount}/${selectedForm.fields.length} fields filled.`);
                }}>
                  Submit Inspection
                </Button>
                <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => {
                  const html = generatePdfHtml(selectedForm, formValues);
                  setPdfHtml(html);
                  setPdfViewerOpen(true);
                }}>View Report</Button>
              </Box>
            </Box>
          )}
        </Drawer>

        {/* PDF Report Viewer */}
        <Dialog
          open={pdfViewerOpen}
          onClose={() => setPdfViewerOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { height: '90vh', display: 'flex', flexDirection: 'column' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
            <Typography variant="h6" fontWeight={700}>Inspection Report</Typography>
            <Box>
              <IconButton onClick={() => {
                const w = window.open('', '_blank');
                if (w) { w.document.write(pdfHtml); w.document.close(); w.print(); }
              }} title="Print"><PrintIcon /></IconButton>
              <IconButton onClick={() => {
                const blob = new Blob([pdfHtml], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'tpata-report.html'; a.click();
                URL.revokeObjectURL(url);
              }} title="Download"><DownloadIcon /></IconButton>
              <IconButton onClick={() => setPdfViewerOpen(false)}><CloseIcon /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ flex: 1, p: 0, overflow: 'hidden' }}>
            <iframe
              srcDoc={pdfHtml}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Report Preview"
            />
          </DialogContent>
        </Dialog>
      </Box>
    </AnimatedPage>
  );
}
