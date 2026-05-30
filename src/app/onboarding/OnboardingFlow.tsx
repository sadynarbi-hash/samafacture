'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ArrowLeft, ImagePlus, Building2 } from 'lucide-react';
import Image from 'next/image';

type Step = 'name' | 'info' | 'logo';

export default function OnboardingFlow() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('name');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    logoFile: null as File | null,
    logoPreview: '',
  });

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setData(d => ({
      ...d,
      logoFile: file,
      logoPreview: URL.createObjectURL(file),
    }));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      let logoUrl = '';
      if (data.logoFile) {
        const ext = data.logoFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('logos')
          .upload(path, data.logoFile);
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);
          logoUrl = publicUrl;
        }
      }

      const { error } = await supabase.from('businesses').insert({
        user_id: user.id,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        logo_url: logoUrl || null,
        last_used_at: new Date().toISOString(),
      });

      if (error) throw error;
      router.push('/dashboard/factures');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['name', 'info', 'logo'];
  const stepIndex = steps.indexOf(step);

  return (
    <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start px-6 pt-12">
      <div className="w-full max-w-sm">
        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-8">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${i <= stepIndex ? 'bg-black w-8' : 'bg-gray-200 w-4'}`}
            />
          ))}
        </div>

        {/* Step: Name */}
        {step === 'name' && (
          <div className="space-y-6">
            <div>
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6">
                <Building2 size={26} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-black mb-2">Nom de l&apos;entreprise</h1>
              <p className="text-gray-400 text-sm">Il apparaîtra sur vos factures</p>
            </div>
            <Card>
              <Input
                placeholder="Ex: Mamadou Design"
                value={data.name}
                onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                autoFocus
              />
            </Card>
            <Button
              fullWidth
              disabled={!data.name.trim()}
              onClick={() => setStep('info')}
            >
              Continuer
            </Button>
          </div>
        )}

        {/* Step: Info */}
        {step === 'info' && (
          <div className="space-y-6">
            <div>
              <button onClick={() => setStep('name')} className="mb-4 flex items-center gap-1 text-gray-400 hover:text-black text-sm">
                <ArrowLeft size={16} /> Retour
              </button>
              <h1 className="text-3xl font-bold text-black mb-2">Parlez-nous de votre entreprise</h1>
              <p className="text-gray-400 text-sm">Il apparaîtra sur vos factures</p>
            </div>
            <Card className="space-y-4">
              <Input
                label="E-mail (optionnel)"
                type="email"
                placeholder="contact@monentreprise.com"
                value={data.email}
                onChange={e => setData(d => ({ ...d, email: e.target.value }))}
              />
              <Input
                label="Téléphone (optionnel)"
                type="tel"
                placeholder="+221 77 000 00 00"
                value={data.phone}
                onChange={e => setData(d => ({ ...d, phone: e.target.value }))}
              />
              <Input
                label="Adresse (optionnel)"
                placeholder="Dakar, Sénégal"
                value={data.address}
                onChange={e => setData(d => ({ ...d, address: e.target.value }))}
              />
            </Card>
            <Button fullWidth onClick={() => setStep('logo')}>
              Continuer
            </Button>
          </div>
        )}

        {/* Step: Logo */}
        {step === 'logo' && (
          <div className="space-y-6">
            <div>
              <button onClick={() => setStep('info')} className="mb-4 flex items-center gap-1 text-gray-400 hover:text-black text-sm">
                <ArrowLeft size={16} /> Retour
              </button>
              <h1 className="text-3xl font-bold text-black mb-2">Avez-vous un logo ?</h1>
              <p className="text-gray-400 text-sm">Il apparaîtra sur vos factures</p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square max-h-48 border-2 border-dashed border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center gap-3 hover:border-black hover:bg-gray-50 transition-all"
            >
              {data.logoPreview ? (
                <Image src={data.logoPreview} alt="Logo" width={120} height={120} className="object-contain rounded-xl max-h-40" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <ImagePlus size={22} className="text-gray-400" />
                  </div>
                  <span className="text-gray-500 text-sm font-medium">Ajouter un logo</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoSelect}
            />

            <Button fullWidth loading={loading} onClick={handleFinish}>
              Terminer
            </Button>
            <button
              onClick={handleFinish}
              className="w-full text-center text-gray-400 text-sm py-2 hover:text-gray-600"
            >
              Passer cette étape
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
