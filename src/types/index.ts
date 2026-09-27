export type ProjectType = 'marriage' | 'construction' | 'custom';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD';

export type PaymentMode = 
  | 'Bank Transfer / NEFT / RTGS'
  | 'UPI / GPay / PhonePe'
  | 'Cheque'
  | 'Cash'
  | 'Credit / Debit Card'
  | 'Other';

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  allocatedBudget?: number;
}

export interface Expense {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string; // YYYY-MM-DD
  vendor?: string;
  paymentMode: PaymentMode;
  stage?: string;
  receiptNo?: string;
  notes?: string;
  
  // Attached Receipt File (image / document)
  receiptDataUrl?: string;
  receiptFileName?: string;
  receiptFileType?: string;

  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  totalBudget: number;
  currency: CurrencyCode;
  createdAt: string;
  targetDate?: string;
  categories: CategoryItem[];
  notes?: string;

  // Specific to Construction Engineer Contract
  engineerName?: string;
  engineerPhone?: string;
  sqftArea?: number;
  ratePerSqft?: number;
  isSqftContract?: boolean;
  constructionScope?: 'ground_up' | 'first_floor';
}

export interface DeductionAnimationEvent {
  id: string;
  amount: number;
  categoryName: string;
  remainingAfter: number;
  timestamp: number;
}
