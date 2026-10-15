import React, { forwardRef } from 'react';
import { ProposalData } from '../types';
import contractBanner from '../assets/images/contract-banner-with-logo.png';

const terracotta = '#b95438';
const border = '#e4c4b7';
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const parseCurrency = (value: string) => {
  const clean = value.replace(/[^\d,.-]/g, '');
  const lastComma = clean.lastIndexOf(',');
  const lastDot = clean.lastIndexOf('.');
  let normalized = clean;
  if (lastComma >= 0 && lastDot >= 0) {
    normalized = lastComma > lastDot ? clean.replace(/\./g, '').replace(',', '.') : clean.replace(/,/g, '');
  } else if (lastComma >= 0) {
    normalized = clean.replace(/\./g, '').replace(',', '.');
  } else if (lastDot >= 0 && clean.length - lastDot - 1 > 2) {
    normalized = clean.replace(/\./g, '');
  }
  return Number(normalized) || 0;
};
const formatDate = (value?: string) => {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

export const ContractPreview = forwardRef<HTMLDivElement, { data: ProposalData; scale: number }>(({ data, scale }, ref) => {
  const items = data.contratoItens || [];
  const total = items.reduce((sum, item) => sum + (Number(item.quantidade) || 0) * (Number(item.precoUnitario) || 0), 0);
  const finalTotal = data.valorTotal ? parseCurrency(data.valorTotal) : total;
  const discount = total - finalTotal;

  return <div className="flex w-full justify-center overflow-hidden">
    <div ref={ref} className="origin-top-left bg-white text-stone-900 shadow-2xl" style={{ width: 794, minHeight: 1123, padding: '24px 48px 32px', transform: `scale(${scale})`, boxSizing: 'border-box', fontFamily: 'Montserrat, Arial, sans-serif' }}>
      <div className="h-[160px] w-full overflow-hidden rounded-lg"><img src={contractBanner} alt="Jana Confeitaria — Contrato" className="h-full w-full object-cover" /></div>
      <div className="mt-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: terracotta }}>Jana Confeitaria</p>
        <h1 className="mt-1 text-xl font-bold uppercase tracking-wide text-stone-900">Contrato de prestação de serviços</h1>
      </div>

      <section className="mt-5">
        <h2 className="border-b pb-1 text-base font-bold" style={{ borderColor: border, color: terracotta }}>Contratante</h2>
        <div className="mt-2 space-y-1 text-sm leading-snug">
          <p><strong>Nome:</strong> {data.cliente || '—'}</p>
          <p><strong>Endereço:</strong> {data.contratanteEndereco || '—'}</p>
          <div className="grid grid-cols-3 gap-3"><p><strong>Nascimento:</strong> {formatDate(data.contratanteNascimento)}</p><p><strong>RG:</strong> {data.contratanteRg || '—'}</p><p><strong>CPF:</strong> {data.contratanteCpf || '—'}</p></div>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="border-b pb-1 text-base font-bold" style={{ borderColor: border, color: terracotta }}>Evento</h2>
        <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 text-sm leading-snug">
          <p><strong>Data do evento:</strong> {formatDate(data.data)}</p>
          <p><strong>Horário:</strong> {data.horarioManual || '—'}</p>
          <p className="col-span-2"><strong>Endereço:</strong> {data.local || '—'}</p>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-base font-bold" style={{ color: terracotta }}>Itens contratados</h2>
        <table className="w-full border-collapse text-xs">
          <thead><tr style={{ backgroundColor: '#f7eee9' }}>
            <th className="border p-1.5 text-left" style={{ borderColor: border }}>Descrição</th>
            <th className="w-24 border p-1.5 text-right" style={{ borderColor: border }}>Quantidade</th>
            <th className="w-32 border p-1.5 text-right" style={{ borderColor: border }}>Preço unitário</th>
            <th className="w-32 border p-1.5 text-right" style={{ borderColor: border }}>Subtotal</th>
          </tr></thead>
          <tbody>{items.length ? items.map(item => <tr key={item.id}>
            <td className="border p-1.5" style={{ borderColor: border }}>{item.descricao || '—'}</td>
            <td className="border p-1.5 text-right" style={{ borderColor: border }}>{item.quantidade}</td>
            <td className="border p-1.5 text-right" style={{ borderColor: border }}>{money(item.precoUnitario)}</td>
            <td className="border p-1.5 text-right" style={{ borderColor: border }}>{money(item.quantidade * item.precoUnitario)}</td>
          </tr>) : <tr><td colSpan={4} className="border p-3 text-center text-stone-500" style={{ borderColor: border }}>Nenhum item informado</td></tr>}</tbody>
        </table>
        <div className="mt-2 space-y-0.5 border-t-2 pt-2 text-right" style={{ borderColor: terracotta }}>
          <p className="text-xs text-stone-600">Subtotal dos itens: {money(total)}</p>
          {discount > 0.009 && <p className="text-xs font-semibold text-emerald-800">Desconto negociado: −{money(discount)}</p>}
          <p className="text-base font-bold">Valor final a pagar: <span style={{ color: terracotta }}>{money(finalTotal)}</span></p>
        </div>
      </section>

      <section className="mt-4">
        <h2 className="text-base font-bold" style={{ color: terracotta }}>Negociação do pagamento</h2>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-snug">{data.condicoesPagamento || '—'}</p>
      </section>

      <div className="mt-10 grid grid-cols-2 gap-12 text-center text-xs text-stone-700">
        <div><div className="border-t border-stone-400 pt-2">Contratante</div><p className="mt-1">{data.cliente || ' '}</p></div>
        <div><div className="border-t border-stone-400 pt-2">Jana Confeitaria</div></div>
      </div>
    </div>
  </div>;
});

ContractPreview.displayName = 'ContractPreview';
