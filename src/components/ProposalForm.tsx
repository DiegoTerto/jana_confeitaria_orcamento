import React, { useRef, useState } from 'react';
import { ProposalData } from '../types';
import { flavorSuggestions, toppingSuggestions } from '../utils/defaultData';
import { 
  Calendar, User, Users, MapPin, Clock, 
  Sparkles, DollarSign, Plus, Trash2, 
  Palette, RefreshCw, Layers, CheckCircle,
  HelpCircle, Upload, Check, ChevronLeft, ChevronRight
} from 'lucide-react';

interface ProposalFormProps {
  data: ProposalData;
  onChange: (updatedData: ProposalData) => void;
  onReset: () => void;
  onReview: () => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({
  data,
  onChange,
  onReset,
  onReview,
}) => {
  const [activeTab, setActiveTab] = useState<'evento' | 'servico' | 'sabores' | 'valores' | 'estilo'>('evento');
  const contentRef = useRef<HTMLDivElement>(null);
  const [newSaborInput, setNewSaborInput] = useState('');
  const [newConfeitoInput, setNewConfeitoInput] = useState('');
  const [newBulletInput, setNewBulletInput] = useState('');

  const mobileSteps = [
    { id: 'evento' as const, label: 'Evento', icon: User },
    { id: 'oferta' as const, label: 'Oferta', icon: Sparkles, tab: 'servico' as const },
    { id: 'finalizar' as const, label: 'Finalizar', icon: DollarSign, tab: 'valores' as const },
  ];
  const activeMobileStep = activeTab === 'evento' ? 0 : activeTab === 'servico' || activeTab === 'sabores' ? 1 : 2;
  const goToTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goToMobileStep = (index: number) => goToTab(index === 0 ? 'evento' : index === 1 ? 'servico' : 'valores');

  // Handle direct field change
  const handleChange = <K extends keyof ProposalData>(field: K, value: ProposalData[K]) => {
    const updated = { ...data, [field]: value };
    
    // Auto calculate combinations
    if (field === 'saboresQtd' || field === 'confeitosQtd') {
      const s = field === 'saboresQtd' ? Number(value) : data.saboresQtd;
      const c = field === 'confeitosQtd' ? Number(value) : data.confeitosQtd;
      updated.combinacoesCalculadas = (s || 1) * (c || 1);
    }

    onChange(updated);
  };

  // Auto calculate hours from time inputs
  const handleTimeChange = (type: 'inicio' | 'fim', value: string) => {
    const inicio = type === 'inicio' ? value : data.horarioInicio;
    const fim = type === 'fim' ? value : data.horarioFim;

    let horasCalc = data.horasAtendimento;
    if (inicio && fim) {
      const [h1, m1] = inicio.split(':').map(Number);
      const [h2, m2] = fim.split(':').map(Number);
      if (!isNaN(h1) && !isNaN(h2)) {
        let diff = (h2 * 60 + (m2 || 0)) - (h1 * 60 + (m1 || 0));
        if (diff < 0) diff += 24 * 60; // Next day
        const hrs = Math.max(1, Math.round(diff / 60));
        horasCalc = hrs;
      }
    }

    const updated: ProposalData = {
      ...data,
      horarioInicio: inicio,
      horarioFim: fim,
      horasAtendimento: horasCalc,
    };

    // Also auto-update the bullet point if it references hours
    if (!data.usarHorarioManual) {
      updated.itensDescricao = data.itensDescricao.map((item, idx) => {
        if (idx === 0 && item.includes('Carrinho de brigadeiros com atendimento')) {
          return `Carrinho de brigadeiros com atendimento durante ${horasCalc} horas;`;
        }
        return item;
      });
    }

    onChange(updated);
  };

  // Flavor helpers
  const handleAddSabor = (sabor: string) => {
    if (!sabor.trim() || data.saboresLista.includes(sabor.trim())) return;
    const updatedList = [...data.saboresLista, sabor.trim()];
    onChange({
      ...data,
      saboresLista: updatedList,
      saboresQtd: updatedList.length,
      combinacoesCalculadas: updatedList.length * (data.confeitosLista.length || data.confeitosQtd || 1),
    });
    setNewSaborInput('');
  };

  const handleRemoveSabor = (index: number) => {
    const updatedList = data.saboresLista.filter((_, i) => i !== index);
    onChange({
      ...data,
      saboresLista: updatedList,
      saboresQtd: Math.max(1, updatedList.length),
      combinacoesCalculadas: Math.max(1, updatedList.length) * (data.confeitosLista.length || data.confeitosQtd || 1),
    });
  };

  // Confeitos helpers
  const handleAddConfeito = (confeito: string) => {
    if (!confeito.trim() || data.confeitosLista.includes(confeito.trim())) return;
    const updatedList = [...data.confeitosLista, confeito.trim()];
    onChange({
      ...data,
      confeitosLista: updatedList,
      confeitosQtd: updatedList.length,
      combinacoesCalculadas: (data.saboresLista.length || data.saboresQtd || 1) * updatedList.length,
    });
    setNewConfeitoInput('');
  };

  const handleRemoveConfeito = (index: number) => {
    const updatedList = data.confeitosLista.filter((_, i) => i !== index);
    onChange({
      ...data,
      confeitosLista: updatedList,
      confeitosQtd: Math.max(1, updatedList.length),
      combinacoesCalculadas: (data.saboresLista.length || data.saboresQtd || 1) * Math.max(1, updatedList.length),
    });
  };

  // Bullet items helpers
  const handleUpdateBullet = (index: number, val: string) => {
    const updated = [...data.itensDescricao];
    updated[index] = val;
    onChange({ ...data, itensDescricao: updated });
  };

  const handleAddBullet = () => {
    if (!newBulletInput.trim()) return;
    onChange({
      ...data,
      itensDescricao: [...data.itensDescricao, newBulletInput.trim()],
    });
    setNewBulletInput('');
  };

  const handleRemoveBullet = (index: number) => {
    onChange({
      ...data,
      itensDescricao: data.itensDescricao.filter((_, i) => i !== index),
    });
  };

  // Handle custom image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({
            ...data,
            bannerType: 'image',
            bannerCustomImage: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="proposal-form bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-full overflow-hidden text-slate-800">
      {/* Header */}
      <div className="p-4 sm:p-4 border-b border-stone-200 bg-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900 text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-700" />
            Seu orçamento
          </h2>
          <p className="text-xs text-slate-500">
            Preencha com calma — a proposta atualiza sozinha.
          </p>
        </div>

        <button
          id="btn-reset-form"
          onClick={onReset}
          title="Redefinir para valores iniciais"
          className="min-w-11 min-h-11 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs (Mobile-Friendly Horizontal Scroll) */}
      <div className="hidden sm:flex border-b border-slate-200 bg-white overflow-x-auto no-scrollbar px-2 pt-2 gap-1 text-xs">
        <button
          id="tab-evento"
          onClick={() => goToTab('evento')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'evento'
              ? 'bg-indigo-50/70 text-indigo-700 border-b-2 border-indigo-600 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Dados do Evento
        </button>

        <button
          id="tab-servico"
          onClick={() => goToTab('servico')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'servico'
              ? 'bg-indigo-50/70 text-indigo-700 border-b-2 border-indigo-600 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Descrição & Itens
        </button>

        <button
          id="tab-sabores"
          onClick={() => goToTab('sabores')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'sabores'
              ? 'bg-indigo-50/70 text-indigo-700 border-b-2 border-indigo-600 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Sabores & Confeitos
        </button>

        <button
          id="tab-valores"
          onClick={() => goToTab('valores')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'valores'
              ? 'bg-indigo-50/70 text-indigo-700 border-b-2 border-indigo-600 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Valores & Pagamento
        </button>

        <button
          id="tab-estilo"
          onClick={() => goToTab('estilo')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'estilo'
              ? 'bg-indigo-50/70 text-indigo-700 border-b-2 border-indigo-600 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Visual & Banner
        </button>
      </div>

      <div className="sm:hidden border-b border-stone-200 bg-stone-50 px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-stone-600">
          <span>{mobileSteps[activeMobileStep].label}</span>
          <span className="text-rose-800">{activeMobileStep + 1} de {mobileSteps.length}</span>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-stone-200" aria-hidden="true">
          <div className="h-full rounded-full bg-rose-700 transition-all duration-300" style={{ width: `${((activeMobileStep + 1) / mobileSteps.length) * 100}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {mobileSteps.map((step, index) => {
            const Icon = step.icon;
            const selected = index === activeMobileStep;
            return (
              <button key={step.id} type="button" onClick={() => goToMobileStep(index)} aria-current={selected ? 'step' : undefined}
                className={`min-h-11 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${selected ? 'border-rose-700 bg-rose-700 text-white shadow-sm' : 'border-stone-200 bg-white text-stone-600 active:bg-stone-100'}`}>
                <Icon className="h-4 w-4" />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div ref={contentRef} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
        
        {/* TAB 1: DADOS DO EVENTO */}
        {activeTab === 'evento' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Cliente */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Nome do Cliente / Anfitrião *
                </label>
                <input
                  id="input-cliente"
                  type="text"
                  value={data.cliente}
                  onChange={(e) => handleChange('cliente', e.target.value)}
                  placeholder="Ex: Mariana Silva ou Camila & Lucas"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              {/* Data */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Data do Evento *
                </label>
                <input
                  id="input-data"
                  type="text"
                  value={data.data}
                  onChange={(e) => handleChange('data', e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              {/* Convidados */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Quantidade de Convidados *
                </label>
                <input
                  id="input-convidados"
                  type="text"
                  value={data.convidados}
                  onChange={(e) => handleChange('convidados', e.target.value)}
                  placeholder="Ex: 80 Pessoas"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              {/* Local */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Local do Evento *
                </label>
                <input
                  id="input-local"
                  type="text"
                  value={data.local}
                  onChange={(e) => handleChange('local', e.target.value)}
                  placeholder="Ex: Espaço Villa Jardim - Salão Principal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              {/* Horários */}
              <div className="sm:col-span-2 bg-slate-50/80 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Horário e Duração do Atendimento
                  </span>
                  
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.usarHorarioManual}
                      onChange={(e) => handleChange('usarHorarioManual', e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    Digitar texto manual
                  </label>
                </div>

                {!data.usarHorarioManual ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Início</span>
                      <input
                        id="input-horario-inicio"
                        type="time"
                        value={data.horarioInicio}
                        onChange={(e) => handleTimeChange('inicio', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Término</span>
                      <input
                        id="input-horario-fim"
                        type="time"
                        value={data.horarioFim}
                        onChange={(e) => handleTimeChange('fim', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Horas de Atendimento</span>
                      <input
                        id="input-horas-atendimento"
                        type="number"
                        min="1"
                        max="24"
                        value={data.horasAtendimento}
                        onChange={(e) => handleChange('horasAtendimento', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-900 font-semibold text-center focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      id="input-horario-manual"
                      type="text"
                      value={data.horarioManual}
                      onChange={(e) => handleChange('horarioManual', e.target.value)}
                      placeholder="Ex: 14:00 às 18:00 (4h de atendimento)"
                      className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: DESCRIÇÃO & ITENS INCLUSOS */}
        {activeTab === 'servico' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <label className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-700" />
                  O que está incluso
                </label>
                <button
                  onClick={() => {
                    const defaultBullets = [
                      `Carrinho de brigadeiros com atendimento durante ${data.horasAtendimento} horas;`,
                      'Brigadeiro servido à vontade para todos os convidados durante o período contratado;',
                      `Disponibilidade de ${data.saboresQtd} sabores de brigadeiro e ${data.confeitosQtd} opções de confeitos, permitindo até ${data.combinacoesCalculadas} combinações diferentes;`,
                      'Fornecimento de colheres e guardanapos descartáveis;',
                      'Atendimento realizado por profissional durante todo o evento.'
                    ];
                    handleChange('itensDescricao', defaultBullets);
                  }}
                  className="min-h-11 px-2 text-sm text-rose-800 hover:underline font-semibold cursor-pointer"
                >
                  Restaurar padrão
                </button>
              </div>

              {/* Dynamic Bullets List */}
              <div className="space-y-3">
                {data.itensDescricao.map((bullet, idx) => (
                  <div key={idx} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-600">Item {idx + 1}</span>
                      <button
                        onClick={() => handleRemoveBullet(idx)}
                        className="-mr-2 -mt-2 min-h-11 min-w-11 text-stone-400 hover:text-rose-700 transition-colors flex items-center justify-center cursor-pointer"
                        title="Excluir item"
                        aria-label={`Excluir item ${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={bullet}
                      onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                      className="w-full resize-y bg-white border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 leading-relaxed placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 transition-all"
                    />
                  </div>
                ))}
              </div>

              {/* Add New Item */}
              <div className="mt-4 rounded-xl border border-dashed border-stone-300 bg-white p-3 sm:flex sm:items-center sm:gap-2">
                <input
                  type="text"
                  value={newBulletInput}
                  onChange={(e) => setNewBulletInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBullet()}
                  placeholder="Adicionar novo item de serviço..."
                  className="w-full sm:flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 transition-all"
                />
                <button
                  onClick={handleAddBullet}
                  className="mt-2 sm:mt-0 min-h-11 w-full sm:w-auto px-4 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SABORES & CONFEITOS */}
        {(activeTab === 'sabores' || activeTab === 'servico') && (
          <div className={`space-y-5 ${activeTab === 'servico' ? 'sm:hidden' : ''}`}>
            {/* Resumo de Combinações */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-3 flex items-center justify-between text-xs text-indigo-950">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>
                  <strong>{data.saboresQtd} sabores</strong> × <strong>{data.confeitosQtd} confeitos</strong>
                </span>
              </div>
              <span className="font-bold bg-indigo-100/80 px-2 py-0.5 rounded text-indigo-900">
                = {data.combinacoesCalculadas} combinações
              </span>
            </div>

            {/* Sabores de Brigadeiro */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Sabores de Brigadeiro ({data.saboresLista.length})
                </label>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span>Qtd no texto:</span>
                  <input
                    type="number"
                    min="1"
                    value={data.saboresQtd}
                    onChange={(e) => handleChange('saboresQtd', Number(e.target.value))}
                    className="w-12 border border-slate-200 rounded px-1.5 py-0.5 text-center font-bold bg-slate-50"
                  />
                </div>
              </div>

              {/* Tag Chips for Flavors */}
              <div className="grid grid-cols-1 gap-2 mb-3">
                {data.saboresLista.map((sabor, idx) => (
                  <div
                    key={idx}
                    className="min-h-11 flex items-center gap-2 bg-stone-50 text-stone-800 text-sm px-3 rounded-xl border border-stone-200 font-medium"
                  >
                    <span className="flex-1">{sabor}</span>
                    <button
                      onClick={() => handleRemoveSabor(idx)}
                      className="-mr-2 min-h-10 min-w-10 text-stone-400 hover:text-rose-700 flex items-center justify-center cursor-pointer"
                      aria-label={`Remover ${sabor}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Input for adding custom flavor */}
              <div className="sm:flex sm:gap-2 mb-3">
                <input
                  type="text"
                  value={newSaborInput}
                  onChange={(e) => setNewSaborInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSabor(newSaborInput)}
                  placeholder="Nome do sabor de brigadeiro..."
                  className="w-full sm:flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 transition-all"
                />
                <button
                  onClick={() => handleAddSabor(newSaborInput)}
                  className="mt-2 sm:mt-0 min-h-11 w-full sm:w-auto px-4 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-sm transition-colors"
                >
                  + Sabor
                </button>
              </div>

              {/* Suggestions Chips */}
              <div className="text-sm text-stone-600">
                <span className="font-semibold text-stone-800 block mb-2">Sugestões de sabores</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {flavorSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddSabor(sug)}
                      disabled={data.saboresLista.includes(sug)}
                      className={`min-h-11 px-3 rounded-xl border text-left text-sm font-medium transition-colors cursor-pointer ${
                        data.saboresLista.includes(sug)
                          ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                          : 'bg-white text-rose-900 border-rose-100 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200'
                      }`}
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Confeitos */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Opções de Confeitos ({data.confeitosLista.length})
                </label>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span>Qtd no texto:</span>
                  <input
                    type="number"
                    min="1"
                    value={data.confeitosQtd}
                    onChange={(e) => handleChange('confeitosQtd', Number(e.target.value))}
                    className="w-12 border border-slate-200 rounded px-1.5 py-0.5 text-center font-bold bg-slate-50"
                  />
                </div>
              </div>

              {/* Tag Chips for Toppings */}
              <div className="grid grid-cols-1 gap-2 mb-3">
                {data.confeitosLista.map((conf, idx) => (
                  <div
                    key={idx}
                    className="min-h-11 flex items-center gap-2 bg-stone-50 text-stone-800 text-sm px-3 rounded-xl border border-stone-200 font-medium"
                  >
                    <span className="flex-1">{conf}</span>
                    <button
                      onClick={() => handleRemoveConfeito(idx)}
                      className="-mr-2 min-h-10 min-w-10 text-stone-400 hover:text-rose-700 flex items-center justify-center cursor-pointer"
                      aria-label={`Remover ${conf}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Input for adding custom topping */}
              <div className="sm:flex sm:gap-2 mb-3">
                <input
                  type="text"
                  value={newConfeitoInput}
                  onChange={(e) => setNewConfeitoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddConfeito(newConfeitoInput)}
                  placeholder="Nome do confeito..."
                  className="w-full sm:flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 transition-all"
                />
                <button
                  onClick={() => handleAddConfeito(newConfeitoInput)}
                  className="mt-2 sm:mt-0 min-h-11 w-full sm:w-auto px-4 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-xl text-sm font-semibold cursor-pointer shadow-sm transition-colors"
                >
                  + Confeito
                </button>
              </div>

              {/* Suggestions Chips for Toppings */}
              <div className="text-sm text-stone-600">
                <span className="font-semibold text-stone-800 block mb-2">Sugestões de confeitos</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {toppingSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddConfeito(sug)}
                      disabled={data.confeitosLista.includes(sug)}
                      className={`min-h-11 px-3 rounded-xl border text-left text-sm font-medium transition-colors cursor-pointer ${
                        data.confeitosLista.includes(sug)
                          ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                          : 'bg-white text-rose-900 border-rose-100 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200'
                      }`}
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: VALORES & PAGAMENTO */}
        {activeTab === 'valores' && (
          <div className="space-y-4">
            
            {/* Valor Total */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                Valor Total do Investimento (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">
                  R$
                </span>
                <input
                  id="input-valor-total"
                  type="text"
                  value={data.valorTotal}
                  onChange={(e) => handleChange('valorTotal', e.target.value)}
                  placeholder="1.450,00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-slate-900 text-base font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Condições de Pagamento */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Formas & Condições de Pagamento
              </label>
              <textarea
                id="input-condicoes"
                rows={4}
                value={data.condicoesPagamento}
                onChange={(e) => handleChange('condicoesPagamento', e.target.value)}
                placeholder="Ex: 50% na reserva e 50% até a semana do evento via Pix ou Cartão."
                className="w-full resize-y bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm text-stone-900 leading-relaxed placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 focus:bg-white transition-all"
              />
            </div>

            {/* Observações / Validade */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações Adicionais / Validade da Proposta
              </label>
              <textarea
                id="input-observacoes"
                rows={4}
                value={data.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Ex: Proposta válida por 10 dias. Consulte taxa de deslocamento."
                className="w-full resize-y bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm text-stone-900 leading-relaxed placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-rose-700/20 focus:border-rose-700 focus:bg-white transition-all"
              />
            </div>

            {/* Contato & Redes */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp / Telefone
                </label>
                <input
                  type="text"
                  value={data.contatoTelefone}
                  onChange={(e) => handleChange('contatoTelefone', e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={data.contatoInstagram}
                  onChange={(e) => handleChange('contatoInstagram', e.target.value)}
                  placeholder="@janaconfeitaria"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: VISUAL & BANNER */}
        {(activeTab === 'estilo' || activeTab === 'valores') && (
          <div className={`space-y-4 ${activeTab === 'valores' ? 'sm:hidden' : ''}`}>
            
            {/* Tipo de Cabeçalho */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Tipo de Cabeçalho do Orçamento
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleChange('bannerType', 'image')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    data.bannerType === 'image'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Imagem Fixa (Jana Confeitaria)
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('bannerType', 'vector')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    data.bannerType === 'vector'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Palette className="w-4 h-4 text-slate-600" />
                  Vetor Temático com Logo
                </button>
              </div>
            </div>

            {/* Escolher Cor do Banner (quando vetor) */}
            {data.bannerType === 'vector' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Paleta de Cores do Cabeçalho (Jana Confeitaria)
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'terracotta', name: 'Terracota Original', color: '#B75234' },
                    { id: 'caramel', name: 'Caramelo Quente', color: '#9C5B32' },
                    { id: 'rose', name: 'Rosé Confeitaria', color: '#9E4E5D' },
                    { id: 'chocolate', name: 'Chocolate Nobre', color: '#4A2E2B' },
                    { id: 'burgundy', name: 'Vinho Bordô', color: '#6B2535' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        handleChange('bannerTheme', t.id as any);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        data.bannerTheme === t.id
                          ? 'border-indigo-600 bg-indigo-50/60 font-semibold ring-2 ring-indigo-500/20 text-indigo-950'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full shrink-0 shadow-xs flex items-center justify-center text-white text-[10px]"
                        style={{ backgroundColor: t.color }}
                      >
                        {data.bannerTheme === t.id && <Check className="w-3 h-3" />}
                      </span>
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upload de Imagem Customizada */}
            <div className="pt-3 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Trocar por Imagem Própria / Arquivo</span>
              </label>
              
              <div className="mt-1 flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  Carregar outra imagem...
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {data.bannerType === 'image' && (
                  <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Imagem ativa no orçamento
                  </span>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      <div className="sm:hidden flex items-center gap-3 border-t border-stone-200 bg-white p-4">
        <button type="button" onClick={() => activeMobileStep > 0 && goToMobileStep(activeMobileStep - 1)} disabled={activeMobileStep === 0}
          className="min-h-12 flex-1 rounded-xl border border-stone-200 px-3 text-sm font-semibold text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>
        <button type="button" onClick={() => activeMobileStep < mobileSteps.length - 1 ? goToMobileStep(activeMobileStep + 1) : onReview()}
          className="min-h-12 flex-1 rounded-xl bg-rose-700 px-3 text-sm font-semibold text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
          {activeMobileStep === mobileSteps.length - 1 ? 'Ver prévia' : 'Continuar'} <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
