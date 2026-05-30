import { createClient } from '@/lib/supabase/server';
import ClientsClient from './ClientsClient';
import type { Client } from '@/types';

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user!.id)
    .order('last_used_at', { ascending: false })
    .limit(1);

  let clients: Client[] = [];
  if (businesses?.[0]) {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('business_id', businesses[0].id)
      .order('name');
    clients = (data as Client[]) ?? [];
  }

  return <ClientsClient clients={clients} businessId={businesses?.[0]?.id} />;
}
