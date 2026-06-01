'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/lib/store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { InvoiceItem } from '@/types';
import { Wrench, Package, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onSave: (item: InvoiceItem) => void;
  onCancel: () => void;
  initial?: Partial<InvoiceItem>;
}

type ItemType = 'service' | 'material' | 'other';

const typeConfig = [
  { type: 'material' as ItemType, label: 'Matériel', icon: Package },
  { type: 'service' as ItemType, label: 'Service', icon: Wrench },
  { type: 'other' as ItemType, label: 'Autre', icon: MoreHorizontal },
];

export default function AddItemForm({ onSave, onCancel, initial }: Props) {
  const supabase = createClient();
  const { currentBusiness } = useApp();
  const [type, setType] = useState<ItemType>(initial?.type ?? 'material');
  const [name, setName] = useState(initial?.name ?? '');
  const [details, setDetails] = useState(initial?.details ?? '');
  const [unitPrice, setUnitPrice] = useState(String(initial?.unit_price ?? ''));
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? '1'));
  const [unitType, setUnitType] = useState(initial?.unit_type ?? '');
  const [discount, setDiscount] = useState(String(initial?.discount ?? '0'));
  const [taxable, setTaxable] = useState(initial?.taxable ?? false);
  const [saveToCatalog, setSaveToCatalog] = useState(initial?.saved_to_catalog ?? false);

  const canSave = name.trim() && unitPrice && Number(unitPrice) >= 0;

  const handleSave = async () => {
    const item: InvoiceItem = {
      id: crypto.randomUUID(),
      type,
      name: name.trim(),
      details: details || undefined,
      unit_price: Number(unitPrice),
      quantity: Number(quantity) || 1,
      unit_type: unitType || undefined,
      discount: Number(discount) || 0,
      taxable,
      saved_to_catalog: saveToCatalog,
    };

    if (saveToCatalog && currentBusiness) {
      await supabase.from('catalog_items').insert({
        business_id: currentBusiness.id,
        type,
        name: name.trim(),
        details: details || null,
        unit_price: Number(unitPrice),
        unit_type: unitType || null,
        taxable,
      });
    }

    onSave(item);
  };

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex gap-2">
        {typeConfig.map(({ type: t, label, icon: Icon }) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-sm font-medium',
              type === t
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            )}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Fields */}
      <Input
        label="Nom"
        placeholder={type === 'material' ? 'Ex: Cahier, Mètre...' : type === 'service' ? 'Ex: Conception de logo' : 'Ex: Transport'}
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
      />
      <Input
        label="Détails (optionnel)"
        placeholder={type === 'material' ? 'Ex: Cahier 32 pages' : type === 'service' ? 'Description du service...' : 'Description...'}
        value={details}
        onChange={e => setDetails(e.target.value)}
      />
      <div className="flex gap-3">
        <Input
          label="Prix unitaire"
          type="number"
          placeholder="0"
          value={unitPrice}
          onChange={e => setUnitPrice(e.target.value)}
        />
        <Input
          label="Quantité"
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <Input
          label="Unité (optionnel)"
          placeholder="h, jour, m²..."
          value={unitType}
          onChange={e => setUnitType(e.target.value)}
        />
        <Input
          label="Remise %"
          type="number"
          value={discount}
          onChange={e => setDiscount(e.target.value)}
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {/* Taxable */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-medium text-gray-700">Taxable ?</span>
            {taxable && (
              <span className="ml-2 text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">TVA 18%</span>
            )}
          </div>
          <button
            onClick={() => setTaxable(!taxable)}
            className={cn('relative w-12 h-6 rounded-full transition-colors', taxable ? 'bg-black' : 'bg-gray-200')}
          >
            <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', taxable ? 'translate-x-7' : 'translate-x-1')} />
          </button>
        </div>

        {/* Save to catalog */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-700">Sauvegarder dans le catalogue</span>
          <button
            onClick={() => setSaveToCatalog(!saveToCatalog)}
            className={cn('relative w-12 h-6 rounded-full transition-colors', saveToCatalog ? 'bg-black' : 'bg-gray-200')}
          >
            <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', saveToCatalog ? 'translate-x-7' : 'translate-x-1')} />
          </button>
        </div>
      </div>

      {/* Preview */}
      {name && unitPrice && (
        <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1.5">
          {(() => {
            const base = Number(unitPrice) * (Number(quantity) || 1) * (1 - (Number(discount) || 0) / 100);
            const tva = taxable ? base * 0.18 : 0;
            return (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total HT</span>
                  <span className="font-semibold">{base.toLocaleString('fr-FR')}</span>
                </div>
                {taxable && (
                  <div className="flex justify-between text-orange-500">
                    <span>TVA 18%</span>
                    <span className="font-semibold">+{tva.toLocaleString('fr-FR')}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-1.5">
                  <span className="font-semibold text-black">Total TTC</span>
                  <span className="font-bold text-black">{(base + tva).toLocaleString('fr-FR')}</span>
                </div>
              </>
            );
          })()}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={!canSave} className="flex-1">
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
