# SamaFacture — Guide de configuration

## Stack technique
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + TypeScript
- **Backend**: Supabase (Auth, Database PostgreSQL, Storage)
- **Graphiques**: Recharts
- **Icônes**: Lucide React

## Configuration Supabase

### 1. Créer un projet sur supabase.com

### 2. Exécuter le schéma SQL
Dans Supabase Dashboard → SQL Editor, coller et exécuter le contenu de `supabase/schema.sql`

### 3. Configurer l'authentification
Dans Supabase Dashboard → Authentication → Providers :
- Activer **Google** (Client ID + Secret depuis Google Cloud Console)
- Activer **Apple** (nécessite un compte Apple Developer)
- **Email (Magic Link)** est activé par défaut

Ajouter les URLs de redirection :
- `http://localhost:3000/auth/callback` (développement)
- `https://votre-domaine.com/auth/callback` (production)

### 4. Variables d'environnement
Copier `.env.local` et remplir :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
ADMIN_EMAIL=votre@email.com
```

Ces valeurs se trouvent dans Supabase Dashboard → Settings → API

### 5. Lancer en développement
```bash
npm run dev
```

L'application est disponible sur http://localhost:3000

## Structure des pages
| Route | Description |
|-------|-------------|
| `/auth` | Inscription / Connexion |
| `/onboarding` | Création d'entreprise (1ère utilisation) |
| `/dashboard/factures` | Liste et création de factures |
| `/dashboard/devis` | Liste et création de devis |
| `/dashboard/clients` | Gestion des clients |
| `/dashboard/rapports` | Revenus et statistiques |
| `/dashboard/parametres` | Paramètres et compte |
| `/admin` | Tableau de bord administrateur |

## Déploiement (Vercel)
```bash
vercel deploy
```
Ajouter les variables d'environnement dans Vercel Dashboard.
