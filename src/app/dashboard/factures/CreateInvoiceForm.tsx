'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/lib/store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { Plus, Trash2, User, Package, ChevronDown } from 'lucide-react';
import { todayISO } from '@/lib/utils';
import type { Invoice, Client, InvoiceItem, Quote } from '@/types';
import AddItemForm from './AddItemForm';
import SelectClientModal from '@/app/dashboard/clients/SelectClientModal';

const CURRENCIES = ['FCFA', 'EUR', 'USD', 'XOF', 'MAD', 'DZD', 'TND'];

interface Props {
  onCreated: (doc: Invoice | Quote) => void;
  onCancel: () => void;
  type: 'invoice' | 'quote';
}

export default function CreateInvoiceForm({ onCreated, onCancel, type }: Props) {
  const supabase = createClient();
  const { currentBusiness } = useApp();
  const [loading, setLoading] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showSelectClient, setShowSelectClient] = useState(false);

  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [currency, setCurrency] = useState('FCFA');
  const [notes, setNotes] = useState('');
  const [docNumber, setDocNumber] = useState('');

  const isInvoice = type === 'invoice';

  useEffect(() => {
    if (!currentBusiness) return;
    const fetchNumber = async () => {
      if (isInvoice) {
        const { data } = await supabase
          .from('businesses')
          .select('invoice_count')
          .eq('id', currentBusiness.id)
          .single();
        const count = (data?.invoice_count ?? 0) + 1;
        setDocNumber(String(count).padStart(3, '0'));
      } else {
        const { data } = await supabase
          .from('businesses')
          .select('quote_count')
          .eq('id', currentBusiness.id)
          .single();
        const count = (data?.quote_count ?? 0) + 1;
        setDocNumber(`DEV${count}`);
      }
    };
    fetchNumber();
  }, [currentBusiness, isInvoice]);

  const totalAmount = items.reduce((sum, item) => {
    const subtotal = item.unit_price * item.quantity;
    const discount = subtotal * (item.discount / 100);
    return sum + subtotal - discount;
  }, 0);

  const handleItemAdded = (item: InvoiceItem) => {
    setItems(prev => [...prev, item]);
    setShowAddItem(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSubmit = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      const table = isInvoice ? 'invoices' : 'quotes';
      const numberField = isInvoice ? 'invoice_number' : 'quote_number';
      const countField = isInvoice ? 'invoice_count' : 'quote_count';

      const payload: Record<string, unknown> = {
        business_id: currentBusiness.id,
        client_id: client?.id ?? null,
        [numberField]: docNumber,
        issue_date: issueDate,
        due_date: dueDate || null,
        status: 'draft',
        items,
        currency,
        notes: notes || null,
        total_amount: totalAmount,
        photo_urls: [],
      };

      if (isInvoice) {
        payload.paid_amount = 0;
        payload.payments = [];
      }

      const { data, error } = await supabase.from(table).insert(payload).select('*, client:clients(*)').single();
      if (error) throw error;

      await supabase.rpc('increment_count', {
        business_id: currentBusiness.id,
        field: countField,
      });

      onCreated(data as Invoice);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Date & Number */}
      <Card>
        <div className="space-y-3">
          <div className="flex gap-3">
            <Input
              label="Date d'émission"
              type="date"
              value={issueDate}
              onChange={e => setIssueDate(e.target.value)}
            />
            <Input
              label="N° document"
              value={docNumber}
              onChange={e => setDocNumber(e.target.value)}
            />
          </div>
          <Input
            label="Date d'échéance (optionnel)"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
      </Card>

      {/* Client */}
      <Card padding="none">
        <button
          onClick={() => setShowSelectClient(true)}
          className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 rounded-2xl transition-colors"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${client ? 'bg-black' : 'bg-gray-100'}`}>
            {client ? (
              <span className="text-base font-bold text-white">{client.name[0]}</span>
            ) : (
              <User size={18} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1 text-left">
            {client ? (
              <>
                <p className="font-semibold text-black">{client.name}</p>
                {client.email && <p className="text-xs text-gray-400">{client.email}</p>}
              </>
            ) : (
              <p className="text-black font-semibold">Ajouter un client</p>
            )}
          </div>
          <ChevronDown size={18} className="text-gray-300" />
        </button>
      </Card>

      {/* Articles */}
      <Card>
        <h3 className="font-semibold text-black mb-3">Articles</h3>
        {items.length > 0 && (
          <div className="space-y-2 mb-3">
            {items.map((item, idx) => (
              <div key={item.id || idx} className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.quantity} × {item.unit_price.toLocaleString('fr-FR')} {currency}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold">
                    {(item.unit_price * item.quantity * (1 - item.discount / 100)).toLocaleString('fr-FR')}
                  </span>
                  <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowAddItem(true)}
          className="w-full flex items-center gap-2 text-black font-medium py-2 hover:opacity-70 transition-opacity"
        >
          <Plus size={18} />
          Ajouter un article
        </button>
      </Card>

      {/* Total */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-black">Devise</span>
          <div className="relative">
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="appearance-none bg-gray-100 rounded-lg px-3 py-1.5 text-sm font-semibold pr-7 focus:outline-none"
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <span className="text-lg font-bold text-black">Total</span>
          <span className="text-2xl font-bold text-black">
            {totalAmount.toLocaleString('fr-FR')} {currency}
          </span>
        </div>
      </Card>

      {/* Notes */}
      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optionnel)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Conditions de paiement, informations supplémentaires..."
          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-black resize-none focus:outline-none focus:ring-2 focus:ring-black"
          rows={3}
        />
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {isInvoice ? 'Créer la facture' : 'Créer le devis'}
        </Button>
      </div>

      {/* Add item modal */}
      <Modal open={showAddItem} onClose={() => setShowAddItem(false)} title="Ajouter un article">
        <AddItemForm onSave={handleItemAdded} onCancel={() => setShowAddItem(false)} />
      </Modal>

      {/* Select client modal */}
      <Modal open={showSelectClient} onClose={() => setShowSelectClient(false)} title="Choisir un client">
        <SelectClientModal
          onSelect={(c: Client) => { setClient(c); setShowSelectClient(false); }}
          onClose={() => setShowSelectClient(false)}
        />
      </Modal>
    </div>
  );
}
