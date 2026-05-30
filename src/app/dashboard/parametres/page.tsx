import { createClient } from '@/lib/supabase/server';
import ParametresClient from './ParametresClient';
import type { Business } from '@/types';

export default async function ParametresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user!.id)
    .order('last_used_at', { ascending: false });

  return <ParametresClient businesses={(businesses as Business[]) ?? []} />;
}
