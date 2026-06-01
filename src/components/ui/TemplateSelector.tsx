'use client';

import { ArrowRight } from 'lucide-react';
import type { TemplateId } from '@/lib/pdfTemplates';

interface Props {
  onSelect: (t: TemplateId) => void;
  onBack: () => void;
}

const items = [
  { name: 'Savon Duru', qty: '3', pu: '500', total: '1 500' },
  { name: 'Cahier 32p', qty: '10', pu: '200', total: '2 000' },
  { name: 'Stylo bic', qty: '20', pu: '75', total: '1 500' },
];

const previews: { id: TemplateId; name: string; description: string; preview: React.ReactNode }[] = [
  {
    id: 'classique',
    name: 'Classique',
    description: 'En-tête noir, sobre et professionnel',
    preview: (
      <div className="w-full h-full bg-white text-[5px] font-sans overflow-hidden">
        {/* Header */}
        <div className="bg-black px-2.5 py-1.5">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-white font-bold text-[7px]">Damis Shop</div>
              <div className="text-white/50 text-[4px]">Dakar, Sénégal</div>
            </div>
            <div className="text-right">
              <div className="text-white/60 text-[4px]">FACTURE</div>
              <div className="text-white font-bold text-[6px]">#001</div>
              <div className="text-white/50 text-[4px]">01/06/2026</div>
            </div>
          </div>
        </div>
        {/* Client */}
        <div className="px-2.5 py-1.5">
          <div className="text-[4px] text-gray-400 font-bold mb-0.5">FACTURÉ À</div>
          <div className="font-bold text-[5.5px] text-black">Amadou Diallo</div>
          <div className="text-[4px] text-gray-400">amadou@email.com</div>
          {/* Table header */}
          <div className="bg-gray-100 flex justify-between px-1 py-0.5 mt-1.5 rounded-sm">
            <span className="text-gray-500 font-bold flex-1">ARTICLE</span>
            <span className="text-gray-500 font-bold w-4 text-center">QTÉ</span>
            <span className="text-gray-500 font-bold w-8 text-right">TOTAL</span>
          </div>
          {/* Items */}
          {items.map((item, i) => (
            <div key={i} className="flex justify-between px-1 py-0.5 border-b border-gray-100">
              <span className="flex-1 text-black">{item.name}</span>
              <span className="w-4 text-center text-gray-500">{item.qty}</span>
              <span className="w-8 text-right font-semibold">{item.total}</span>
            </div>
          ))}
          {/* Total */}
          <div className="flex justify-end mt-1.5">
            <div className="bg-black text-white px-2 py-0.5 rounded-full flex gap-2">
              <span className="font-bold">TOTAL</span>
              <span className="font-bold">5 000 FCFA</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'moderne',
    name: 'Moderne',
    description: 'Ligne bleue, design contemporain',
    preview: (
      <div className="w-full h-full bg-white text-[5px] font-sans overflow-hidden">
        {/* Blue accent */}
        <div className="bg-blue-600 h-1" />
        <div className="px-2.5 py-1.5">
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <div className="text-blue-600 font-bold text-[7px]">Damis Shop</div>
              <div className="text-gray-400 text-[4px]">Dakar, Sénégal</div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-[4px]">Facture</div>
              <div className="text-gray-800 font-bold text-[6px]">#001</div>
              <div className="text-gray-400 text-[4px]">01/06/2026</div>
            </div>
          </div>
          <div className="border-b border-blue-200 mb-1.5" />
          <div className="text-[4px] text-gray-400 font-bold mb-0.5">FACTURÉ À</div>
          <div className="font-bold text-[5.5px] text-black mb-1">Amadou Diallo</div>
          {/* Table header */}
          <div className="bg-blue-50 flex justify-between px-1 py-0.5 rounded-sm">
            <span className="text-blue-500 font-bold flex-1">ARTICLE</span>
            <span className="text-blue-500 font-bold w-4 text-center">QTÉ</span>
            <span className="text-blue-500 font-bold w-8 text-right">TOTAL</span>
          </div>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between px-1 py-0.5 border-b border-gray-100">
              <span className="flex-1 text-black">{item.name}</span>
              <span className="w-4 text-center text-gray-500">{item.qty}</span>
              <span className="w-8 text-right font-semibold">{item.total}</span>
            </div>
          ))}
          <div className="flex justify-end mt-1.5">
            <div className="bg-blue-600 text-white px-2 py-0.5 rounded-full flex gap-2">
              <span className="font-bold">TOTAL</span>
              <span className="font-bold">5 000 FCFA</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'epure',
    name: 'Épuré',
    description: 'Minimaliste, élégant',
    preview: (
      <div className="w-full h-full bg-white text-[5px] font-sans overflow-hidden">
        <div className="px-2.5 py-2">
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <div className="text-gray-800 font-bold text-[7px]">Damis Shop</div>
              <div className="text-gray-400 text-[4px]">Dakar, Sénégal</div>
            </div>
            <div className="text-right">
              <div className="text-gray-300 text-[4px]">Facture</div>
              <div className="text-gray-600 font-bold text-[6px]">N° 001</div>
              <div className="text-gray-400 text-[4px]">01/06/2026</div>
            </div>
          </div>
          <div className="border-b border-gray-100 mb-1.5" />
          <div className="text-[4px] text-gray-300 font-bold mb-0.5">FACTURÉ À</div>
          <div className="font-bold text-[5.5px] text-black mb-1">Amadou Diallo</div>
          <div className="bg-gray-50 flex justify-between px-1 py-0.5 rounded-sm">
            <span className="text-gray-400 font-bold flex-1">ARTICLE</span>
            <span className="text-gray-400 font-bold w-4 text-center">QTÉ</span>
            <span className="text-gray-400 font-bold w-8 text-right">TOTAL</span>
          </div>
          {items.map((item, i) => (
            <div key={i} className="flex justify-between px-1 py-0.5 border-b border-gray-50">
              <span className="flex-1 text-black">{item.name}</span>
              <span className="w-4 text-center text-gray-400">{item.qty}</span>
              <span className="w-8 text-right text-gray-600 font-semibold">{item.total}</span>
            </div>
          ))}
          <div className="flex justify-end mt-1.5">
            <div className="bg-gray-800 text-white px-2 py-0.5 rounded-full flex gap-2">
              <span className="font-bold">TOTAL</span>
              <span className="font-bold">5 000 FCFA</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function TemplateSelector({ onSelect, onBack }: Props) {
  return (
    <div className="flex flex-col">
      <button onClick={onBack} className="text-gray-400 text-sm hover:text-black mb-4 flex items-center gap-1 self-start">
        ← Retour
      </button>
      <h2 className="text-2xl font-bold text-black mb-1">Choisissez un modèle</h2>
      <p className="text-gray-400 text-sm mb-6">Sélectionnez le design de votre facture PDF</p>

      <div className="space-y-4">
        {previews.map(({ id, name, description, preview }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md active:scale-[0.99] transition-all text-left border-2 border-transparent hover:border-gray-100"
          >
            {/* Preview */}
            <div className="w-24 h-32 rounded-xl overflow-hidden border border-gray-100 shrink-0 shadow-sm">
              {preview}
            </div>
            {/* Info */}
            <div className="flex-1">
              <p className="font-bold text-black text-lg">{name}</p>
              <p className="text-gray-400 text-sm mt-0.5">{description}</p>
            </div>
            {/* Arrow */}
            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center shrink-0">
              <ArrowRight size={16} className="text-white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
