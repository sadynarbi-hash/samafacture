'use client';

import { cn } from '@/lib/utils';
import { Check, ArrowRight } from 'lucide-react';
import type { TemplateId } from '@/lib/pdfTemplates';

interface Props {
  onSelect: (t: TemplateId) => void;
  onBack: () => void;
}

const previews: { id: TemplateId; name: string; description: string; preview: React.ReactNode }[] = [
  {
    id: 'classique',
    name: 'Classique',
    description: 'En-tête noir avec nom de l\'entreprise',
    preview: (
      <div className="w-full h-full bg-white">
        <div className="bg-black h-10 w-full flex items-end px-3 pb-2 gap-2">
          <div className="w-16 h-2 bg-white/80 rounded-sm" />
          <div className="ml-auto flex flex-col items-end gap-1">
            <div className="w-10 h-1.5 bg-white/40 rounded-sm" />
            <div className="w-7 h-1 bg-white/30 rounded-sm" />
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div className="w-14 h-1.5 bg-gray-300 rounded-sm" />
          <div className="w-10 h-1 bg-gray-200 rounded-sm" />
          <div className="mt-3 bg-gray-100 h-5 w-full rounded-sm flex items-center px-2 gap-2">
            <div className="flex-1 h-1 bg-gray-300 rounded" />
            <div className="w-5 h-1 bg-gray-300 rounded" />
            <div className="w-8 h-1 bg-gray-300 rounded" />
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-gray-100">
              <div className="flex-1 h-1 bg-gray-200 rounded" />
              <div className="w-4 h-1 bg-gray-200 rounded" />
              <div className="w-8 h-1 bg-gray-200 rounded" />
            </div>
          ))}
          <div className="flex justify-end mt-2">
            <div className="w-20 h-6 bg-black rounded-full flex items-center justify-center">
              <div className="w-10 h-1.5 bg-white/70 rounded" />
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
      <div className="w-full h-full bg-white">
        <div className="bg-blue-600 h-1.5 w-full" />
        <div className="p-3">
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-1">
              <div className="w-16 h-2.5 bg-blue-600 rounded-sm" />
              <div className="w-10 h-1 bg-gray-200 rounded-sm" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="w-8 h-1 bg-gray-300 rounded-sm" />
              <div className="w-12 h-2 bg-gray-800 rounded-sm" />
            </div>
          </div>
          <div className="border-b border-blue-200 mb-3" />
          <div className="w-12 h-1.5 bg-gray-300 rounded-sm mb-2" />
          <div className="bg-blue-50 h-5 w-full rounded-sm flex items-center px-2 gap-2 mb-1">
            <div className="flex-1 h-1 bg-blue-200 rounded" />
            <div className="w-4 h-1 bg-blue-200 rounded" />
            <div className="w-8 h-1 bg-blue-200 rounded" />
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-gray-100">
              <div className="flex-1 h-1 bg-gray-200 rounded" />
              <div className="w-4 h-1 bg-gray-200 rounded" />
              <div className="w-8 h-1 bg-gray-200 rounded" />
            </div>
          ))}
          <div className="flex justify-end mt-2">
            <div className="w-20 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-10 h-1.5 bg-white/70 rounded" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'epure',
    name: 'Épuré',
    description: 'Minimaliste tout blanc',
    preview: (
      <div className="w-full h-full bg-white p-3">
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <div className="w-16 h-2.5 bg-gray-800 rounded-sm" />
            <div className="w-10 h-1 bg-gray-200 rounded-sm" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="w-8 h-1 bg-gray-200 rounded-sm" />
            <div className="w-12 h-2 bg-gray-400 rounded-sm" />
          </div>
        </div>
        <div className="border-b border-gray-100 mb-3" />
        <div className="w-12 h-1.5 bg-gray-200 rounded-sm mb-2" />
        <div className="bg-gray-50 h-5 w-full rounded-sm flex items-center px-2 gap-2 mb-1">
          <div className="flex-1 h-1 bg-gray-200 rounded" />
          <div className="w-4 h-1 bg-gray-200 rounded" />
          <div className="w-8 h-1 bg-gray-200 rounded" />
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center gap-2 py-1 border-b border-gray-50">
            <div className="flex-1 h-1 bg-gray-100 rounded" />
            <div className="w-4 h-1 bg-gray-100 rounded" />
            <div className="w-8 h-1 bg-gray-100 rounded" />
          </div>
        ))}
        <div className="flex justify-end mt-2">
          <div className="w-20 h-6 bg-gray-800 rounded-full flex items-center justify-center">
            <div className="w-10 h-1.5 bg-white/70 rounded" />
          </div>
        </div>
      </div>
    ),
  },
];

export default function TemplateSelector({ onSelect, onBack }: Props) {
  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <button onClick={onBack} className="text-gray-400 text-sm hover:text-black mb-4 flex items-center gap-1">
          ← Retour
        </button>
        <h2 className="text-2xl font-bold text-black">Choisissez un modèle</h2>
        <p className="text-gray-400 text-sm mt-1">Il sera utilisé pour générer le PDF de votre facture</p>
      </div>

      {/* Templates */}
      <div className="space-y-4 flex-1">
        {previews.map(({ id, name, description, preview }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md active:scale-[0.99] transition-all text-left border-2 border-transparent hover:border-gray-100"
          >
            {/* Preview thumbnail */}
            <div className="w-20 h-28 rounded-xl overflow-hidden border border-gray-100 shrink-0 shadow-sm">
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
