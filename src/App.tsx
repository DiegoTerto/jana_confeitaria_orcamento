/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ProposalData } from './types';
import { createCarrinhoProposal, createDocinhosProposal, initialProposalData } from './utils/defaultData';
import { ProposalForm } from './components/ProposalForm';
import { ProposalPreview } from './components/ProposalPreview';
import { DocinhosForm } from './components/DocinhosForm';
import { DocinhosPreview } from './components/DocinhosPreview';
import { ContractTypeChooser } from './components/ContractTypeChooser';
import { ExportToolbar } from './components/ExportToolbar';
import { 
  FileText, Edit3, Eye, Sparkles, Download, 
  Check, Save, RotateCcw, Smartphone, Laptop, ArrowLeftRight
} from 'lucide-react';

const STORAGE_KEY = 'jana_confeitaria_proposal_draft_v1';

export default function App() {
  const [data, setData] = useState<ProposalData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...JSON.parse(saved), contractType: JSON.parse(saved).contractType || 'carrinho' };
      }
    } catch (e) {
      console.warn('Erro ao carregar dados salvos:', e);
    }
    return initialProposalData;
  });
  const [showTypeChooser, setShowTypeChooser] = useState(() => !localStorage.getItem(STORAGE_KEY));

  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [zoom, setZoom] = useState<number>(0.85);
  const [highlightChanges, setHighlightChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const documentRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Auto-save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaveStatus('Salvo');
      const timer = setTimeout(() => setSaveStatus(null), 2000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.warn('Falha no salvamento automático:', e);
    }
  }, [data]);

  // Dynamic Auto-Fit Zoom based on screen and container width
  const handleAutoFitZoom = () => {
    if (previewContainerRef.current) {
      const containerWidth = previewContainerRef.current.clientWidth - 48; // padding
      const docWidth = 794; // A4 standard width in px
      const calculatedScale = Math.min(1.05, Math.max(0.38, containerWidth / docWidth));
      setZoom(Number(calculatedScale.toFixed(2)));
    }
  };

  // Initial fit on mount & window resize
  useEffect(() => {
    handleAutoFitZoom();
    window.addEventListener('resize', handleAutoFitZoom);
    return () => window.removeEventListener('resize', handleAutoFitZoom);
  }, []);

  const handleResetData = () => {
    if (window.confirm('Deseja iniciar um novo orçamento?')) {
      localStorage.removeItem(STORAGE_KEY);
      setData({ ...initialProposalData, contractType: 'carrinho' });
      setShowTypeChooser(true);
    }
  };

  const handleChooseType = (type: 'carrinho' | 'docinhos') => {
    if (type === 'carrinho') {
      setData(createCarrinhoProposal(data));
    } else {
      setData(createDocinhosProposal(data));
    }
    setShowTypeChooser(false);
  };

  const handleSwitchType = () => {
    if (window.confirm('Trocar o tipo vai reiniciar os itens específicos deste orçamento. Deseja continuar?')) {
      handleChooseType(data.contractType === 'docinhos' ? 'carrinho' : 'docinhos');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      
      {/* Sleek Top Application Header */}
      <header className="bg-white text-stone-900 border-b border-stone-200 px-4 sm:px-8 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-800 rounded-xl flex items-center justify-center text-white shadow-sm font-serif font-black text-lg">
              J
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-stone-900">
                  Jana Confeitaria
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded-md hidden sm:inline">
                  Gerador de Orçamento
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Orçamentos prontos para enviar
              </p>
            </div>
          </div>

          {/* Quick Auto-save indicator & Details */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {saveStatus && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Salvo automaticamente
              </span>
            )}
            <button
              type="button"
              onClick={handleSwitchType}
              className="group flex min-h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-left text-[11px] font-semibold text-rose-900 shadow-sm transition hover:border-rose-300 hover:bg-rose-100"
              title="Trocar Orçamento"
              aria-label="Trocar Orçamento"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-rose-700 shadow-xs">
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </span>
              <span className="hidden sm:block">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-rose-600">Trocar Orçamento</span>
                <span className="block max-w-[190px] truncate">{data.contractType === 'docinhos' ? 'Docinhos Tradicionais/Gourmet' : 'Carrinho Gourmet'}</span>
              </span>
              <span className="sm:hidden">Trocar Orçamento</span>
            </button>
          </div>

        </div>
      </header>

      {/* Export Toolbar Sticky Action Bar */}
      <ExportToolbar
        data={data}
        documentRef={documentRef}
        zoom={zoom}
        onZoomChange={(newZoom) => setZoom(newZoom)}
        onFitZoom={handleAutoFitZoom}
      />

      {/* Main Responsive Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 pb-24 lg:pb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Dynamic Form (5 cols on Desktop) */}
        <section
          id="section-form-panel"
          className={`lg:col-span-5 lg:h-[calc(100vh-140px)] lg:sticky lg:top-[72px] ${
            mobileTab === 'form' ? 'block' : 'hidden lg:block'
          }`}
        >
          {data.contractType === 'docinhos' ? <DocinhosForm
            data={data}
            onChange={setData}
            onReset={handleResetData}
            onReview={() => { setMobileTab('preview'); setTimeout(handleAutoFitZoom, 50); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onSwitch={handleSwitchType}
          /> : <ProposalForm
            data={data}
            onChange={(updated) => setData({ ...updated, contractType: 'carrinho' })}
            onReset={handleResetData}
            onReview={() => {
              setMobileTab('preview');
              setTimeout(handleAutoFitZoom, 50);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />}
        </section>

        {/* Right Column: Live Interactive Document Sheet (7 cols on Desktop) */}
        <section
          id="section-preview-panel"
          ref={previewContainerRef}
          className={`lg:col-span-7 flex flex-col items-center min-h-[600px] ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* Visual Header / Guidance */}
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-500 px-2">
            <span className="flex items-center gap-1.5 font-medium text-stone-700">
              <Eye className="w-3.5 h-3.5 text-rose-700" />
              Visualização Fiel ao Documento
            </span>
            <span className="hidden sm:inline text-slate-400">
              Padrão A4 pronto para exportação
            </span>
          </div>

          {/* Canvas Viewport Backdrop */}
          <div className="w-full bg-stone-100 rounded-2xl p-3 sm:p-6 md:p-8 flex justify-center items-start overflow-x-auto shadow-xs border border-stone-200 min-h-[620px]">
            {data.contractType === 'docinhos' ? <DocinhosPreview
              ref={documentRef}
              data={data}
              scale={zoom}
              highlightChanges={highlightChanges}
            /> : <ProposalPreview
              ref={documentRef}
              data={data}
              scale={zoom}
              highlightChanges={highlightChanges}
            />}
          </div>

          {/* Quick tips under preview */}
          <div className="mt-3 text-center text-xs text-slate-400 flex items-center justify-center gap-4">
            <span>Sincronização em tempo real</span>
            <span>•</span>
            <span>Alta resolução (300 DPI)</span>
          </div>
        </section>

      </main>

      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-3 pt-2 backdrop-blur-md" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }} aria-label="Navegação do orçamento">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <button id="btn-mobile-tab-form" onClick={() => { setMobileTab('form'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`min-h-12 flex-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${mobileTab === 'form' ? 'bg-rose-50 text-rose-800' : 'text-stone-600'}`}>
            <Edit3 className="w-4 h-4" /> Editar
          </button>
          <button id="btn-mobile-tab-preview" onClick={() => { setMobileTab('preview'); setTimeout(handleAutoFitZoom, 50); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`min-h-12 flex-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${mobileTab === 'preview' ? 'bg-rose-50 text-rose-800' : 'text-stone-600'}`}>
            <Eye className="w-4 h-4" /> Prévia
          </button>
          <button onClick={() => document.getElementById('btn-export-pdf')?.click()} className="min-h-12 min-w-12 rounded-xl bg-rose-800 text-white flex items-center justify-center shadow-sm" aria-label="Exportar PDF">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {showTypeChooser && <ContractTypeChooser onChoose={handleChooseType} />}

    </div>
  );
}
