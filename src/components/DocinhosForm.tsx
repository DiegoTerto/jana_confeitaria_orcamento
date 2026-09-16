import React from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { DocinhoItem, ProposalData, ServiceItem } from '../types';

interface Props { data: ProposalData; onChange: (data: ProposalData) => void; onReset: () => void; onReview: () => void; onSwitch: () => void; }
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const calculated = (data: ProposalData) => (data.docinhosItens || []).reduce((sum, i) => sum + (Number(i.quantidade) || 0) * (Number(i.precoUnitario) || 0), 0) + (data.servicos || []).reduce((sum, i) => sum + (Number(i.valor) || 0), 0);
const parseMoney = (value: string) => Number(value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;

export const DocinhosForm: React.FC<Props> = ({ data, onChange, onReset, onReview, onSwitch }) => {
  const items = data.docinhosItens || [];
  const services = data.servicos || [];
  const update = (patch: Partial<ProposalData>) => onChange({ ...data, ...patch });
  const updateItem = (id: string, patch: Partial<DocinhoItem>) => update({ docinhosItens: items.map(i => i.id === id ? { ...i, ...patch } : i) });
  const updateService = (id: string, patch: Partial<ServiceItem>) => update({ servicos: services.map(i => i.id === id ? { ...i, ...patch } : i) });
  const finalValue = parseMoney(data.valorTotal);
  const sumQuantity = items.reduce((sum, i) => sum + (Number(i.quantidade) || 0), 0);
  const incompleteCount = items.filter(i => (i.nome.trim() || i.quantidade > 0 || i.precoUnitario > 0) && (!i.nome.trim() || i.quantidade <= 0 || i.precoUnitario < 0)).length + services.filter(i => (i.descricao.trim() || i.valor > 0) && !i.descricao.trim()).length;
  return <div className="proposal-form flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-slate-800 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-4">
      <div><h2 className="font-semibold text-slate-900">Docinhos Tradicionais/Gourmet</h2><p className="text-xs text-slate-500">Preencha a proposta — ela salva sozinha.</p></div>
      <div className="flex gap-1"><button type="button" onClick={onSwitch} className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Trocar tipo</button><button type="button" onClick={onReset} title="Novo orçamento" className="min-h-11 min-w-11 rounded-xl p-2 text-stone-400 hover:bg-stone-100"><RefreshCw className="h-4 w-4" /></button></div>
    </div>
    <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">Cliente *<input value={data.cliente} onChange={e => update({ cliente: e.target.value })} className="form-input" /></label>
        <label>Data *<input value={data.data} onChange={e => update({ data: e.target.value })} className="form-input" /></label>
        <label>Convidados (opcional)<input value={data.convidados} onChange={e => update({ convidados: e.target.value })} className="form-input" /></label>
        <label className="sm:col-span-2">Local *<input value={data.local} onChange={e => update({ local: e.target.value })} className="form-input" /></label>
        <label>Início<input type="time" value={data.horarioInicio} onChange={e => update({ horarioInicio: e.target.value })} className="form-input" /></label>
        <label>Término<input type="time" value={data.horarioFim} onChange={e => update({ horarioFim: e.target.value })} className="form-input" /></label>
      </section>
      <section><div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">Docinhos <span className="text-xs font-normal text-stone-500">({sumQuantity} unidades)</span></h3><button type="button" onClick={() => update({ docinhosItens: [...items, { id: crypto.randomUUID(), nome: '', quantidade: 0, precoUnitario: 0 }] })} className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800"><Plus className="h-3.5 w-3.5" /> Adicionar</button></div>
        <div className="space-y-2">{items.map((item, index) => <div key={item.id} className="grid grid-cols-[1fr_80px_110px_32px] gap-2"><input aria-label={`Nome do docinho ${index + 1}`} placeholder="Ex: Brigadeiro" value={item.nome} onChange={e => updateItem(item.id, { nome: e.target.value })} className="form-input" /><input aria-label="Quantidade" type="number" min="0" step="1" value={item.quantidade || ''} onChange={e => updateItem(item.id, { quantidade: Math.max(0, Number(e.target.value)) })} className="form-input" placeholder="Qtd." /><input aria-label="Preço unitário" type="number" min="0" step="0.01" value={item.precoUnitario || ''} onChange={e => updateItem(item.id, { precoUnitario: Math.max(0, Number(e.target.value)) })} className="form-input" placeholder="R$" /><button type="button" onClick={() => update({ docinhosItens: items.filter(i => i.id !== item.id) })} className="flex items-center justify-center text-stone-400 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div>)}</div>
      </section>
      {incompleteCount > 0 && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{incompleteCount} linha(s) incompleta(s) serão ignorada(s) no cálculo e no PDF.</p>}
      <section><div className="mb-2 flex items-center justify-between"><h3 className="font-semibold">Serviços</h3><button type="button" onClick={() => update({ servicos: [...services, { id: crypto.randomUUID(), descricao: '', valor: 0 }] })} className="flex items-center gap-1 rounded-lg bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700"><Plus className="h-3.5 w-3.5" /> Adicionar serviço</button></div>
        <div className="space-y-2">{services.map(service => <div key={service.id} className="grid grid-cols-[1fr_110px_32px] gap-2"><input placeholder="Ex: Entrega" value={service.descricao} onChange={e => updateService(service.id, { descricao: e.target.value })} className="form-input" /><input type="number" min="0" step="0.01" value={service.valor || ''} onChange={e => updateService(service.id, { valor: Math.max(0, Number(e.target.value)) })} className="form-input" placeholder="R$" /><button type="button" onClick={() => update({ servicos: services.filter(i => i.id !== service.id) })} className="flex items-center justify-center text-stone-400 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button></div>)}</div>
      </section>
      <section className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3"><div className="flex items-center justify-between text-sm"><span>Total calculado</span><strong>{money(calculated(data))}</strong></div><label className="block font-semibold">Total final<input type="text" inputMode="decimal" value={data.valorTotal} onChange={e => update({ valorTotal: e.target.value })} className="form-input mt-1 text-lg font-bold" /></label><button type="button" onClick={() => update({ valorTotal: money(calculated(data)).replace('R$', '').trim() })} className="text-xs font-semibold text-rose-800">Recalcular total</button></section>
      <section className="space-y-3"><label className="block font-semibold">Condições de pagamento<textarea value={data.condicoesPagamento} onChange={e => update({ condicoesPagamento: e.target.value })} className="form-input mt-1 min-h-20" /></label><label className="block font-semibold">Observações<textarea value={data.observacoes} onChange={e => update({ observacoes: e.target.value })} className="form-input mt-1 min-h-20" /></label></section>
    </div>
    <div className="border-t border-stone-200 p-4"><button type="button" onClick={onReview} className="w-full rounded-xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white">Revisar proposta</button></div>
  </div>;
};
