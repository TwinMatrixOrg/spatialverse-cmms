import { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, Typography, IconButton, TextField, Chip, alpha, useTheme,
  Collapse, Avatar,
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

// ── Page-specific FAQ data ────────────────────────────────────────
interface FAQItem {
  question: string;
  answer: string;
}

interface PageFAQ {
  label: string;
  icon: string;
  quickQuestions: string[];
  responses: Record<string, string>;
}

const PAGE_FAQS: Record<string, PageFAQ> = {
  '/': {
    label: 'Dashboard',
    icon: '🏠',
    quickQuestions: [
      'What is SpatialVerse Pulse?',
      'How many active work orders right now?',
      'What does the map show?',
    ],
    responses: {
      'what is spatialverse pulse': 'SpatialVerse Pulse is a spatially-aware Computerised Maintenance Management System (CMMS) that integrates 3D digital twins with facility management workflows. It combines asset tracking, work order management, and preventive maintenance with a real-time spatial view of your entire property portfolio.',
      'how many active work orders': 'Currently tracking 42 active work orders across 3 sites: Pavilion KL (18), KLCC (15), and Menara TM (9). 6 are overdue — click on the "Work Orders by Status" chart for details.',
      'what does the map show': 'The map displays all your managed properties with real-time asset locations. Click any building pin to see live sensor data, active work orders, and PM schedules for that site. This spatial view is something no traditional CMMS offers — it\'s our key differentiator.',
      'default': 'The Dashboard gives you a real-time overview of your FM operations: active work orders, asset health, PM compliance, and spatial monitoring across all sites. What would you like to know more about?',
    },
  },
  '/work-orders': {
    label: 'Work Orders',
    icon: '🔧',
    quickQuestions: [
      'How do I create a new work order?',
      'What do the priority levels mean?',
      'How does SLA tracking work?',
    ],
    responses: {
      'how do i create a new work order': 'Click the "+ New Work Order" button at the top. Fill in the title, select priority (P1-P4), assign to a technician, and set the SLA deadline. P1 = 4 hours, P2 = 24 hours, P3 = 72 hours, P4 = 1 week. The system auto-creates escalation alerts if SLA is breached.',
      'what do the priority levels mean': 'P1 = Critical (life safety, total system failure) — 4hr SLA\nP2 = High (major system impact) — 24hr SLA\nP3 = Medium (functional but degraded) — 72hr SLA\nP4 = Low (cosmetic, minor) — 1 week SLA\n\nP1 breaches trigger immediate SMS alerts to the FM Manager.',
      'how does sla tracking work': 'Every work order has an SLA deadline calculated from priority. The system monitors time remaining and triggers escalation alerts at 75% (warning) and 100% (breach). Breached WOs show red on the dashboard and are auto-escalated to supervisors.',
      'default': 'Work Orders are the core of the CMMS. You can create, assign, track, and close work orders with full audit trails, cost tracking, and SLA monitoring. What would you like to know?',
    },
  },
  '/assets': {
    label: 'Assets',
    icon: '🏗️',
    quickQuestions: [
      'What is SKATA code?',
      'How is asset health calculated?',
      'Can I see assets on the map?',
    ],
    responses: {
      'what is skata code': 'SKATA (Sistem Kod Aset Tanah) is Malaysia\'s JKR land asset classification code. It uniquely identifies government-owned assets by type, location, and ownership. For example: "HVAC-001-PKL-0" = HVAC system #1 at Pavilion KL, Block A. This is required for JKR compliance and government FM contracts.',
      'how is asset health calculated': 'Asset health is a 0-100 score based on: age (% of expected life), maintenance history (PM compliance), failure frequency (MTBF), sensor readings (temperature, vibration trends), and open work orders. Scores below 60 = Critical (red), 60-80 = Warning (yellow), above 80 = Good (green).',
      'can i see assets on the map': 'Yes! Click "Floor Plan" in the sidebar to see all assets mapped to their physical locations. Each asset shows its type icon and health status color. Click any asset to see its full history, sensors, and linked work orders. This spatial view is unique to SpatialVerse.',
      'default': 'The Asset Registry tracks all building systems with SKATA/PeDATA compliance codes, health scoring, failure history, and real-time sensor data. What would you like to know?',
    },
  },
  '/procurement': {
    label: 'Procurement',
    icon: '🛒',
    quickQuestions: [
      'What is the PO workflow?',
      'How do I link a PO to a work order?',
      'What is a GRN?',
    ],
    responses: {
      'what is the po workflow': 'The procurement workflow follows: Purchase Requisition (PR) → Purchase Order (PO) → Goods Receipt Note (GRN) → Invoice matching. PRs are created by technicians needing parts, approved by FM Managers, converted to POs, sent to vendors, and goods are received via GRN. Full audit trail at every step.',
      'how do i link a po to a work order': 'When creating a PR or PO, select the linked Work Order from the dropdown. This tracks procurement costs against specific maintenance tasks. The WO cost summary automatically includes PO amounts once received.',
      'what is a grn': 'GRN (Goods Receipt Note) documents what was actually received against a PO. It records quantities, condition (good/damaged/incorrect), and dates. Partial deliveries are tracked separately. GRN triggers the payment cycle and updates inventory stock levels.',
      'default': 'Procurement manages the full purchasing lifecycle: PRs, POs, vendor tracking, GRNs, and cost allocation to work orders. What would you like to know?',
    },
  },
  '/tpata-forms': {
    label: 'TPATA Forms',
    icon: '📋',
    quickQuestions: [
      'What is TPATA?',
      'How does the AI form generator work?',
      'Can I export completed forms?',
    ],
    responses: {
      'what is tpata': 'TPATA (Tadbir Urus Prestasi & Tindakan Aktif) is the JKR standard for facility inspection and maintenance documentation. It defines structured forms for electrical, HVAC, fire safety, plumbing, elevator, structural, cleaning, and waste management inspections. Compliance is mandatory for Malaysian government FM contracts.',
      'how does the ai form generator work': 'Describe what you need to inspect in natural language — e.g., "check fire extinguishers on Level 12" — and the AI matches your request to the correct TPATA template (Form 1-10). It pre-fills known information and presents the right fields. This replaces CWorks\' 20-minute manual form builder with a 5-second AI interaction.',
      'can i export completed forms': 'Yes! Completed forms can be viewed as a professional PDF-style report (with SpatialVerse branding, pass/fail summaries, compliance scores, and signature lines) or exported as CSV. Click "View Report" on any completed form to see the formatted version.',
      'default': 'TPATA Forms provides 10 pre-defined JKR-compliant inspection templates with an AI assistant that recommends the right form based on what you need to inspect. Completed forms export as professional reports. What do you need?',
    },
  },
  '/apd-dashboard': {
    label: 'APD Dashboard',
    icon: '📊',
    quickQuestions: [
      'What is APD?',
      'How are deductions calculated?',
      'What grades can we get?',
    ],
    responses: {
      'what is apd': 'APD (Ascertained Performance Deduction) is JKR\'s monthly KPI-based payment deduction system for FM contractors. It scores performance across 6 categories: response time, resolution time, PM compliance, system availability, cleanliness, and safety. Poor scores result in payment deductions — this is how the government ensures contractor accountability.',
      'how are deductions calculated': 'Each KPI has a weight (e.g., PM Compliance = 25%) and a max deduction percentage. Monthly scores are weighted and averaged. If a KPI scores below 65%, the full deduction applies; 65-75% = 50% deduction; 75-85% = 25% deduction; above 85% = no deduction. The total is deducted from the monthly gross payment.',
      'what grades can we get': 'Grade A = ≥95% weighted score (no deduction)\nGrade B = ≥85% (minimal deduction)\nGrade C = ≥75% (moderate deduction)\nGrade D = ≥65% (significant deduction)\nGrade F = <65% (severe — contract review triggered)\n\nOur current score: 98% (Grade A) for April 2026.',
      'default': 'APD Dashboard tracks JKR monthly performance scoring across 6 KPIs with weighted deductions, grade badges, and payment impact. What do you need?',
    },
  },
  '/pm-schedules': {
    label: 'PM Schedules',
    icon: '📅',
    quickQuestions: [
      'How do PM templates work?',
      'What is PM compliance rate?',
      'Can I auto-create WOs from PMs?',
    ],
    responses: {
      'how do pm templates work': 'Each asset type has a pre-built checklist template. When you create a PM schedule, pick the template type (HVAC, Electrical, Cleaning, Waste Collection, etc.) and it auto-populates with 5-8 relevant checklist items. Templates ensure consistent maintenance across all sites.',
      'what is pm compliance rate': 'PM compliance = (PMs completed on time / PMs due) × 100. JKR requires ≥95% compliance. Below 85% triggers APD deductions. Our current rate: 96.5% — well above threshold.',
      'can i auto-create wos from pms': 'Yes — enable "Auto Create WO" on any PM schedule. When the PM is due, the system automatically generates a work order with the checklist pre-loaded, assigns it to the right technician, and sets the SLA based on frequency.',
      'default': 'PM Schedules manage preventive maintenance with templates, auto-WO creation, and calendar views. What would you like to know?',
    },
  },
};

// ── Fallback for pages without specific FAQs ─────────────────────
const DEFAULT_FAQ: PageFAQ = {
  label: 'General',
  icon: '💬',
  quickQuestions: [
    'What is SpatialVerse Pulse?',
    'How does JKR compliance work?',
    'What makes us different from CWorks?',
  ],
  responses: {
    'what is spatialverse pulse': 'SpatialVerse Pulse is a spatially-aware CMMS that combines 3D digital twins with facility management. It covers work orders, PM, assets, procurement, JKR compliance (TPATA + APD), and more — with a unique spatial view that no competitor offers.',
    'how does jkr compliance work': 'We have a dedicated "JKR Compliance" section with TPATA inspection forms (10 pre-built templates) and APD deduction dashboards (6 KPIs with monthly scoring). This is table-stakes for Malaysian government FM contracts and something CWorks implements but doesn\'t package as a named feature.',
    'what makes us different from cworks': 'Three advantages: 1) Spatial Twin — real-time 3D map view of all assets (CWorks is flat tables). 2) AI Form Generator — 5 seconds vs 20 minutes for TPATA forms. 3) JKR Compliance as a first-class feature, not buried. We\'re at feature parity on 19/19 modules.',
    'default': 'I\'m here to help with any questions about SpatialVerse Pulse. Try the quick question chips below, or ask me anything about the current page.',
  },
};

// ── Component ────────────────────────────────────────────────────
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatBot() {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [typingText, setTypingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pageFaq = PAGE_FAQS[location.pathname] || DEFAULT_FAQ;

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset chat on page change
  useEffect(() => {
    setMessages([{
      id: Date.now(),
      text: `Hi! I can help you with ${pageFaq.icon} ${pageFaq.label}. Here are some things you might want to know:`,
      sender: 'bot',
      timestamp: new Date(),
    }]);
  }, [location.pathname]);

  const findResponse = (query: string): string => {
    const lower = query.toLowerCase().trim();
    // Check for exact or close matches
    for (const [key, response] of Object.entries(pageFaq.responses)) {
      if (key === 'default') continue;
      const keyWords = key.split(' ');
      const matchCount = keyWords.filter(w => lower.includes(w)).length;
      if (matchCount >= Math.ceil(keyWords.length * 0.6)) {
        return response;
      }
    }
    // Check all page FAQs as fallback
    for (const faq of Object.values(PAGE_FAQS)) {
      for (const [key, response] of Object.entries(faq.responses)) {
        if (key === 'default') continue;
        const keyWords = key.split(' ');
        const matchCount = keyWords.filter(w => lower.includes(w)).length;
        if (matchCount >= Math.ceil(keyWords.length * 0.6)) {
          return response;
        }
      }
    }
    return pageFaq.responses['default'];
  };

  const simulateResponse = (responseText: string) => {
    setThinking(true);
    // Phase 1: thinking dots (600ms)
    setTimeout(() => {
      setThinking(false);
      setTypingText('');
      // Phase 2: token-by-token reveal
      const botId = Date.now() + 2;
      setMessages(prev => [...prev, { id: botId, text: '', sender: 'bot', timestamp: new Date() }]);
      const words = responseText.split(' ');
      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        const partial = words.slice(0, idx).join(' ');
        setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: partial } : m));
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        if (idx >= words.length) {
          clearInterval(interval);
          setTypingText('');
        }
      }, 30 + Math.random() * 20); // variable speed for realism
    }, 800 + Math.random() * 400);
    // Animate thinking dots
    let dots = 0;
    const dotInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      setTypingText('Thinking' + '.'.repeat(dots));
    }, 200);
    setTimeout(() => clearInterval(dotInterval), 1200);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const response = findResponse(input);
    simulateResponse(response);
  };

  const handleQuickQuestion = (q: string) => {
    const userMsg: Message = { id: Date.now(), text: q, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const response = findResponse(q);
    simulateResponse(response);
  };

  return (
    <>
      {/* FAB */}
      {!open && (
        <Box
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1300,
            width: 56, height: 56, borderRadius: '50%', cursor: 'pointer',
            background: 'linear-gradient(135deg, #0A4D8C 0%, #00A3A1 100%)',
            boxShadow: '0 4px 20px rgba(0,163,161,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': { transform: 'scale(1.1)', boxShadow: '0 6px 24px rgba(0,163,161,0.5)' },
          }}
        >
          <ChatIcon sx={{ color: '#fff', fontSize: 28 }} />
        </Box>
      )}

      {/* Chat Window */}
      <Collapse in={open} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
        <Paper
          elevation={8}
          sx={{
            width: { xs: 'calc(100vw - 48px)', sm: 380 },
            height: { xs: 'calc(100vh - 120px)', sm: 520 },
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            bgcolor: 'background.paper',
          }}
        >
          {/* Header */}
          <Box sx={{
            p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0A4D8C 0%, #00A3A1 100%)', color: '#fff',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                <BotIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>Pulse Assistant</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>{pageFaq.icon} {pageFaq.label}</Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: alpha(theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc', 0.5) }}>
            {messages.map(msg => (
              <Box key={msg.id} sx={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                <Box sx={{
                  p: 1.5, borderRadius: 2,
                  bgcolor: msg.sender === 'user' ? 'primary.main' : alpha(theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9', 1),
                  color: msg.sender === 'user' ? '#fff' : (theme.palette.mode === 'dark' ? '#e2e8f0' : 'text.primary'),
                  borderBottomRightRadius: msg.sender === 'user' ? 4 : 16,
                  borderBottomLeftRadius: msg.sender === 'user' ? 16 : 4,
                  border: msg.sender === 'user' ? 'none' : `1px solid ${alpha(theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0', 0.5)}`,
                }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {msg.text}
                  </Typography>
                </Box>
              </Box>
            ))}
            {thinking && (
              <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                <Box sx={{
                  p: 1.5, borderRadius: 2, borderBottomLeftRadius: 4,
                  bgcolor: alpha(theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9', 1),
                  border: `1px solid ${alpha(theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0', 0.5)}`,
                  display: 'flex', alignItems: 'center', gap: 1,
                }}>
                  <Box sx={{
                    '@keyframes thinkPulse': {
                      '0%, 100%': { opacity: 0.4 },
                      '50%': { opacity: 1 },
                    },
                    display: 'flex', gap: 0.5,
                  }}>
                    {[0, 1, 2].map(i => (
                      <Box key={i} sx={{
                        width: 6, height: 6, borderRadius: '50%',
                        bgcolor: 'primary.main',
                        animation: `thinkPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {typingText || 'Thinking...'}
                  </Typography>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Questions */}
          <Box sx={{ px: 1.5, pb: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {pageFaq.quickQuestions.map((q, i) => (
              <Chip
                key={i}
                label={q}
                size="small"
                variant="outlined"
                clickable
                disabled={thinking}
                onClick={() => handleQuickQuestion(q)}
                sx={{
                  fontSize: '0.7rem', height: 26, maxWidth: '100%',
                  bgcolor: alpha(theme.palette.mode === 'dark' ? '#1e293b' : '#fff', 0.8),
                  borderColor: alpha(theme.palette.mode === 'dark' ? '#475569' : '#cbd5e1', 0.5),
                  color: theme.palette.mode === 'dark' ? '#cbd5e1' : 'text.primary',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                }}
              />
            ))}
          </Box>

          {/* Input */}
          <Box sx={{ p: 1.5, pt: 0.5, borderTop: `1px solid ${alpha(theme.palette.mode === 'dark' ? '#334155' : theme.palette.divider, 0.5)}`, display: 'flex', gap: 1, bgcolor: 'background.paper' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Ask a question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 3 },
                '& .MuiInputBase-input': { color: 'text.primary' },
                '& .MuiInputBase-input::placeholder': { color: alpha(theme.palette.text.secondary, 0.7), opacity: 1 },
              }}
            />
            <IconButton onClick={handleSend} color="primary" sx={{ flexShrink: 0 }} disabled={thinking}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>
    </>
  );
}
