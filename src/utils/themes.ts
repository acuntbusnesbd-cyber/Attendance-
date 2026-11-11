import { CardTheme } from '../types';

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'academic',
    name: 'Royal Academic',
    nameBn: 'রয়্যাল একাডেমিক',
    description: 'Deep navy with gold accents, official institution header and crest styling',
    accentColor: '#1e3a8a',
    bgGradient: 'from-slate-900 via-blue-950 to-indigo-950 text-white',
  },
  {
    id: 'modern',
    name: 'Modern Emerald',
    nameBn: 'মডার্ন এমারেল্ড',
    description: 'Fresh emerald and mint gradients with crisp executive cards and badges',
    accentColor: '#059669',
    bgGradient: 'from-emerald-950 via-teal-900 to-slate-900 text-white',
  },
  {
    id: 'cyber',
    name: 'Cyber Slate',
    nameBn: 'সাইবার ডার্ক',
    description: 'High-contrast dark slate with neon cyan and amber glowing highlights',
    accentColor: '#06b6d4',
    bgGradient: 'from-slate-950 via-zinc-900 to-cyan-950 text-white',
  },
  {
    id: 'minimal',
    name: 'Classic Official',
    nameBn: 'অফিসিয়াল মিনিমাল',
    description: 'Light clean paper look with formal dark navy ink and crisp boxed grid',
    accentColor: '#0f172a',
    bgGradient: 'from-gray-50 via-white to-slate-100 text-slate-900',
  },
];
