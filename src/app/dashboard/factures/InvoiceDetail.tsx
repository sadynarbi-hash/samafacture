'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/lib/store';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { formatAmount, formatDate } from '@/lib/utils';
import { generateInvoicePDF } from '@/lib/generatePDF';
import type { Invoice } from '@/types';
import { Share2, Printer, Pencil, CheckCircle, CreditCard, X } from 'lucide-react';

interface Props {
  invoice: Invoice;
  onClose: () => void;
  onUpdated: (invoice: Invoice) => void;
}

export default function InvoiceDetail({ invoice, onClose, onUpdated }: Props) {
  const supabase = createClient();
  const { currentBusiness } = useApp();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const remaining = invoice.total_amount - invoice.paid_amount;

  const handleMarkPaid = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_amount: invoice.total_amount })
      .eq('id', invoice.id)
      .select('*, client:clients(*)')
      .single();
    setLoading(false);
    if (!error && data) onUpdated(data as Invoice);
  };

  const handleAddPayment = async () => {
    const amount = Number(paymentAmount);
    if (!amount) return;
    setLoading(true);

    const newPayments = [
      ...(invoice.payments ?? []),
      { id: crypto.randomUUID(), amount, date: new Date().toISOString(), note: [paymentMethod, paymentNote].filter(Boolean).join(' — ') || undefined },
    ];
    const newPaid = Math.min(invoice.total_amount, (invoice.paid_amount ?? 0) + amount);
    const newStatus = newPaid >= invoice.total_amount ? 'paid' : 'partial';

    const { data, error } = await supabase
      .from('invoices')
      .update({ payments: newPayments, paid_amount: newPaid, status: newStatus })
      .eq('id', invoice.id)
      .select('*, client:clients(*)')
      .single();

    setLoading(false);
    if (!error && data) {
      onUpdated(data as Invoice);
      setShowPayment(false);
      setPaymentAmount('');
      setPaymentNote('');
      setPaymentMethod('');
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const blob = await generateInvoicePDF(invoice, currentBusiness?.name ?? 'Mon entreprise');
      const fileName = `Facture-${invoice.invoice_number}-${invoice.client?.name ?? 'client'}.pdf`;
      const file = new File([blob], fileName, { type: 'application/pdf' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: fileName });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(false);
    }
  };

  const handlePrint = async () => {
    const blob = await generateInvoicePDF(invoice, currentBusiness?.name ?? 'Mon entreprise');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-gray-400">#{invoice.invoice_number}</span>
            <Badge status={invoice.status} />
          </div>
          <h2 className="text-2xl font-bold text-black">
            {invoice.client?.name ?? 'Client non défini'}
          </h2>
          <p className="text-gray-400 text-sm">{formatDate(invoice.issue_date)}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <X size={20} />
        </button>
      </div>

      {/* Amount */}
      <Card className="text-center py-8">
        <p className="text-4xl font-bold text-black mb-2">{formatAmount(invoice.total_amount, invoice.currency)}</p>
        {invoice.paid_amount > 0 && invoice.paid_amount < invoice.total_amount && (
          <p className="text-orange-500 font-medium">
            Reste à payer: {formatAmount(remaining, invoice.currency)}
          </p>
        )}
        {invoice.status === 'paid' && (
          <p className="text-green-600 font-semibold flex items-center justify-center gap-1.5 mt-1">
            <CheckCircle size={16} /> Payée intégralement
          </p>
        )}
      </Card>

      {/* Payment actions */}
      {invoice.status !== 'paid' && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleMarkPaid}
            loading={loading}
          >
            <CheckCircle size={16} />
            Marquer payé
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowPayment(true)}
          >
            <CreditCard size={16} />
            Paiement reçu
          </Button>
        </div>
      )}

      {/* Items */}
      <Card>
        <h3 className="font-semibold text-black mb-3">Articles</h3>
        <div className="space-y-2">
          {(invoice.items ?? []).map((item, i) => (
            <div key={i} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                {item.details && <p className="text-xs text-gray-400">{item.details}</p>}
                <p className="text-xs text-gray-400">{item.quantity} × {item.unit_price.toLocaleString('fr-FR')} {invoice.currency}</p>
              </div>
              <p className="font-semibold text-sm">
                {(item.unit_price * item.quantity * (1 - item.discount / 100)).toLocaleString('fr-FR')}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Payments history */}
      {(invoice.payments ?? []).length > 0 && (
        <Card>
          <h3 className="font-semibold text-black mb-3">Paiements reçus</h3>
          {invoice.payments.map((p, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium">{formatDate(p.date)}</p>
                {p.note && <p className="text-xs text-gray-400">{p.note}</p>}
              </div>
              <p className="font-semibold text-green-600">{formatAmount(p.amount, invoice.currency)}</p>
            </div>
          ))}
        </Card>
      )}

      {/* Client info */}
      {invoice.client && (
        <Card>
          <h3 className="font-semibold text-black mb-2">Client</h3>
          <p className="font-medium">{invoice.client.name}</p>
          {invoice.client.email && <p className="text-sm text-gray-400">{invoice.client.email}</p>}
          {invoice.client.phone && <p className="text-sm text-gray-400">{invoice.client.phone}</p>}
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 flex flex-col items-center gap-1 py-3 bg-white rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm disabled:opacity-50"
        >
          {sharing ? (
            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Share2 size={18} />
          )}
          Partager
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 flex flex-col items-center gap-1 py-3 bg-white rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm"
        >
          <Printer size={18} />
          Imprimer
        </button>
        <button
          className="flex-1 flex flex-col items-center gap-1 py-3 bg-white rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm"
        >
          <Pencil size={18} />
          Modifier
        </button>
      </div>

      <Button fullWidth>
        Envoyer la facture
      </Button>

      {/* Payment modal */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="Paiement reçu">
        <div className="space-y-4">
          <Input
            label="Montant reçu"
            type="number"
            placeholder={`Max: ${remaining.toLocaleString('fr-FR')} ${invoice.currency}`}
            value={paymentAmount}
            onChange={e => setPaymentAmount(e.target.value)}
          />

          {/* Payment method */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Moyen de paiement</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  key: 'Wave',
                  label: 'Wave',
                  color: 'bg-blue-500',
                  logo: (
                    <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                      <circle cx="20" cy="20" r="20" fill="#1B87E6"/>
                      <path d="M10 20 Q15 12 20 20 Q25 28 30 20" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    </svg>
                  ),
                },
                {
                  key: 'Orange Money',
                  label: 'Orange Money',
                  color: 'bg-orange-500',
                  logo: (
                    <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                      <circle cx="20" cy="20" r="20" fill="#FF6600"/>
                      <circle cx="20" cy="20" r="10" fill="white"/>
                      <circle cx="20" cy="20" r="5" fill="#FF6600"/>
                    </svg>
                  ),
                },
                {
                  key: 'Espèces',
                  label: 'Espèces',
                  color: 'bg-green-600',
                  logo: (
                    <span className="text-xl">💵</span>
                  ),
                },
              ].map(({ key, label, logo }) => (
                <button
                  key={key}
                  onClick={() => setPaymentMethod(paymentMethod === key ? '' : key)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${
                    paymentMethod === key
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {logo}
                  <span className="text-xs font-semibold leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Note (optionnel)"
            placeholder="Référence, commentaire..."
            value={paymentNote}
            onChange={e => setPaymentNote(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowPayment(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleAddPayment}
              loading={loading}
              disabled={!paymentAmount}
              className="flex-1"
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
