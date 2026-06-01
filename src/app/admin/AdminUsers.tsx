'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import { Crown, ArrowDownCircle } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  plan: string;
  created_at: string;
}

export default function AdminUsers({ profiles: initial }: { profiles: Profile[] }) {
  const supabase = createClient();
  const [profiles, setProfiles] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const togglePlan = async (profile: Profile) => {
    const newPlan = profile.plan === 'premium' ? 'free' : 'premium';
    setLoadingId(profile.id);
    const { error } = await supabase
      .from('profiles')
      .update({ plan: newPlan })
      .eq('id', profile.id);
    setLoadingId(null);
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, plan: newPlan } : p));
    }
  };

  return (
    <Card>
      <h2 className="font-semibold text-black mb-4">Utilisateurs ({profiles.length})</h2>
      <div className="space-y-2">
        {profiles.map(profile => (
          <div key={profile.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">{profile.email}</p>
              <p className="text-xs text-gray-400">
                Inscrit le {new Date(profile.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                profile.plan === 'premium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {profile.plan === 'premium' ? '⭐ Illimité' : 'Gratuit'}
              </span>

              <button
                onClick={() => togglePlan(profile)}
                disabled={loadingId === profile.id}
                title={profile.plan === 'premium' ? 'Rétrograder' : 'Passer en Illimité'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-50 ${
                  profile.plan === 'premium'
                    ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {loadingId === profile.id ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : profile.plan === 'premium' ? (
                  <><ArrowDownCircle size={12} /> Rétrograder</>
                ) : (
                  <><Crown size={12} /> Upgrader</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
