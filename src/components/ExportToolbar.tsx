import React, { useState } from 'react';
import { 
  FileDown, Image as ImageIcon, MessageCircle, 
  Printer, Check, Loader2, ZoomIn, ZoomOut, Maximize2, Share2, Copy
} from 'lucide-react';
import { ProposalData } from '../types';
import { exportToPdf, exportToImage, formatWhatsAppText } from '../utils/exportUtils';

interface ExportToolbarProps {
  data: ProposalData;
  documentRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onFitZoom: () => void;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  data,
  documentRef,
  zoom,
  onZoomChange,
  onFitZoom,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingImg, setIsExportingImg] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleExportPdf = async () => {
    if (!documentRef.current) return;
    setIsExportingPdf(true);
    setStatusMessage('Gerando PDF...');
    try {
      await exportToPdf(documentRef.current, data, (msg) => setStatusMessage(msg));
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      setStatusMessage('Erro ao gerar PDF. Tente novamente.');
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportImage = async (format: 'png' | 'jpeg' = 'png') => {
    if (!documentRef.current) return;
    setIsExportingImg(true);
    setStatusMessage(`Gerando ${format.toUpperCase()}...`);
    try {
      await exportToImage(documentRef.current, data, format, (msg) => setStatusMessage(msg));
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      setStatusMessage('Erro ao gerar imagem. Tente novamente.');
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsExportingImg(false);
    }
  };

  const handleCopyWhatsApp = () => {
    const text = formatWhatsAppText(data);
    navigator.clipboard.writeText(text);
    setCopiedWhatsapp(true);
    setStatusMessage('Texto copiado para a área de transferência!');
    setTimeout(() => {
      setCopiedWhatsapp(false);
      setStatusMessage(null);
    }, 3000);
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(formatWhatsAppText(data));
    const phone = data.contatoTelefone.replace(/\D/g, '');
    const url = phone ? `https://wa.me/55${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-4 sm:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Quick Actions & Status */}
        <div className="flex items-center gap-2">
          {/* Main 1-Click PDF Export Button */}
          <button
            id="btn-export-pdf"
            onClick={handleExportPdf}
            disabled={isExportingPdf || isExportingImg}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg font-medium text-xs sm:text-sm shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            title="Exportar documento completo em PDF com 1 clique"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FileDown className="w-4 h-4 text-indigo-200" />
            )}
            <span>{isExportingPdf ? 'Exportando...' : 'Exportar PDF'}</span>
          </button>

          {/* 1-Click Image Export */}
          <button
            id="btn-export-image"
            onClick={() => handleExportImage('png')}
            disabled={isExportingPdf || isExportingImg}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            title="Salvar imagem PNG em alta resolução"
          >
            {isExportingImg ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <ImageIcon className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden sm:inline">Salvar Imagem (PNG)</span>
            <span className="sm:hidden">Imagem</span>
          </button>

          {/* WhatsApp / Share Dropdown */}
          <div className="relative">
            <button
              id="btn-share-whatsapp"
              onClick={() => setShowShareModal(!showShareModal)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-medium text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              title="Opções de compartilhamento via WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            {showShareModal && (
              <div 
                className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 text-xs space-y-1"
                onMouseLeave={() => setShowShareModal(false)}
              >
                <button
                  onClick={() => {
                    handleCopyWhatsApp();
                    setShowShareModal(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium transition-colors"
                >
                  {copiedWhatsapp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span>Copiar Resumo em Texto</span>
                </button>

                <button
                  onClick={() => {
                    handleOpenWhatsApp();
                    setShowShareModal(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 text-emerald-800 font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Abrir no WhatsApp Web</span>
                </button>
              </div>
            )}
          </div>

          {/* Native Print */}
          <button
            id="btn-print-doc"
            onClick={handlePrint}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden sm:flex items-center"
            title="Imprimir orçamento"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Center / Status Toast Feedback */}
        {statusMessage && (
          <div className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-900 rounded-full border border-indigo-200 animate-fade-in flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            {statusMessage}
          </div>
        )}

        {/* Right: Zoom & Preview Viewport Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs text-slate-600">
          <button
            onClick={() => onZoomChange(Math.max(0.35, zoom - 0.1))}
            className="p-1 hover:bg-white hover:text-slate-900 rounded transition-colors"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          
          <span className="px-1.5 font-medium min-w-[3rem] text-center text-[11px] text-slate-700">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => onZoomChange(Math.min(1.4, zoom + 0.1))}
            className="p-1 hover:bg-white hover:text-slate-900 rounded transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-slate-300 mx-0.5" />

          <button
            onClick={onFitZoom}
            className="px-2 py-0.5 hover:bg-white hover:text-slate-900 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
            title="Ajustar automaticamente à tela"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Ajustar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
