'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Image from 'next/image';
import { useApp } from '@/lib/store';
import {
  User, Building2, BookOpen, Settings, MessageCircle, Crown,
  ChevronRight, LogOut, Zap, Plus, ImagePlus, ExternalLink,
} from 'lucide-react';
import type { Business } from '@/types';
import CatalogueModal from './CatalogueModal';

interface Props {
  businesses: Business[];
}

type ActiveModal = 'compte' | 'entreprise' | 'catalogue' | 'abonnement' | 'support' | null;

export default function ParametresClient({ businesses: initial }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const { user } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const [businesses, setBusinesses] = useState(initial);
  const current = businesses[0];
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [loading, setLoading] = useState(false);

  // Entreprise form
  const [bizForm, setBizForm] = useState({
    name: current?.name ?? '',
    email: current?.email ?? '',
    phone: current?.phone ?? '',
    address: current?.address ?? '',
    logoPreview: current?.logo_url ?? '',
    logoFile: null as File | null,
    stampPreview: current?.stamp_url ?? '',
    stampFile: null as File | null,
    signaturePreview: current?.signature_url ?? '',
    signatureFile: null as File | null,
  });

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBizForm(f => ({ ...f, logoFile: file, logoPreview: URL.createObjectURL(file) }));
  };

  const handleFileUpload = async (file: File, userId: string): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('logos').upload(path, file);
    if (error) return '';
    return supabase.storage.from('logos').getPublicUrl(path).data.publicUrl;
  };

  const handleSaveEntreprise = async () => {
    if (!current) return;
    setLoading(true);
    try {
      let logoUrl = current.logo_url ?? '';
      if (bizForm.logoFile) {
        const { data: { user } } = await supabase.auth.getUser();
        const ext = bizForm.logoFile.name.split('.').pop();
        const path = `${user!.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('logos').upload(path, bizForm.logoFile);
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);
          logoUrl = publicUrl;
        }
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      let stampUrl = current.stamp_url ?? '';
      if (bizForm.stampFile) stampUrl = await handleFileUpload(bizForm.stampFile, authUser!.id);
      let signatureUrl = current.signature_url ?? '';
      if (bizForm.signatureFile) signatureUrl = await handleFileUpload(bizForm.signatureFile, authUser!.id);

      const { data, error } = await supabase
        .from('businesses')
        .update({
          name: bizForm.name,
          email: bizForm.email || null,
          phone: bizForm.phone || null,
          address: bizForm.address || null,
          logo_url: logoUrl || null,
          stamp_url: stampUrl || null,
          signature_url: signatureUrl || null,
        })
        .eq('id', current.id)
        .select()
        .single();
      if (!error && data) {
        setBusinesses(prev => prev.map(b => b.id === current.id ? data as Business : b));
        setActiveModal(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const menuItems = [
    { key: 'compte' as ActiveModal, icon: User, label: 'Compte personnel' },
    { key: 'entreprise' as ActiveModal, icon: Building2, label: "Informations de l'entreprise" },
    { key: 'catalogue' as ActiveModal, icon: BookOpen, label: 'Catalogue de prix' },
    { key: 'abonnement' as ActiveModal, icon: Settings, label: 'Gérer mon abonnement' },
    { key: 'support' as ActiveModal, icon: MessageCircle, label: 'Contacter le support' },
  ];

  return (
    <>
      <div className="pt-2 mb-4">
        <h1 className="text-2xl font-bold text-black">Paramètres</h1>
      </div>

      {/* Upgrade banner — only for free users */}
      {(!user || user.plan !== 'premium') && <div className="bg-black text-white rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Zap size={16} className="text-yellow-300" />
          </div>
          <div>
            <p className="font-bold text-sm">Passer à l&apos;illimité</p>
            <p className="text-white/70 text-xs">Essai gratuit disponible</p>
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setActiveModal('abonnement')} className="!text-black !bg-white text-xs">
          Essayer maintenant
        </Button>
      </div>}

      {/* Premium badge for premium users */}
      {user?.plan === 'premium' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-4 flex items-center gap-3">
          <Crown size={18} className="text-yellow-500 shrink-0" />
          <p className="text-sm font-semibold text-yellow-700">Plan Illimité actif</p>
        </div>
      )}

      {/* Business card */}
      {current && (
        <Card className="mb-4 flex items-center gap-4 cursor-pointer" onClick={() => setActiveModal('entreprise')}>
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
          <ChevronRight size={16} className="text-gray-300" />
        </Card>
      )}

      {/* Menu */}
      <Card padding="none" className="mb-4 overflow-hidden">
        {menuItems.map(({ key, icon: Icon, label }, i) => (
          <button
            key={label}
            onClick={() => key !== undefined && setActiveModal(key)}
            className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left ${i < menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon size={16} className="text-gray-600" />
            </div>
            <span className="flex-1 text-sm font-medium text-black">{label}</span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
      </Card>

      {/* Businesses list */}
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
      <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 py-3.5 text-red-500 font-medium text-sm hover:bg-red-50 rounded-2xl transition-colors mb-6">
        <LogOut size={16} />
        Se déconnecter
      </button>

      {/* ── MODAL: Compte personnel ── */}
      <Modal open={activeModal === 'compte'} onClose={() => setActiveModal(null)} title="Compte personnel">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
              <User size={28} className="text-white" />
            </div>
            <p className="font-bold text-black">{current?.name}</p>
            <p className="text-sm text-gray-400 mt-1">Connecté via email</p>
          </div>
          <div className="py-2">
            <p className="text-xs text-gray-400 mb-1">Plan actuel</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-black">Gratuit</span>
              <button onClick={() => setActiveModal('abonnement')} className="text-sm font-semibold text-black underline">
                Passer à l&apos;illimité
              </button>
            </div>
          </div>
          <Button fullWidth variant="secondary" onClick={() => setActiveModal(null)}>Fermer</Button>
        </div>
      </Modal>

      {/* ── MODAL: Informations entreprise ── */}
      <Modal open={activeModal === 'entreprise'} onClose={() => setActiveModal(null)} title="Mon entreprise">
        <div className="space-y-4">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 hover:border-black transition-colors"
            >
              {bizForm.logoPreview ? (
                <Image src={bizForm.logoPreview} alt="Logo" width={96} height={96} className="object-contain w-full h-full" />
              ) : (
                <ImagePlus size={24} className="text-gray-400" />
              )}
            </button>
            <span className="text-xs text-gray-400">Appuyez pour changer le logo</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
          </div>

          <Input label="Nom de l'entreprise *" value={bizForm.name} onChange={e => setBizForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" value={bizForm.email} onChange={e => setBizForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@entreprise.com" />
          <Input label="Téléphone" value={bizForm.phone} onChange={e => setBizForm(f => ({ ...f, phone: e.target.value }))} placeholder="+221 77 000 00 00" />
          <Input label="Adresse" value={bizForm.address} onChange={e => setBizForm(f => ({ ...f, address: e.target.value }))} placeholder="Dakar, Sénégal" />

          {/* Cachet & Signature */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Cachet */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => stampInputRef.current?.click()}
                className="w-full h-24 bg-gray-50 rounded-2xl flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 hover:border-black transition-colors"
              >
                {bizForm.stampPreview ? (
                  <Image src={bizForm.stampPreview} alt="Cachet" width={88} height={88} className="object-contain w-full h-full p-1" />
                ) : (
                  <>
                    <ImagePlus size={20} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">Cachet</span>
                  </>
                )}
              </button>
              <span className="text-xs text-gray-400 text-center">Cachet de l&apos;entreprise</span>
              <input ref={stampInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setBizForm(b => ({ ...b, stampFile: f, stampPreview: URL.createObjectURL(f) })); }} />
            </div>

            {/* Signature */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => signatureInputRef.current?.click()}
                className="w-full h-24 bg-gray-50 rounded-2xl flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 hover:border-black transition-colors"
              >
                {bizForm.signaturePreview ? (
                  <Image src={bizForm.signaturePreview} alt="Signature" width={88} height={88} className="object-contain w-full h-full p-1" />
                ) : (
                  <>
                    <ImagePlus size={20} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">Signature</span>
                  </>
                )}
              </button>
              <span className="text-xs text-gray-400 text-center">Signature du responsable</span>
              <input ref={signatureInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setBizForm(b => ({ ...b, signatureFile: f, signaturePreview: URL.createObjectURL(f) })); }} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setActiveModal(null)} className="flex-1">Annuler</Button>
            <Button onClick={handleSaveEntreprise} loading={loading} disabled={!bizForm.name.trim()} className="flex-1">Enregistrer</Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Catalogue de prix ── */}
      <Modal open={activeModal === 'catalogue'} onClose={() => setActiveModal(null)} size="full">
        <CatalogueModal onClose={() => setActiveModal(null)} />
      </Modal>

      {/* ── MODAL: Abonnement ── */}
      <Modal open={activeModal === 'abonnement'} onClose={() => setActiveModal(null)} title="Gérer l'abonnement">
        <div className="space-y-4">
          {/* Free plan */}
          <div className="border-2 border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-black">Essai gratuit</p>
              <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">Plan actuel</span>
            </div>
            <p className="text-sm text-orange-500 font-semibold mb-2">⏱ 3 jours d&apos;essai</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ Toutes les fonctionnalités pendant 3 jours</li>
              <li>✓ Factures et devis illimités</li>
              <li>✓ Clients illimités</li>
              <li>✗ Après 3 jours, abonnement requis</li>
            </ul>
          </div>

          {/* Premium plan */}
          <div className="border-2 border-black rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-black text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Zap size={10} className="text-yellow-300" /> ILLIMITÉ
            </div>
            <p className="font-bold text-black text-lg mb-1">5 000 FCFA<span className="text-sm font-normal text-gray-500"> / mois</span></p>
            <p className="text-xs text-gray-400 mb-3">ou 50 000 FCFA / an (économisez 2 mois)</p>
            <ul className="text-sm text-gray-700 space-y-1 mb-4">
              <li>✓ Factures et devis illimités</li>
              <li>✓ Clients illimités</li>
              <li>✓ Catalogue de prix</li>
              <li>✓ PDF personnalisé avec logo</li>
              <li>✓ Rapports avancés</li>
              <li>✓ Support prioritaire</li>
            </ul>
            <Button fullWidth>Commencer l&apos;essai gratuit</Button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: Support ── */}
      <Modal open={activeModal === 'support'} onClose={() => setActiveModal(null)} title="Contacter le support">
        <div className="space-y-4">
          <div className="bg-green-50 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={28} className="text-white" />
            </div>
            <p className="font-bold text-black mb-1">Support WhatsApp</p>
            <p className="text-sm text-gray-500 mb-1">+221 77 333 95 83</p>
            <p className="text-xs text-gray-400">Réponse rapide en français</p>
          </div>
          <a
            href="https://wa.me/221773339583?text=Bonjour,%20j'ai%20besoin%20d'aide%20avec%20SamaFacture"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button fullWidth className="bg-green-500 hover:bg-green-600">
              <MessageCircle size={18} />
              Ouvrir WhatsApp
            </Button>
          </a>
          <Button fullWidth variant="secondary" onClick={() => setActiveModal(null)}>Fermer</Button>
        </div>
      </Modal>
    </>
  );
}
