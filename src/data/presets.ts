import { CategoryItem, Project, Expense } from '../types';

export const MARRIAGE_CATEGORIES: CategoryItem[] = [
  { id: 'm_venue', name: 'Venue & Banquet Hall', icon: '•', color: '#6366f1' },
  { id: 'm_catering', name: 'Catering & Food Services', icon: '•', color: '#0ea5e9' },
  { id: 'm_jewelry', name: 'Gold & Jewelry', icon: '•', color: '#f59e0b' },
  { id: 'm_attire', name: 'Bridal & Groom Attire', icon: '•', color: '#ec4899' },
  { id: 'm_photo', name: 'Photography & Media', icon: '•', color: '#8b5cf6' },
  { id: 'm_decor', name: 'Stage & Floral Decor', icon: '•', color: '#10b981' },
  { id: 'm_invites', name: 'Invitations & Gifts', icon: '•', color: '#06b6d4' },
  { id: 'm_music', name: 'Music & Entertainment', icon: '•', color: '#64748b' },
  { id: 'm_stay', name: 'Travel & Accommodation', icon: '•', color: '#3b82f6' },
  { id: 'm_beauty', name: 'Bridal Styling & Mehendi', icon: '•', color: '#f43f5e' },
  { id: 'm_misc', name: 'Sundry & Contingency', icon: '•', color: '#94a3b8' },
];

export const ENGINEER_CONTRACT_STAGES_GROUND_UP: CategoryItem[] = [
  { id: 'eng_advance', name: 'Stage 01: Agreement & Booking Advance', icon: '01', color: '#475569' },
  { id: 'eng_foundation', name: 'Stage 02: Earthwork & Footing Foundation', icon: '02', color: '#64748b' },
  { id: 'eng_plinth', name: 'Stage 03: Plinth Beam & Basement Filling', icon: '03', color: '#0284c7' },
  { id: 'eng_slab_gf', name: 'Stage 04: Ground Floor Roof Slab', icon: '04', color: '#059669' },
  { id: 'eng_slab_ff', name: 'Stage 05: First Floor Roof Slab', icon: '05', color: '#10b981' },
  { id: 'eng_brickwork', name: 'Stage 06: Brickwork & Wall Masonry', icon: '06', color: '#d97706' },
  { id: 'eng_plastering', name: 'Stage 07: Internal & External Plastering', icon: '07', color: '#ea580c' },
  { id: 'eng_flooring', name: 'Stage 08: Flooring & Wall Tiles', icon: '08', color: '#e11d48' },
  { id: 'eng_electrical_plumbing', name: 'Stage 09: Concealed Electrical & Plumbing', icon: '09', color: '#9333ea' },
  { id: 'eng_painting', name: 'Stage 10: Painting, Primer & Putty', icon: '10', color: '#4f46e5' },
  { id: 'eng_handover', name: 'Stage 11: Final Handover & Retention', icon: '11', color: '#0f766e' },
  { id: 'eng_extra', name: 'Stage 12: Extra Works & Alterations', icon: '12', color: '#6b7280' },
];

export const ENGINEER_CONTRACT_STAGES_FIRST_FLOOR: CategoryItem[] = [
  { id: 'ff_advance', name: 'Stage 01: Agreement & Mobilization Advance', icon: '01', color: '#475569' },
  { id: 'ff_columns', name: 'Stage 02: Column Raising & Structure Frame', icon: '02', color: '#0284c7' },
  { id: 'ff_slab', name: 'Stage 03: First Floor Roof Slab & Beam Casting', icon: '03', color: '#059669' },
  { id: 'ff_brickwork', name: 'Stage 04: Brickwork & Wall Masonry', icon: '04', color: '#d97706' },
  { id: 'ff_parapet', name: 'Stage 05: Parapet Wall & Headroom', icon: '05', color: '#10b981' },
  { id: 'ff_plastering', name: 'Stage 06: Internal & External Plastering', icon: '06', color: '#ea580c' },
  { id: 'ff_flooring', name: 'Stage 07: Flooring, Granite & Tiles', icon: '07', color: '#e11d48' },
  { id: 'ff_electrical_plumbing', name: 'Stage 08: Electrical & Plumbing Lines', icon: '08', color: '#9333ea' },
  { id: 'ff_doors_windows', name: 'Stage 09: Doors, Windows & Carpentry', icon: '09', color: '#6366f1' },
  { id: 'ff_painting', name: 'Stage 10: Painting, Primer & Finishing', icon: '10', color: '#4f46e5' },
  { id: 'ff_handover', name: 'Stage 11: Final Handover & Settlement', icon: '11', color: '#0f766e' },
  { id: 'ff_extra', name: 'Stage 12: Extra Alterations & Amenities', icon: '12', color: '#6b7280' },
];

export const ENGINEER_CONTRACT_STAGES = ENGINEER_CONTRACT_STAGES_FIRST_FLOOR;

export const DEFAULT_INITIAL_BUDGET = 0; // Starts 100% blank

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_marriage',
    name: 'Marriage Expense Portfolio',
    type: 'marriage',
    totalBudget: 0,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    categories: MARRIAGE_CATEGORIES,
    notes: 'Marriage expenses portfolio.'
  },
  {
    id: 'proj_construction',
    name: 'Construction (Engineer Contract)',
    type: 'construction',
    totalBudget: 0,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    categories: ENGINEER_CONTRACT_STAGES_FIRST_FLOOR,
    notes: 'Turnkey square-foot rate contract.',
    engineerName: 'Site Engineer / Contractor',
    engineerPhone: '',
    sqftArea: 0,
    ratePerSqft: 0,
    isSqftContract: true,
    constructionScope: 'first_floor'
  }
];

// Clean initial state (No preloaded demo data)
export const INITIAL_EXPENSES: Expense[] = [];

// Optional sample data if user chooses to load
export const DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp_m1',
    projectId: 'proj_marriage',
    title: 'Convention Hall Booking Advance',
    amount: 350000,
    categoryId: 'm_venue',
    categoryName: 'Venue & Banquet Hall',
    date: new Date().toISOString().split('T')[0],
    vendor: 'Grand Palace Convention Center',
    paymentMode: 'Bank Transfer / NEFT / RTGS',
    notes: 'Advance booking reservation.',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'exp_c1',
    projectId: 'proj_construction',
    title: 'Contract Signing & Mobilization',
    amount: 250000,
    categoryId: 'eng_advance',
    categoryName: 'Stage 01: Agreement & Booking Advance',
    date: new Date().toISOString().split('T')[0],
    vendor: 'Er. Rajesh Kumar',
    paymentMode: 'Bank Transfer / NEFT / RTGS',
    receiptNo: 'REC-001',
    notes: 'Contract advance.',
    createdAt: Date.now() - 3 * 86400000,
  }
];
