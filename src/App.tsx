/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ProposalData } from './types';
import { initialProposalData } from './utils/defaultData';
import { ProposalForm } from './components/ProposalForm';
import { ProposalPreview } from './components/ProposalPreview';
import { ExportToolbar } from './components/ExportToolbar';
import { 
  FileText, Edit3, Eye, Sparkles, Download, 
  Check, Save, RotateCcw, Smartphone, Laptop
} from 'lucide-react';

const STORAGE_KEY = 'jana_confeitaria_proposal_draft_v1';

export default function App() {
  const [data, setData] = useState<ProposalData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar dados salvos:', e);
    }
    return initialProposalData;
  });

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
    if (window.confirm('Deseja realmente redefinir o orçamento para os valores originais?')) {
      setData(initialProposalData);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      
      {/* Sleek Top Application Header */}
      <header className="bg-white text-slate-900 border-b border-slate-200 px-4 sm:px-8 py-3.5 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm font-serif font-black text-lg">
              J
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
                  Jana Confeitaria
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md hidden sm:inline">
                  Gerador de Orçamento
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Edição em tempo real & Exportação instantânea
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
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-md border border-slate-200 hidden md:inline">
              Carrinho de Brigadeiros Gourmet
            </span>
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

      {/* Mobile Switcher Tab (Visible only on mobile/tablet) */}
      <div className="lg:hidden bg-slate-100 border-b border-slate-200 p-1.5 flex gap-1.5 sticky top-[57px] z-20">
        <button
          id="btn-mobile-tab-form"
          onClick={() => setMobileTab('form')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
            mobileTab === 'form'
              ? 'bg-white text-indigo-600 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-4 h-4 text-indigo-600" />
          <span>Formulário de Edição</span>
        </button>

        <button
          id="btn-mobile-tab-preview"
          onClick={() => {
            setMobileTab('preview');
            setTimeout(handleAutoFitZoom, 50);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
            mobileTab === 'preview'
              ? 'bg-white text-indigo-600 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4 text-indigo-600" />
          <span>Pré-Visualização (A4)</span>
        </button>
      </div>

      {/* Main Responsive Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Dynamic Form (5 cols on Desktop) */}
        <section
          id="section-form-panel"
          className={`lg:col-span-5 h-[calc(100vh-140px)] sticky top-[72px] ${
            mobileTab === 'form' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ProposalForm
            data={data}
            onChange={(updated) => setData(updated)}
            onReset={handleResetData}
          />
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
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              Visualização Fiel ao Documento
            </span>
            <span className="hidden sm:inline text-slate-400">
              Padrão A4 pronto para exportação
            </span>
          </div>

          {/* Canvas Viewport Backdrop */}
          <div className="w-full bg-slate-100 rounded-xl p-4 sm:p-6 md:p-8 flex justify-center items-start overflow-x-auto shadow-xs border border-slate-200 min-h-[700px]">
            <ProposalPreview
              ref={documentRef}
              data={data}
              scale={zoom}
              highlightChanges={highlightChanges}
            />
          </div>

          {/* Quick tips under preview */}
          <div className="mt-3 text-center text-xs text-slate-400 flex items-center justify-center gap-4">
            <span>Sincronização em tempo real</span>
            <span>•</span>
            <span>Alta resolução (300 DPI)</span>
          </div>
        </section>

      </main>

    </div>
  );
}
