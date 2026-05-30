import { createClient } from '@/lib/supabase/server';
import FacturesClient from './FacturesClient';
import type { Invoice } from '@/types';

export default async function FacturesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user!.id)
    .order('last_used_at', { ascending: false })
    .limit(1);

  let invoices: Invoice[] = [];
  if (businesses?.[0]) {
    const { data } = await supabase
      .from('invoices')
      .select('*, client:clients(id, name, email, phone, address, outstanding_amount, created_at, business_id)')
      .eq('business_id', businesses[0].id)
      .order('created_at', { ascending: false });
    invoices = (data as Invoice[]) ?? [];
  }

  return <FacturesClient invoices={invoices} />;
}
