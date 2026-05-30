import { createClient } from '@/lib/supabase/server';
import RapportsClient from './RapportsClient';

export default async function RapportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user!.id)
    .order('last_used_at', { ascending: false })
    .limit(1);

  const currentYear = new Date().getFullYear();
  let invoices: { issue_date: string; total_amount: number; paid_amount: number; status: string }[] = [];

  if (businesses?.[0]) {
    const { data } = await supabase
      .from('invoices')
      .select('issue_date, total_amount, paid_amount, status')
      .eq('business_id', businesses[0].id)
      .gte('issue_date', `${currentYear}-01-01`)
      .lte('issue_date', `${currentYear}-12-31`);
    invoices = data ?? [];
  }

  return <RapportsClient invoices={invoices} year={currentYear} />;
}
