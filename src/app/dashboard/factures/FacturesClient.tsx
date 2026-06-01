'use client';

import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatAmount, formatDate } from '@/lib/utils';
import type { Invoice } from '@/types';
import CreateInvoiceForm from './CreateInvoiceForm';
import InvoiceDetail from './InvoiceDetail';

interface Props {
  invoices: Invoice[];
}

export default function FacturesClient({ invoices: initialInvoices }: Props) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleCreated = (doc: Invoice | { id: string }) => {
    const invoice = doc as Invoice;
    setInvoices(prev => [invoice, ...prev]);
    setShowCreate(false);
    setSelectedInvoice(invoice);
  };

  const handleUpdated = (invoice: Invoice) => {
    setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
    setSelectedInvoice(invoice);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-2xl font-bold text-black">Factures</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-sm hover:bg-gray-800"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
            <FileText size={36} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-black mb-2">Commencez par créer une facture</h2>
          <p className="text-gray-400 text-sm mb-8">Soyez professionnel avec vos clients.</p>
          <Button fullWidth onClick={() => setShowCreate(true)}>Créer une facture</Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {invoices.map(invoice => (
              <Card key={invoice.id} className="cursor-pointer active:scale-[0.99] transition-transform" onClick={() => setSelectedInvoice(invoice)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">#{invoice.invoice_number}</span>
                      <Badge status={invoice.status} />
                    </div>
                    <p className="font-semibold text-black truncate">{invoice.client?.name ?? 'Client non défini'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(invoice.issue_date)}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="font-bold text-black">{formatAmount(invoice.total_amount, invoice.currency)}</p>
                    {invoice.paid_amount > 0 && invoice.paid_amount < invoice.total_amount && (
                      <p className="text-xs text-orange-500">Reste: {formatAmount(invoice.total_amount - invoice.paid_amount, invoice.currency)}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Button fullWidth onClick={() => setShowCreate(true)}>Créer une facture</Button>
          </div>
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle facture" size="full">
        <CreateInvoiceForm onCreated={handleCreated} onCancel={() => setShowCreate(false)} type="invoice" />
      </Modal>

      {selectedInvoice && (
        <Modal open={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} size="full">
          <InvoiceDetail invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} onUpdated={handleUpdated} />
        </Modal>
      )}
    </>
  );
}
