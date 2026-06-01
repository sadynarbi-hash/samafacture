export type UserPlan = 'free' | 'premium';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  plan: UserPlan;
  created_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  stamp_url?: string;
  signature_url?: string;
  invoice_count: number;
  quote_count: number;
  last_used_at: string;
  created_at: string;
}

export interface Client {
  id: string;
  business_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  outstanding_amount: number;
  created_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial';

export interface InvoiceItem {
  id: string;
  type: 'service' | 'material' | 'other';
  name: string;
  details?: string;
  unit_price: number;
  quantity: number;
  unit_type?: string;
  discount: number;
  taxable: boolean;
  saved_to_catalog: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Invoice {
  id: string;
  business_id: string;
  client_id?: string;
  client?: Client;
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  payments: Payment[];
  total_amount: number;
  paid_amount: number;
  currency: string;
  photo_urls: string[];
  notes?: string;
  created_at: string;
}

export interface Quote {
  id: string;
  business_id: string;
  client_id?: string;
  client?: Client;
  quote_number: string;
  issue_date: string;
  due_date?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  items: InvoiceItem[];
  total_amount: number;
  currency: string;
  notes?: string;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  business_id: string;
  type: 'service' | 'material' | 'other';
  name: string;
  details?: string;
  unit_price: number;
  unit_type?: string;
  taxable: boolean;
}
