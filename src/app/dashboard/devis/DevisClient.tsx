'use client';

import { useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatAmount, formatDate } from '@/lib/utils';
import type { Quote, Invoice } from '@/types';
import CreateInvoiceForm from '../factures/CreateInvoiceForm';

interface Props {
  quotes: Quote[];
}

export default function DevisClient({ quotes: initial }: Props) {
  const [quotes, setQuotes] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);

  const handleCreated = (doc: Invoice | Quote) => {
    setQuotes(prev => [doc as Quote, ...prev]);
    setShowCreate(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-2xl font-bold text-black">Devis</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-sm hover:bg-gray-800"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
            <ClipboardList size={36} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-black mb-2">Créez votre premier devis</h2>
          <p className="text-gray-400 text-sm mb-8">Envoyez des estimations à vos clients avant de facturer.</p>
          <Button fullWidth onClick={() => setShowCreate(true)}>
            Créer un devis
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {quotes.map(quote => (
              <Card key={quote.id} className="cursor-pointer active:scale-[0.99] transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">#{quote.quote_number}</span>
                      <Badge status={quote.status} />
                    </div>
                    <p className="font-semibold text-black truncate">
                      {quote.client?.name ?? 'Client non défini'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(quote.issue_date)}</p>
                  </div>
                  <p className="font-bold text-black ml-4">{formatAmount(quote.total_amount, quote.currency)}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Button fullWidth onClick={() => setShowCreate(true)}>Créer un devis</Button>
          </div>
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau devis" size="full">
        <CreateInvoiceForm
          onCreated={handleCreated}
          onCancel={() => setShowCreate(false)}
          type="quote"
        />
      </Modal>
    </>
  );
}
