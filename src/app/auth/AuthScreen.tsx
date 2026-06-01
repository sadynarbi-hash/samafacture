'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { FileText, Phone, Mail } from 'lucide-react';

type Step = 'main' | 'phone' | 'email';
type PhoneStep = 'number' | 'pin' | 'newpin' | 'confirmpin';

function formatPhone(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 12);
}

function phoneToEmail(phone: string): string {
  return `tel_${phone}@samafacture.app`;
}

export default function AuthScreen() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>('main');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('number');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Email fallback
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');

  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // ── PHONE FLOW ──
  const handlePhoneNext = async () => {
    const cleaned = formatPhone(phone);
    if (cleaned.length < 8) { setError('Numéro invalide'); return; }
    setError('');
    setLoading(true);

    const fakeEmail = phoneToEmail(cleaned);
    const { error: signUpError } = await supabase.auth.signUp({
      email: fakeEmail,
      password: `TEMP_${crypto.randomUUID()}`,
      options: { data: { phone: cleaned, pin_set: false } },
    });

    setLoading(false);
    if (!signUpError) {
      // New user just created + auto-signed in; next step is to set their PIN
      setPhoneStep('newpin');
    } else if (signUpError.message === 'User already registered') {
      // Existing user → ask for their PIN
      setPhoneStep('pin');
    } else {
      setError(signUpError.message);
    }
  };

  const handleSignInWithPin = async () => {
    if (pin.length !== 4) return;
    const cleaned = formatPhone(phone);
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(cleaned),
      password: `PIN_${pin}_${cleaned}`,
    });
    setLoading(false);
    if (error) {
      setError('Code PIN incorrect');
      setPin('');
      pinRefs[0].current?.focus();
    } else {
      router.push('/dashboard/factures');
      router.refresh();
    }
  };

  const handleCreateAccount = async () => {
    if (newPin.length !== 4) return;
    if (newPin !== confirmPin) { setError('Les codes ne correspondent pas'); return; }
    const cleaned = formatPhone(phone);
    setLoading(true);
    setError('');
    // User was already created (and signed in) in handlePhoneNext — just update their password
    const { error } = await supabase.auth.updateUser({
      password: `PIN_${newPin}_${cleaned}`,
      data: { pin_set: true },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/onboarding');
      router.refresh();
    }
  };

  const handlePinInput = (val: string, idx: number, current: string[], setter: (v: string) => void, nextStep?: () => void) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const arr = [...current];
    arr[idx] = digit;
    const newVal = arr.join('');
    setter(newVal);
    if (digit && idx < 3) pinRefs[idx + 1].current?.focus();
    if (newVal.length === 4 && nextStep) setTimeout(nextStep, 100);
  };

  // ── EMAIL FLOW ──
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError('');
    if (emailMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      await supabase.auth.signInWithPassword({ email, password });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error.message);
        setLoading(false); return;
      }
    }
    router.push('/dashboard/factures'); router.refresh();
  };

  // ────────────────────────────────────────────────────
  // PHONE SCREENS
  // ────────────────────────────────────────────────────
  if (step === 'phone') {
    // PIN input component
    const PinInput = ({ value, onChange, onComplete }: { value: string; onChange: (v: string) => void; onComplete?: () => void }) => (
      <div className="flex gap-3 justify-center">
        {[0,1,2,3].map(i => (
          <input
            key={i}
            ref={pinRefs[i]}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={value[i] ?? ''}
            onChange={e => handlePinInput(e.target.value, i, value.split(''), onChange, onComplete)}
            onKeyDown={e => { if (e.key === 'Backspace' && !value[i] && i > 0) pinRefs[i-1].current?.focus(); }}
            className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-2xl focus:border-black focus:outline-none bg-white transition-colors"
          />
        ))}
      </div>
    );

    return (
      <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <button onClick={() => { setStep('main'); setPhoneStep('number'); setPin(''); setNewPin(''); setConfirmPin(''); setError(''); }}
            className="text-gray-400 text-sm hover:text-black mb-8 flex items-center gap-1">
            ← Retour
          </button>

          {/* STEP: Phone number */}
          {phoneStep === 'number' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-5">
                <Phone size={22} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Votre numéro</h2>
              <p className="text-gray-400 text-sm mb-6">Entrez votre numéro de téléphone</p>
              <div className="flex gap-2 mb-4">
                <div className="bg-gray-100 rounded-xl px-3 py-3 text-sm font-semibold text-gray-600 shrink-0">🇸🇳 +221</div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="77 000 00 00"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError(''); }}
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <Button fullWidth loading={loading} disabled={formatPhone(phone).length < 8} onClick={handlePhoneNext}>
                Continuer
              </Button>
            </div>
          )}

          {/* STEP: Enter PIN (existing user) */}
          {phoneStep === 'pin' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-5 text-white font-bold text-lg">
                {formatPhone(phone).slice(-2)}
              </div>
              <h2 className="text-2xl font-bold mb-1">Votre code PIN</h2>
              <p className="text-gray-400 text-sm mb-8">Entrez votre code à 4 chiffres</p>
              <PinInput value={pin} onChange={setPin} onComplete={handleSignInWithPin} />
              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              <Button fullWidth loading={loading} disabled={pin.length !== 4} onClick={handleSignInWithPin} className="mt-6">
                Se connecter
              </Button>
              <button onClick={() => { setPhoneStep('number'); setPin(''); setError(''); }}
                className="text-gray-400 text-sm mt-4 hover:text-black">
                Changer de numéro
              </button>
            </div>
          )}

          {/* STEP: Create PIN (new user) */}
          {phoneStep === 'newpin' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
              <h2 className="text-2xl font-bold mb-1">Créez votre PIN</h2>
              <p className="text-gray-400 text-sm mb-8">Choisissez un code à 4 chiffres facile à retenir</p>
              <PinInput value={newPin} onChange={setNewPin} onComplete={() => { if (newPin.length === 4) setPhoneStep('confirmpin'); }} />
              <Button fullWidth disabled={newPin.length !== 4} onClick={() => setPhoneStep('confirmpin')} className="mt-6">
                Continuer
              </Button>
            </div>
          )}

          {/* STEP: Confirm PIN */}
          {phoneStep === 'confirmpin' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
              <h2 className="text-2xl font-bold mb-1">Confirmez votre PIN</h2>
              <p className="text-gray-400 text-sm mb-8">Entrez à nouveau votre code à 4 chiffres</p>
              <PinInput value={confirmPin} onChange={setConfirmPin} onComplete={handleCreateAccount} />
              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              <Button fullWidth loading={loading} disabled={confirmPin.length !== 4} onClick={handleCreateAccount} className="mt-6">
                Créer mon compte
              </Button>
              <button onClick={() => { setPhoneStep('newpin'); setConfirmPin(''); setError(''); }}
                className="text-gray-400 text-sm mt-4 hover:text-black">
                Recommencer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────
  // EMAIL SCREEN
  // ────────────────────────────────────────────────────
  if (step === 'email') {
    return (
      <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <button onClick={() => { setStep('main'); setError(''); }} className="text-gray-400 text-sm mb-8 flex items-center gap-1 hover:text-black">
            ← Retour
          </button>
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-1">{emailMode === 'signin' ? 'Se connecter' : 'Créer un compte'}</h2>
            <p className="text-gray-400 text-sm mb-6">avec votre adresse email</p>
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <input type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" />
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" fullWidth loading={loading} disabled={!email || !password}>
                {emailMode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
              </Button>
            </form>
            <button onClick={() => { setEmailMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); }}
              className="w-full text-center text-gray-400 text-sm mt-4 hover:text-black">
              {emailMode === 'signin' ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────
  // MAIN SCREEN
  // ────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black leading-tight mb-3">
            Sauvegardez vos factures avec un compte
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            En plus de soucis si vous changez ou perdez votre téléphone !
          </p>
        </div>

        <div className="space-y-3">
          {/* PRIMARY: Phone */}
          <button
            onClick={() => { setStep('phone'); setPhoneStep('number'); }}
            className="w-full bg-black text-white rounded-full py-4 px-6 flex items-center justify-center gap-3 font-semibold hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Phone size={20} />
            Continuer avec mon numéro
          </button>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-white border border-gray-200 rounded-full py-3.5 px-6 flex items-center justify-center gap-3 font-semibold text-black hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Email link */}
          <button
            onClick={() => setStep('email')}
            className="w-full text-center text-gray-400 text-sm py-2 hover:text-gray-600 flex items-center justify-center gap-2"
          >
            <Mail size={14} />
            Continuer avec Email
          </button>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8 leading-relaxed">
          En continuant, vous acceptez nos{' '}
          <span className="underline cursor-pointer">Conditions d&apos;utilisation</span>.
        </p>
      </div>
    </div>
  );
}
