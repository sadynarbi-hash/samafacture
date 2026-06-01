'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/lib/store';
import { Search, Plus, Wrench, Package, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CatalogItem, InvoiceItem } from '@/types';
import AddItemForm from './AddItemForm';

interface Props {
  onSave: (item: InvoiceItem) => void;
  onCancel: () => void;
}

type Tab = 'all' | 'service' | 'material' | 'other';

const typeIcon = (t: string) =>
  t === 'service' ? <Wrench size={15} /> : t === 'material' ? <Package size={15} /> : <MoreHorizontal size={15} />;

const tabs: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'material', label: 'Matériels' },
  { key: 'service', label: 'Services' },
  { key: 'other', label: 'Autres' },
];

export default function SelectItemModal({ onSave, onCancel }: Props) {
  const supabase = createClient();
  const { currentBusiness } = useApp();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [showNew, setShowNew] = useState(false);

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

  const handleSelectCatalog = (cat: CatalogItem) => {
    const item: InvoiceItem = {
      id: crypto.randomUUID(),
      type: cat.type,
      name: cat.name,
      details: cat.details,
      unit_price: cat.unit_price,
      quantity: 1,
      unit_type: cat.unit_type,
      discount: 0,
      taxable: cat.taxable,
      saved_to_catalog: false,
    };
    onSave(item);
  };

  if (showNew) {
    return (
      <AddItemForm
        onSave={onSave}
        onCancel={() => setShowNew(false)}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-full p-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 py-1.5 rounded-full text-xs font-semibold transition-all',
              tab === key ? 'bg-white text-black shadow-sm' : 'text-gray-500'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Catalog items */}
      <div className="max-h-64 overflow-y-auto space-y-1.5">
        {filtered.length > 0 ? (
          filtered.map(item => (
            <button
              key={item.id}
              onClick={() => handleSelectCatalog(item)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors text-left"
            >
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 text-gray-500 shadow-sm">
                {typeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-black truncate">{item.name}</p>
                {item.details && <p className="text-xs text-gray-400 truncate">{item.details}</p>}
              </div>
              <p className="font-bold text-sm text-black shrink-0">
                {item.unit_price.toLocaleString('fr-FR')} FCFA
              </p>
            </button>
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm py-6">
            {search ? 'Aucun article trouvé' : 'Catalogue vide'}
          </p>
        )}
      </div>

      {/* Add new button */}
      <button
        onClick={() => setShowNew(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-black hover:border-black transition-colors"
      >
        <Plus size={16} />
        Ajouter un article
      </button>

      <button onClick={onCancel} className="w-full text-center text-gray-400 text-sm py-2">
        Annuler
      </button>
    </div>
  );
}
