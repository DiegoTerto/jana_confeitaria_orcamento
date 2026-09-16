import React from 'react';
import { CakeSlice, Gift, ArrowRight } from 'lucide-react';

interface Props { onChoose: (type: 'carrinho' | 'docinhos') => void; }

export const ContractTypeChooser: React.FC<Props> = ({ onChoose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-sm">
    <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-700">Jana Confeitaria</p>
      <h2 className="mt-2 font-serif text-3xl font-black text-stone-900">Qual orçamento você quer criar?</h2>
      <p className="mt-2 text-sm text-stone-500">Escolha o formato da proposta. Você poderá trocar depois.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => onChoose('carrinho')} className="group rounded-2xl border border-stone-200 p-5 text-left transition hover:border-rose-500 hover:bg-rose-50">
          <CakeSlice className="h-7 w-7 text-rose-700" />
          <span className="mt-4 block font-bold text-stone-900">Carrinho Gourmet</span>
          <span className="mt-1 block text-xs text-stone-500">Serviço com carrinho, sabores e confeitos.</span>
          <ArrowRight className="mt-4 h-4 w-4 text-stone-400 transition group-hover:translate-x-1" />
        </button>
        <button type="button" onClick={() => onChoose('docinhos')} className="group rounded-2xl border border-stone-200 p-5 text-left transition hover:border-rose-500 hover:bg-rose-50">
          <Gift className="h-7 w-7 text-rose-700" />
          <span className="mt-4 block font-bold text-stone-900">Docinhos Tradicionais/Gourmet</span>
          <span className="mt-1 block text-xs text-stone-500">Quantidade, preço por sabor e serviços livres.</span>
          <ArrowRight className="mt-4 h-4 w-4 text-stone-400 transition group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  </div>
);
