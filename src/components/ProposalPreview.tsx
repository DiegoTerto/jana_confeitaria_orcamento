import React, { forwardRef } from 'react';
import { ProposalData } from '../types';
import { HeaderBanner } from './HeaderBanner';

interface ProposalPreviewProps {
  data: ProposalData;
  scale?: number;
  highlightChanges?: boolean;
}

export const ProposalPreview = forwardRef<HTMLDivElement, ProposalPreviewProps>(
  ({ data, scale = 1, highlightChanges = false }, ref) => {
    // Horário formatado
    const formattedHorario = data.usarHorarioManual
      ? data.horarioManual
      : `${data.horarioInicio || '00:00'} às ${data.horarioFim || '00:00'} (${data.horasAtendimento}h de atendimento)`;

    return (
      <div className="flex justify-center items-start w-full overflow-hidden transition-all duration-200">
        <div
          id="proposal-document-sheet"
          ref={ref}
          className="bg-white text-black shadow-2xl origin-top transition-transform duration-150 relative print:shadow-none print:m-0"
          style={{
            width: '794px', // A4 standard width at 96 DPI
            minHeight: '1123px', // A4 standard height at 96 DPI
            padding: '36px 48px 48px 48px',
            fontFamily: '"Montserrat", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top center',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box'
          }}
        >
          {/* Header Banner */}
          <div className="w-full mb-8" id="banner-container">
            <HeaderBanner
              bannerType={data.bannerType}
              customImage={data.bannerCustomImage}
              theme={data.bannerTheme}
            />
          </div>

          {/* Document Content - Matches exact HTML structure */}
          <div className="px-4 space-y-4 text-[17px] leading-relaxed text-stone-900">
            
            {/* Event & Client Meta Information */}
            <div className="space-y-3.5 pt-1">
              <p className="flex items-baseline">
                <span className="font-bold text-[18px] text-black w-32 shrink-0">Data:</span>
                <span className={`text-[17.5px] ${highlightChanges ? 'bg-amber-100/70 px-1 rounded' : ''}`}>
                  {data.data || '00/00/0000'}
                </span>
              </p>

              <p className="flex items-baseline">
                <span className="font-bold text-[18px] text-black w-32 shrink-0">Cliente:</span>
                <span className={`text-[17.5px] font-medium ${highlightChanges ? 'bg-amber-100/70 px-1 rounded' : ''}`}>
                  {data.cliente || 'Nome do Cliente'}
                </span>
              </p>

              <p className="flex items-baseline">
                <span className="font-bold text-[18px] text-black w-32 shrink-0">Convidados:</span>
                <span className={`text-[17.5px] ${highlightChanges ? 'bg-amber-100/70 px-1 rounded' : ''}`}>
                  {data.convidados || 'X Pessoas'}
                </span>
              </p>

              <p className="flex items-baseline">
                <span className="font-bold text-[18px] text-black w-32 shrink-0">Local:</span>
                <span className={`text-[17.5px] ${highlightChanges ? 'bg-amber-100/70 px-1 rounded' : ''}`}>
                  {data.local || 'Local do Evento'}
                </span>
              </p>

              <p className="flex items-baseline">
                <span className="font-bold text-[18px] text-black w-32 shrink-0">Horário:</span>
                <span className={`text-[17.5px] ${highlightChanges ? 'bg-amber-100/70 px-1 rounded' : ''}`}>
                  {formattedHorario}
                </span>
              </p>
            </div>

            {/* Divisor or Spacing */}
            <div className="py-2" />

            {/* Descrição Section */}
            <div className="space-y-3">
              <p className="font-bold text-[18.5px] text-black tracking-wide">
                Descrição:
              </p>

              <ul className="space-y-2.5 pl-6 list-disc marker:text-black">
                {data.itensDescricao && data.itensDescricao.length > 0 ? (
                  data.itensDescricao.map((item, idx) => {
                    // Highlight bold segments if matching template phrases
                    return (
                      <li key={idx} className="text-[17px] text-stone-900 leading-normal pl-1">
                        <span dangerouslySetInnerHTML={{ __html: formatBoldInDescription(item) }} />
                      </li>
                    );
                  })
                ) : (
                  <>
                    <li className="text-[17px] text-stone-900">
                      Carrinho de brigadeiros com atendimento durante <strong>{data.horasAtendimento} horas</strong>;
                    </li>
                    <li className="text-[17px] text-stone-900">
                      Brigadeiro servido <strong>à vontade</strong> para todos os convidados durante o período contratado;
                    </li>
                    <li className="text-[17px] text-stone-900">
                      Disponibilidade de <strong>{data.saboresQtd} sabores de brigadeiro</strong> e <strong>{data.confeitosQtd} opções de confeitos</strong>, permitindo até <strong>{data.combinacoesCalculadas} combinações diferentes</strong>;
                    </li>
                    <li className="text-[17px] text-stone-900">
                      Fornecimento de colheres e guardanapos descartáveis;
                    </li>
                    <li className="text-[17px] text-stone-900">
                      Atendimento realizado por profissional durante todo o evento.
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Divisor or Spacing */}
            <div className="py-2" />

            {/* Investimento Section */}
            <div className="space-y-3 pt-2">
              <p className="font-bold text-[18.5px] text-black tracking-wide">
                Investimento:
              </p>

              <div className="pl-6">
                <p className="text-[18px] font-bold text-black flex items-center gap-2">
                  <span>Valor Total:</span>
                  <span className="text-amber-900 text-[20px] font-black tracking-tight">
                    R$ {data.valorTotal || '0,00'}
                  </span>
                </p>

                {data.condicoesPagamento && (
                  <p className="text-[14px] text-stone-600 mt-2 leading-relaxed">
                    <span className="font-semibold text-stone-800">Forma de pagamento: </span>
                    {data.condicoesPagamento}
                  </p>
                )}
              </div>
            </div>

            {/* Observações / Validade (Opcional) */}
            {data.observacoes && (
              <div className="pt-4 mt-4 border-t border-stone-100 text-[13.5px] text-stone-600 pl-6">
                <p className="italic">
                  <span className="font-semibold not-italic text-stone-700">Observações: </span>
                  {data.observacoes}
                </p>
              </div>
            )}

            {/* Rodapé institucional sutil */}
            <div className="pt-10 mt-6 border-t border-stone-200/80 flex justify-between items-center text-[12.5px] text-stone-500">
              <div className="font-medium text-stone-700">
                {data.contatoNome || 'Jana Confeitaria'}
              </div>
              <div className="flex gap-4">
                {data.contatoTelefone && <span>WhatsApp: {data.contatoTelefone}</span>}
                {data.contatoInstagram && <span>Instagram: {data.contatoInstagram}</span>}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
);

ProposalPreview.displayName = 'ProposalPreview';

// Helper to preserve bold tags in bullet strings if generated dynamically
function formatBoldInDescription(text: string): string {
  // If the text already has html tags, return it
  if (text.includes('<strong>') || text.includes('<b>')) {
    return text;
  }

  // Highlight key phrases automatically
  return text
    .replace(/(durante\s+)(\d+\s+horas)/gi, '$1<strong>$2</strong>')
    .replace(/(à\s+vontade)/gi, '<strong>$1</strong>')
    .replace(/(\d+\s+sabores\s+de\s+brigadeiro)/gi, '<strong>$1</strong>')
    .replace(/(\d+\s+opções\s+de\s+confeitos)/gi, '<strong>$1</strong>')
    .replace(/(\d+\s+combinações\s+diferentes)/gi, '<strong>$1</strong>')
    .replace(/(profissional\s+durante\s+todo\s+o\s+evento)/gi, '<strong>$1</strong>');
}
