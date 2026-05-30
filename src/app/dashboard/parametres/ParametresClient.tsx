'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import {
  User, Building2, CreditCard, BookOpen, Settings, MessageCircle,
  ChevronRight, LogOut, Zap, Plus
} from 'lucide-react';
import type { Business } from '@/types';

interface Props {
  businesses: Business[];
}

const menuItems = [
  { icon: User, label: 'Compte personnel', href: '#' },
  { icon: Building2, label: 'Informations de l\'entreprise', href: '#' },
  { icon: CreditCard, label: 'Demandes de paiement', href: '#' },
  { icon: BookOpen, label: 'Catalogue de prix', href: '#' },
  { icon: Settings, label: 'Gérer mon abonnement', href: '#' },
  { icon: MessageCircle, label: 'Contacter le support', href: '#' },
];

export default function ParametresClient({ businesses }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const current = businesses[0];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <>
      <div className="pt-2 mb-4">
        <h1 className="text-2xl font-bold text-black">Paramètres</h1>
      </div>

      {/* Upgrade banner */}
      <div className="bg-black text-white rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Zap size={16} className="text-yellow-300" />
          </div>
          <div>
            <p className="font-bold text-sm">Passer à l&apos;illimité</p>
            <p className="text-white/70 text-xs">Essai gratuit disponible</p>
          </div>
        </div>
        <Button size="sm" variant="secondary" className="!text-black !bg-white text-xs">
          Essayer maintenant
        </Button>
      </div>

      {/* Business */}
      {current && (
        <Card className="mb-4 flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
            {current.logo_url ? (
              <Image src={current.logo_url} alt="Logo" width={56} height={56} className="object-cover w-full h-full" />
            ) : (
              <Building2 size={24} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-black truncate">{current.name}</p>
            <p className="text-xs text-gray-400">{current.email ?? 'Aucun email'}</p>
          </div>
        </Card>
      )}

      {/* Menu */}
      <Card padding="none" className="mb-4 overflow-hidden">
        {menuItems.map(({ icon: Icon, label }, i) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left ${i < menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon size={16} className="text-gray-600" />
            </div>
            <span className="flex-1 text-sm font-medium text-black">{label}</span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
      </Card>

      {/* All businesses */}
      {businesses.length > 1 && (
        <Card className="mb-4">
          <p className="text-sm font-semibold text-black mb-3">Mes entreprises ({businesses.length})</p>
          <div className="space-y-2">
            {businesses.map(b => (
              <div key={b.id} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 size={14} className="text-gray-500" />
                </div>
                <span className="text-sm font-medium text-black flex-1">{b.name}</span>
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-black hover:text-black transition-colors mt-3">
            <Plus size={16} />
            Nouvelle entreprise
          </button>
        </Card>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-3.5 text-red-500 font-medium text-sm hover:bg-red-50 rounded-2xl transition-colors mb-6"
      >
        <LogOut size={16} />
        Se déconnecter
      </button>
    </>
  );
}
