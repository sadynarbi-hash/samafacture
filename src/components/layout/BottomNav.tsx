'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, ClipboardList, Users, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/dashboard/factures', label: 'Factures', icon: FileText },
  { href: '/dashboard/devis', label: 'Devis', icon: ClipboardList },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/rapports', label: 'Rapports', icon: BarChart3 },
  { href: '/dashboard/parametres', label: 'Paramètres', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all',
                active ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={cn('text-[10px] font-medium', active && 'font-bold')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
