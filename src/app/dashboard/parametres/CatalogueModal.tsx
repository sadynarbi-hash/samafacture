'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/lib/store';
import { Search, X, Plus, Trash2, Wrench, Package, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CatalogItem } from '@/types';

type Tab = 'all' | 'service' | 'material' | 'other';
type View = 'list' | 'new';

interface Props {
  onClose: () => void;
}

export default function CatalogueModal({ onClose }: Props) {
  const supabase = createClient();
  const { currentBusiness } = useApp();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [view, setView] = useState<View>('list');
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // New item form
  const [form, setForm] = useState({
    type: 'service' as 'service' | 'material' | 'other',
    name: '',
    unit_price: '',
    unit_type: '',
    taxable: false,
  });

  useEffect(() => {
    if (!currentBusiness) return;
    supabase
      .from('catalog_items')
      .select('*')
      .eq('business_id', currentBusiness.id)
      .order('name')
      .then(({ data }) => setItems((data as CatalogItem[]) ?? []));
  }, [currentBusiness]);

  const filtered = items.filter(item => {
    const matchTab = tab === 'all' || item.type === tab;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleSave = async () => {
    if (!currentBusiness || !form.name.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('catalog_items')
      .insert({
        business_id: currentBusiness.id,
        type: form.type,
        name: form.name.trim(),
        unit_price: Number(form.unit_price) || 0,
        unit_type: form.unit_type || null,
        taxable: form.taxable,
      })
      .select()
      .single();
    setLoading(false);
    if (!error && data) {
      setItems(prev => [...prev, data as CatalogItem].sort((a, b) => a.name.localeCompare(b.name)));
      setView('list');
      setForm({ type: 'service', name: '', unit_price: '', unit_type: '', taxable: false });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('catalog_items').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const typeIcon = (t: string) => t === 'service' ? <Wrench size={14} /> : t === 'material' ? <Package size={14} /> : <MoreHorizontal size={14} />;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'service', label: 'Services' },
    { key: 'material', label: 'Matériels' },
    { key: 'other', label: 'Autres' },
  ];

  const typeOptions: { key: 'service' | 'material' | 'other'; label: string }[] = [
    { key: 'service', label: 'Service' },
    { key: 'material', label: 'Matériel' },
    { key: 'other', label: 'Autre' },
  ];

  // ── NEW ITEM VIEW ──
  if (view === 'new') {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setView('list')} className="text-sm text-gray-500 font-medium hover:text-black">Annuler</button>
          <h2 className="text-xl font-bold text-black">Nouvel article</h2>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || loading}
            className="text-sm font-semibold text-black disabled:text-gray-300"
          >
            {loading ? '...' : 'Terminé'}
          </button>
        </div>

        {/* Type selector */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-6">
          {typeOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setForm(f => ({ ...f, type: key }))}
              className={cn(
                'flex-1 py-2 rounded-full text-sm font-semibold transition-all',
                form.type === key ? 'bg-white text-black shadow-sm' : 'text-gray-500'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-4 flex-1">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <input
              type="text"
              placeholder="Nom"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-4 text-base text-black placeholder-gray-300 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex">
            <div className="flex-1 border-r border-gray-100">
              <p className="text-xs text-gray-400 px-4 pt-3">Prix unitaire</p>
              <div className="flex items-center px-4 pb-3">
                <span className="text-sm font-semibold text-gray-400 mr-2">FCFA</span>
                <input
                  type="number"
                  placeholder="0"
                  value={form.unit_price}
                  onChange={e => setForm(f => ({ ...f, unit_price: e.target.value }))}
                  className="flex-1 text-base text-black focus:outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="w-32">
              <p className="text-xs text-gray-400 px-4 pt-3">Type d&apos;unité</p>
              <input
                type="text"
                placeholder="Optionnel"
                value={form.unit_type}
                onChange={e => setForm(f => ({ ...f, unit_type: e.target.value }))}
                className="w-full px-4 pb-3 text-base text-black placeholder-gray-300 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Taxable toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-4 flex items-center justify-between">
            <span className="text-base font-medium text-black">Taxable ?</span>
            <button
              onClick={() => setForm(f => ({ ...f, taxable: !f.taxable }))}
              className={cn(
                'relative w-14 h-8 rounded-full transition-colors',
                form.taxable ? 'bg-black' : 'bg-gray-200'
              )}
            >
              <div className={cn(
                'absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform',
                form.taxable ? 'translate-x-7' : 'translate-x-1'
              )} />
            </button>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!form.name.trim() || loading}
          className="w-full bg-black text-white rounded-full py-4 text-base font-semibold mt-6 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
        >
          Enregistrer
        </button>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
          <X size={18} className="text-black" />
        </button>
        <h2 className="text-2xl font-bold text-black">Catalogue</h2>
        <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
          <Search size={18} className="text-black" />
        </button>
      </div>

      {/* Search */}
      {items.length > 3 && (
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-full p-1 mb-4">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 py-1.5 rounded-full text-sm font-semibold transition-all',
              tab === key ? 'bg-white text-black shadow-sm' : 'text-gray-500'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              {search ? 'Aucun article trouvé' : 'Aucun article dans le catalogue'}
            </p>
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-gray-100">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 text-gray-500">
                {typeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-black truncate">{item.name}</p>
                {item.unit_type && <p className="text-xs text-gray-400">par {item.unit_type}</p>}
              </div>
              <p className="font-semibold text-black text-sm shrink-0">
                {item.unit_price.toLocaleString('fr-FR')} FCFA
              </p>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-gray-300 hover:text-red-400 transition-colors p-1 shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => setView('new')}
        className="w-full bg-black text-white rounded-full py-4 text-base font-semibold mt-4 flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Ajouter un article
      </button>
    </div>
  );
}
