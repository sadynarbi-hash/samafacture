import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';
import AppProvider from '@/components/layout/AppProvider';
import type { Profile, Business } from '@/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .order('last_used_at', { ascending: false })
    .limit(1);

  if (!businesses || businesses.length === 0) redirect('/onboarding');

  const profile: Profile = {
    id: user.id,
    email: user.email ?? '',
    plan: 'free',
    created_at: user.created_at,
  };

  return (
    <AppProvider user={profile} initialBusiness={businesses[0] as Business}>
      <div className="min-h-dvh bg-gray-100">
        <main className="page-container px-4 pt-4">
          {children}
        </main>
        <BottomNav />
      </div>
    </AppProvider>
  );
}
