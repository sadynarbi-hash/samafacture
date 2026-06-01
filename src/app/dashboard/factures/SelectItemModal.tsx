'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/lib/store';
import { Search, Plus, Wrench, Package, MoreHorizontal, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CatalogItem, InvoiceItem } from '@/types';
import AddItemForm from './AddItemForm';
import Button from '@/components/ui/Button';

interface Props {
  onSave: (item: InvoiceItem) => void;
  onCancel: () => void;
}

type Tab = 'all' | 'service' | 'material' | 'other';
type View = 'list' | 'quantity' | 'new';

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
  const [view, setView] = useState<View>('list');
  const [selectedCat, setSelectedCat] = useState<CatalogItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setSelectedCat(cat);
    setQuantity(1);
    setDiscount(0);
    setView('quantity');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleConfirmQuantity = () => {
    if (!selectedCat) return;
    const item: InvoiceItem = {
      id: crypto.randomUUID(),
      type: selectedCat.type,
      name: selectedCat.name,
      details: selectedCat.details,
      unit_price: selectedCat.unit_price,
      quantity,
      unit_type: selectedCat.unit_type,
      discount,
      taxable: selectedCat.taxable,
      saved_to_catalog: false,
    };
    onSave(item);
  };

  // ── QUANTITY VIEW ──
  if (view === 'quantity' && selectedCat) {
    const subtotal = selectedCat.unit_price * quantity * (1 - discount / 100);
    const tva = selectedCat.taxable ? subtotal * 0.18 : 0;
    const total = subtotal + tva;

    return (
      <div className="space-y-5">
        {/* Item info */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-500">
              {typeIcon(selectedCat.type)}
            </div>
            <div>
              <p className="font-bold text-black">{selectedCat.name}</p>
              {selectedCat.details && <p className="text-xs text-gray-400">{selectedCat.details}</p>}
              <p className="text-sm text-gray-500">{selectedCat.unit_price.toLocaleString('fr-FR')} FCFA / {selectedCat.unit_type || 'unité'}</p>
            </div>
          </div>
        </div>

        {/* Quantity selector */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Quantité</p>
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-3">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 active:scale-95 transition-all"
            >
              <Minus size={18} className="text-black" />
            </button>
            <input
              ref={inputRef}
              type="number"
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="flex-1 text-center text-3xl font-bold text-black bg-transparent focus:outline-none"
            />
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-sm hover:bg-gray-800 active:scale-95 transition-all"
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Discount */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Remise %</p>
          <div className="flex gap-2">
            {[0, 5, 10, 15, 20].map(d => (
              <button
                key={d}
                onClick={() => setDiscount(d)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
                  discount === d ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {d}%
              </button>
            ))}
          </div>
        </div>

        {/* Total preview */}
        <div className="bg-black text-white rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-sm">{quantity} × {selectedCat.unit_price.toLocaleString('fr-FR')} FCFA</p>
              {discount > 0 && <p className="text-orange-300 text-xs">Remise {discount}%</p>}
              {selectedCat.taxable && <p className="text-yellow-300 text-xs">TVA 18%</p>}
            </div>
            <p className="text-2xl font-bold">{total.toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span></p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setView('list')} className="flex-1">Retour</Button>
          <Button onClick={handleConfirmQuantity} className="flex-1">Ajouter</Button>
        </div>
      </div>
    );
  }

  // ── NEW ITEM VIEW ──
  if (view === 'new') {
    return <AddItemForm onSave={onSave} onCancel={() => setView('list')} />;
  }

  // ── LIST VIEW ──
  return (
    <div className="space-y-3">
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

      <button
        onClick={() => setView('new')}
        className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-black hover:border-black transition-colors"
      >
        <Plus size={16} />
        Ajouter un article
      </button>

      <button onClick={onCancel} className="w-full text-center text-gray-400 text-sm py-1">
        Annuler
      </button>
    </div>
  );
}
