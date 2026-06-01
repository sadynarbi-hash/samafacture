'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { TemplateId } from '@/lib/pdfTemplates';

interface Props {
  selected: TemplateId;
  onChange: (t: TemplateId) => void;
}

const previews: { id: TemplateId; name: string; description: string; preview: React.ReactNode }[] = [
  {
    id: 'classique',
    name: 'Classique',
    description: 'En-tête noir',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        <div className="bg-black h-6 w-full flex items-center px-2">
          <div className="w-8 h-1.5 bg-white/80 rounded" />
          <div className="ml-auto w-4 h-1 bg-white/50 rounded" />
        </div>
        <div className="p-2 space-y-1.5">
          <div className="w-12 h-1 bg-gray-200 rounded" />
          <div className="w-8 h-1 bg-gray-100 rounded" />
          <div className="mt-2 bg-gray-100 h-1 w-full rounded" />
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-1">
              <div className="flex-1 h-1 bg-gray-100 rounded" />
              <div className="w-4 h-1 bg-gray-100 rounded" />
              <div className="w-6 h-1 bg-gray-100 rounded" />
            </div>
          ))}
          <div className="ml-auto w-16 h-3 bg-black rounded mt-2" />
        </div>
      </div>
    ),
  },
  {
    id: 'moderne',
    name: 'Moderne',
    description: 'Ligne bleue',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        <div className="bg-blue-600 h-1 w-full" />
        <div className="p-2 space-y-1.5">
          <div className="flex justify-between items-start">
            <div className="w-12 h-2 bg-blue-600 rounded" />
            <div className="w-6 h-1.5 bg-gray-200 rounded" />
          </div>
          <div className="border-b border-blue-200 pb-1" />
          <div className="w-10 h-1 bg-gray-200 rounded" />
          <div className="bg-gray-100 h-1 w-full rounded" />
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-1">
              <div className="flex-1 h-1 bg-gray-100 rounded" />
              <div className="w-4 h-1 bg-gray-100 rounded" />
              <div className="w-6 h-1 bg-gray-100 rounded" />
            </div>
          ))}
          <div className="ml-auto w-16 h-3 bg-blue-600 rounded mt-2" />
        </div>
      </div>
    ),
  },
  {
    id: 'epure',
    name: 'Épuré',
    description: 'Minimaliste',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        <div className="p-2 space-y-1.5">
          <div className="flex justify-between items-start">
            <div className="w-12 h-2 bg-gray-800 rounded" />
            <div className="w-6 h-1.5 bg-gray-300 rounded" />
          </div>
          <div className="border-b border-gray-100 pb-1" />
          <div className="w-10 h-1 bg-gray-200 rounded" />
          <div className="bg-gray-50 h-1 w-full rounded" />
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-1">
              <div className="flex-1 h-1 bg-gray-100 rounded" />
              <div className="w-4 h-1 bg-gray-100 rounded" />
              <div className="w-6 h-1 bg-gray-100 rounded" />
            </div>
          ))}
          <div className="ml-auto w-16 h-3 bg-gray-800 rounded mt-2" />
        </div>
      </div>
    ),
  },
];

export default function TemplateSelector({ selected, onChange }: Props) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Modèle de facture</p>
      <div className="grid grid-cols-3 gap-3">
        {previews.map(({ id, name, description, preview }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              'flex flex-col items-center gap-2 p-1 rounded-2xl border-2 transition-all',
              selected === id ? 'border-black' : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-50">
              {preview}
              {selected === id && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            <div className="text-center pb-1">
              <p className="text-xs font-bold text-black">{name}</p>
              <p className="text-[10px] text-gray-400">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
