import React from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { ContractItem, ProposalData } from '../types';

interface Props {
  data: ProposalData;
  onChange: (data: ProposalData) => void;
  onReset: () => void;
  onReview: () => void;
  onSwitch: () => void;
}

const money = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const calculateTotal = (items: ContractItem[]) => items.reduce((total, item) => total + (Number(item.quantidade) || 0) * (Number(item.precoUnitario) || 0), 0);

export const ContractForm: React.FC<Props> = ({ data, onChange, onReset, onReview, onSwitch }) => {
  const items = data.contratoItens || [];
  const update = (patch: Partial<ProposalData>) => {
    const next = { ...data, ...patch };
    if (patch.contratoItens) next.valorTotal = money(calculateTotal(patch.contratoItens));
    onChange(next);
  };
  const updateItem = (id: string, patch: Partial<ContractItem>) => update({ contratoItens: items.map(item => item.id === id ? { ...item, ...patch } : item) });
  const total = calculateTotal(items);
  return <div className="proposal-form flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-slate-800 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-4">
      <div><h2 className="font-semibold text-slate-900">Contrato</h2><p className="text-xs text-slate-500">Informe as partes, o evento e os valores contratados.</p></div>
      <div className="flex gap-1"><button type="button" onClick={onSwitch} className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Trocar documento</button><button type="button" onClick={onReset} title="Novo documento" className="min-h-11 min-w-11 rounded-xl p-2 text-stone-400 hover:bg-stone-100"><RefreshCw className="h-4 w-4" /></button></div>
    </div>
    <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
      <section className="space-y-3">
        <h3 className="font-semibold">Contratante</h3>
        <label className="block">Nome<input value={data.cliente} onChange={e => update({ cliente: e.target.value })} className="form-input mt-1" placeholder="Nome completo" /></label>
        <label className="block">Endereço<input value={data.contratanteEndereco || ''} onChange={e => update({ contratanteEndereco: e.target.value })} className="form-input mt-1" placeholder="Rua, número, complemento, cidade e CEP" /></label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label>Data de nascimento<input type="date" value={data.contratanteNascimento || ''} onChange={e => update({ contratanteNascimento: e.target.value })} className="form-input mt-1" /></label>
          <label>RG<input value={data.contratanteRg || ''} onChange={e => update({ contratanteRg: e.target.value })} className="form-input mt-1" /></label>
          <label>CPF<input value={data.contratanteCpf || ''} onChange={e => update({ contratanteCpf: e.target.value })} className="form-input mt-1" inputMode="numeric" /></label>
        </div>
      </section>

      <section className="space-y-3 border-t border-stone-100 pt-4">
        <h3 className="font-semibold">Evento</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label>Data do evento<input type="date" value={data.data} onChange={e => update({ data: e.target.value })} className="form-input mt-1" /></label>
          <label>Horário (texto livre)<input value={data.horarioManual} onChange={e => update({ horarioManual: e.target.value })} className="form-input mt-1" placeholder="Ex.: das 15h às 19h" /></label>
        </div>
        <label className="block">Endereço do evento<input value={data.local} onChange={e => update({ local: e.target.value })} className="form-input mt-1" placeholder="Endereço completo" /></label>
      </section>

      <section className="space-y-3 border-t border-stone-100 pt-4">
        <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">Itens contratados</h3><button type="button" onClick={() => update({ contratoItens: [...items, { id: crypto.randomUUID(), descricao: '', quantidade: 1, precoUnitario: 0 }] })} className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800"><Plus className="h-3.5 w-3.5" /> Adicionar item</button></div>
        <div className="space-y-3">{items.map((item, index) => <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_44px] items-end gap-2 rounded-xl border border-stone-200 p-3 sm:grid-cols-[minmax(0,1fr)_90px_120px_32px]">
          <label className="col-span-2 sm:col-span-1">Descrição<input aria-label={`Descrição do item ${index + 1}`} value={item.descricao} onChange={e => updateItem(item.id, { descricao: e.target.value })} className="form-input mt-1" placeholder="Produto ou serviço" /></label>
          <label>Quantidade<input aria-label={`Quantidade do item ${index + 1}`} type="number" min="0" step="1" value={item.quantidade || ''} onChange={e => updateItem(item.id, { quantidade: Math.max(0, Number(e.target.value)) })} className="form-input mt-1" /></label>
          <label>Preço unitário<input aria-label={`Preço unitário do item ${index + 1}`} type="number" min="0" step="0.01" value={item.precoUnitario || ''} onChange={e => updateItem(item.id, { precoUnitario: Math.max(0, Number(e.target.value)) })} className="form-input mt-1" placeholder="R$" /></label>
          <button type="button" onClick={() => update({ contratoItens: items.filter(current => current.id !== item.id) })} className="flex min-h-10 w-full items-center justify-center text-stone-400 hover:text-rose-700" aria-label={`Excluir item ${index + 1}`}><Trash2 className="h-4 w-4" /></button>
        </div>)}</div>
        <div className="space-y-2 rounded-xl bg-rose-50 p-3">
          <div className="flex items-center justify-between text-xs text-stone-600"><span>Total calculado pelos itens</span><strong>R$ {money(total)}</strong></div>
          <label className="block text-sm font-semibold text-stone-800">Valor final a pagar
            <div className="mt-1 flex items-center gap-2"><span className="text-sm font-semibold">R$</span><input type="text" inputMode="decimal" aria-label="Valor total do contrato" value={data.valorTotal} onChange={e => update({ valorTotal: e.target.value })} className="form-input min-w-0 flex-1 bg-white text-lg font-bold" placeholder="0,00" /></div>
          </label>
          <button type="button" onClick={() => update({ valorTotal: money(total) })} className="text-xs font-semibold text-rose-800">Recalcular total pelos itens</button>
          <p className="text-xs text-stone-600">Se o valor final ficar abaixo do subtotal, a diferença aparece como desconto negociado no contrato.</p>
        </div>
      </section>

      <section className="border-t border-stone-100 pt-4"><label className="block font-semibold">Negociação do pagamento<textarea value={data.condicoesPagamento} onChange={e => update({ condicoesPagamento: e.target.value })} className="form-input mt-1 min-h-24" placeholder="Descreva livremente valores, parcelas, datas e forma de pagamento." /></label></section>
    </div>
    <div className="border-t border-stone-200 p-4"><button type="button" onClick={onReview} className="w-full rounded-xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white">Revisar contrato</button></div>
  </div>;
};
