'use client';

import { useState } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { createClient as createSupabase } from '@/lib/supabase/client';
import { formatAmount } from '@/lib/utils';
import type { Client } from '@/types';

interface Props {
  clients: Client[];
  businessId?: string;
}

export default function ClientsClient({ clients: initial, businessId }: Props) {
  const supabase = createSupabase();
  const [clients, setClients] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) || false
  );

  const handleAdd = async () => {
    if (!businessId || !form.name.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .insert({
        business_id: businessId,
        name: form.name.trim(),
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        outstanding_amount: 0,
      })
      .select()
      .single();

    setLoading(false);
    if (!error && data) {
      setClients(prev => [...prev, data as Client].sort((a, b) => a.name.localeCompare(b.name)));
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '', address: '' });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 pt-2">
        <h1 className="text-2xl font-bold text-black">Clients</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      )}

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
            <Users size={36} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-black mb-2">Ajoutez vos clients</h2>
          <p className="text-gray-400 text-sm mb-8">Retrouvez facilement vos clients et leurs factures.</p>
          <Button fullWidth onClick={() => setShowAdd(true)}>
            Ajouter un client
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {filtered.map(client => (
              <Card key={client.id} className="flex items-center gap-3">
                <div className="w-11 h-11 bg-black rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-lg">{client.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black truncate">{client.name}</p>
                  {client.email && <p className="text-xs text-gray-400 truncate">{client.email}</p>}
                  {client.phone && <p className="text-xs text-gray-400">{client.phone}</p>}
                </div>
                {client.outstanding_amount > 0 && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">Doit</p>
                    <p className="font-semibold text-orange-500 text-sm">
                      {formatAmount(client.outstanding_amount)}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Button fullWidth onClick={() => setShowAdd(true)}>
              Ajouter un client
            </Button>
          </div>
        </>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nouveau client">
        <div className="space-y-4">
          <Input
            label="Nom *"
            placeholder="Nom du client"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            autoFocus
          />
          <Input
            label="Email (optionnel)"
            type="email"
            placeholder="client@email.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Téléphone (optionnel)"
            type="tel"
            placeholder="+221 77 000 00 00"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
          <Input
            label="Adresse (optionnel)"
            placeholder="Adresse du client"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAdd(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleAdd}
              loading={loading}
              disabled={!form.name.trim()}
              className="flex-1"
            >
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
