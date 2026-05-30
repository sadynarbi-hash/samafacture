import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Card from '@/components/ui/Card';
import { Users, FileText, Crown } from 'lucide-react';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  // Basic admin check — in production, use a proper roles system
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-gray-500">Accès non autorisé.</p>
      </div>
    );
  }

  const [profilesRes, businessesRes, invoicesRes] = await Promise.all([
    supabase.from('profiles').select('id, email, plan, created_at').order('created_at', { ascending: false }),
    supabase.from('businesses').select('id').then(r => r.data?.length ?? 0),
    supabase.from('invoices').select('id').then(r => r.data?.length ?? 0),
  ]);

  const profiles = profilesRes.data ?? [];
  const freeCount = profiles.filter(p => p.plan === 'free').length;
  const premiumCount = profiles.filter(p => p.plan === 'premium').length;

  return (
    <div className="min-h-dvh bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8">Dashboard Admin</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Utilisateurs', value: profiles.length, icon: Users, color: 'bg-blue-500' },
            { label: 'Premium', value: premiumCount, icon: Crown, color: 'bg-yellow-500' },
            { label: 'Entreprises', value: businessesRes, icon: Users, color: 'bg-green-500' },
            { label: 'Factures', value: invoicesRes, icon: FileText, color: 'bg-purple-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="text-center">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-black">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </Card>
          ))}
        </div>

        {/* Plan breakdown */}
        <Card className="mb-6">
          <h2 className="font-semibold text-black mb-4">Abonnements</h2>
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-black">{freeCount}</p>
              <p className="text-sm text-gray-400">Gratuit</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-600">{premiumCount}</p>
              <p className="text-sm text-gray-400">Premium</p>
            </div>
          </div>
        </Card>

        {/* Users list */}
        <Card>
          <h2 className="font-semibold text-black mb-4">Utilisateurs récents</h2>
          <div className="space-y-2">
            {profiles.slice(0, 50).map(profile => (
              <div key={profile.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-black">{profile.email}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  profile.plan === 'premium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {profile.plan === 'premium' ? 'Premium' : 'Gratuit'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
