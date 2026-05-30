import { cn } from '@/lib/utils';
import type { InvoiceStatus } from '@/types';

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Envoyée', className: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Payée', className: 'bg-green-100 text-green-700' },
  partial: { label: 'Partiel', className: 'bg-orange-100 text-orange-700' },
  accepted: { label: 'Accepté', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Refusé', className: 'bg-red-100 text-red-700' },
};

export default function Badge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', config.className)}>
      {config.label}
    </span>
  );
}
