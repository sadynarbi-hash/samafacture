'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/lib/store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Search, UserPlus } from 'lucide-react';
import type { Client } from '@/types';

interface Props {
  onSelect: (client: Client) => void;
  onClose: () => void;
}

export default function SelectClientModal({ onSelect, onClose }: Props) {
  const supabase = createClient();
  const { currentBusiness } = useApp();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;
    supabase
      .from('clients')
      .select('*')
      .eq('business_id', currentBusiness.id)
      .order('name')
      .then(({ data }) => setClients((data as Client[]) ?? []));
  }, [currentBusiness]);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateAndSelect = async () => {
    if (!currentBusiness || !newName.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .insert({
        business_id: currentBusiness.id,
        name: newName.trim(),
        email: newEmail || null,
        phone: newPhone || null,
        outstanding_amount: 0,
      })
      .select()
      .single();
    setLoading(false);
    if (!error && data) onSelect(data as Client);
  };

  if (showNew) {
    return (
      <div className="space-y-4">
        <button onClick={() => setShowNew(false)} className="text-sm text-gray-400 hover:text-black flex items-center gap-1">
          ← Retour
        </button>
        <Input label="Nom *" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom du client" autoFocus />
        <Input label="Email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@client.com" />
        <Input label="Téléphone" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+221 77 000 00 00" />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowNew(false)} className="flex-1">Annuler</Button>
          <Button onClick={handleCreateAndSelect} loading={loading} disabled={!newName.trim()} className="flex-1">Créer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          autoFocus
        />
      </div>

      {filtered.length > 0 ? (
        <div className="max-h-60 overflow-y-auto space-y-1">
          {filtered.map(client => (
            <button
              key={client.id}
              onClick={() => onSelect(client)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
            >
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold">{client.name[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-sm">{client.name}</p>
                {client.email && <p className="text-xs text-gray-400">{client.email}</p>}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm py-4">
          {search ? 'Aucun client trouvé' : 'Aucun client enregistré'}
        </p>
      )}

      <button
        onClick={() => setShowNew(true)}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-black hover:text-black transition-colors"
      >
        <UserPlus size={16} />
        Nouveau client
      </button>
    </div>
  );
}
