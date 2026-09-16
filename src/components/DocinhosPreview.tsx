import React, { forwardRef } from 'react';
import { ProposalData } from '../types';
import { DEFAULT_BANNER_IMAGE } from '../utils/defaultData';

const TERRACOTTA = '#b95438';
const TERRACOTTA_LIGHT = '#f2e3dc';
const TERRACOTTA_BORDER = '#e4c4b7';
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const DocinhosPreview = forwardRef<HTMLDivElement, { data: ProposalData; scale: number; highlightChanges: boolean }>(({ data, scale }, ref) => {
  const items = (data.docinhosItens || []).filter(i => i.nome.trim() && i.quantidade > 0 && i.precoUnitario >= 0);
  const services = (data.servicos || []).filter(i => i.descricao.trim());

  return <div ref={ref} className="proposal-preview origin-top-left bg-white text-stone-900" style={{ width: 794, minHeight: 1123, transform: `scale(${scale})` }}>
    <div className="h-[188px] w-full overflow-hidden bg-[#b95438]"><img src={data.bannerCustomImage || DEFAULT_BANNER_IMAGE} alt="Jana Confeitaria" className="h-full w-full object-cover" /></div>
    <div className="p-14">
      <div className="mt-8 grid grid-cols-2 gap-3 text-sm"><p><strong>Cliente:</strong> {data.cliente || 'Cliente'}</p><p><strong>Data:</strong> {data.data}</p><p><strong>Convidados:</strong> {data.convidados || 'Não informado'}</p><p><strong>Local:</strong> {data.local || 'Não informado'}</p><p className="col-span-2"><strong>Horário:</strong> {data.horarioInicio || '--:--'} às {data.horarioFim || '--:--'}</p></div>
      <div className="mt-10"><table className="w-full border-collapse text-sm"><thead><tr className="text-left" style={{ backgroundColor: TERRACOTTA_LIGHT }}><th className="p-3" style={{ border: `1px solid ${TERRACOTTA_BORDER}` }}>Item / Serviço</th><th className="p-3 text-right" style={{ border: `1px solid ${TERRACOTTA_BORDER}` }}>Quantidade</th><th className="p-3 text-right" style={{ border: `1px solid ${TERRACOTTA_BORDER}` }}>Unitário</th><th className="p-3 text-right" style={{ border: `1px solid ${TERRACOTTA_BORDER}` }}>Subtotal</th></tr></thead><tbody><tr><td colSpan={4} className="border border-stone-200 bg-stone-100 p-3 font-bold">Docinhos</td></tr>{items.map(i => <tr key={i.id}><td className="border border-stone-200 p-3">{i.nome}</td><td className="border border-stone-200 p-3 text-right">{i.quantidade}</td><td className="border border-stone-200 p-3 text-right">{money(i.precoUnitario)}</td><td className="border border-stone-200 p-3 text-right">{money(i.quantidade * i.precoUnitario)}</td></tr>)}{services.length > 0 && <><tr><td colSpan={4} className="border border-stone-200 bg-stone-100 p-3 font-bold">Serviços</td></tr>{services.map(i => <tr key={i.id}><td className="border border-stone-200 p-3">{i.descricao}</td><td className="border border-stone-200 p-3 text-right">1</td><td className="border border-stone-200 p-3 text-right">{money(i.valor)}</td><td className="border border-stone-200 p-3 text-right">{money(i.valor)}</td></tr>)}</>}</tbody></table></div>
      <div className="mt-8 border-t-2 pt-4 text-right" style={{ borderColor: TERRACOTTA }}><span className="text-lg font-bold">Total final: </span><span className="text-2xl font-black" style={{ color: TERRACOTTA }}>R$ {data.valorTotal || '0,00'}</span></div>
      {data.condicoesPagamento && <p className="mt-8 text-sm"><strong>Condições:</strong> {data.condicoesPagamento}</p>}
      {data.observacoes && <p className="mt-4 text-sm text-stone-600"><strong>Observações:</strong> {data.observacoes}</p>}
      <div className="mt-20 flex justify-between border-t border-stone-200 pt-4 text-xs text-stone-500"><span>{data.contatoNome}</span><span>{data.contatoTelefone} · {data.contatoInstagram}</span></div>
    </div>
  </div>;
});

DocinhosPreview.displayName = 'DocinhosPreview';
