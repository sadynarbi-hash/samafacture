'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FileText } from 'lucide-react';

type Step = 'main' | 'email';
type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('main');
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleApple = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // After signup, sign in directly
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect'
          : error.message
        );
        setLoading(false);
        return;
      }
    }

    router.push('/dashboard/factures');
    router.refresh();
  };

  if (step === 'email') {
    return (
      <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setStep('main'); setError(''); }}
            className="text-gray-500 text-sm mb-8 flex items-center gap-1 hover:text-black"
          >
            ← Retour
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-1">
              {mode === 'signin' ? 'Se connecter' : 'Créer un compte'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">avec votre adresse email</p>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                label="Adresse email"
                required
                autoFocus
              />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                label="Mot de passe"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" fullWidth loading={loading} disabled={!email || !password}>
                {mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
              </Button>
            </form>

            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
              className="w-full text-center text-gray-400 text-sm mt-4 hover:text-black transition-colors"
            >
              {mode === 'signin'
                ? "Pas encore de compte ? S'inscrire"
                : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
    );
  }

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

          <button
            onClick={handleApple}
            disabled={loading}
            className="w-full bg-white border border-gray-200 rounded-full py-3.5 px-6 flex items-center justify-center gap-3 font-semibold text-black hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.43c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.55-1.3 3.08-2.53 3.96zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continuer avec Apple
          </button>

          <button
            onClick={() => { setStep('email'); setMode('signin'); }}
            className="w-full text-center text-gray-400 text-sm py-3 hover:text-gray-600 transition-colors"
          >
            Continuer avec Email
          </button>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8 leading-relaxed">
          En continuant, vous acceptez nos{' '}
          <span className="underline cursor-pointer">Conditions d&apos;utilisation</span> et notre{' '}
          <span className="underline cursor-pointer">Politique de confidentialité</span>.
        </p>
      </div>
    </div>
  );
}
