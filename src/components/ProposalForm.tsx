import React, { useState } from 'react';
import { ProposalData, PresetTemplate } from '../types';
import { flavorSuggestions, toppingSuggestions, presetTemplates } from '../utils/defaultData';
import { 
  Calendar, User, Users, MapPin, Clock, 
  Sparkles, DollarSign, Plus, Trash2, 
  Palette, RefreshCw, Layers, CheckCircle,
  HelpCircle, Upload, Check
} from 'lucide-react';

interface ProposalFormProps {
  data: ProposalData;
  onChange: (updatedData: ProposalData) => void;
  onReset: () => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({
  data,
  onChange,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'evento' | 'servico' | 'sabores' | 'valores' | 'estilo'>('evento');
  const [newSaborInput, setNewSaborInput] = useState('');
  const [newConfeitoInput, setNewConfeitoInput] = useState('');
  const [newBulletInput, setNewBulletInput] = useState('');

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

  // Apply preset template
  const handleApplyPreset = (preset: PresetTemplate) => {
    onChange({
      ...data,
      ...preset.data,
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden text-slate-800">
      {/* Header with Quick Presets */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-slate-900 text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Editar Orçamento
          </h2>
          <p className="text-xs text-slate-500">
            Atualização em tempo real na folha ao lado
          </p>
        </div>

        {/* Quick Presets Dropdown */}
        <div className="flex items-center gap-2">
          <select
            id="preset-selector"
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            onChange={(e) => {
              const selected = presetTemplates.find(p => p.id === e.target.value);
              if (selected) handleApplyPreset(selected);
            }}
            defaultValue=""
          >
            <option value="" disabled>Carregar Pacote Rápido...</option>
            {presetTemplates.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <button
            id="btn-reset-form"
            onClick={onReset}
            title="Redefinir para valores iniciais"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Mobile-Friendly Horizontal Scroll) */}
      <div className="flex border-b border-slate-200 bg-white overflow-x-auto no-scrollbar px-2 pt-2 gap-1 text-xs">
        <button
          id="tab-evento"
          onClick={() => setActiveTab('evento')}
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
          onClick={() => setActiveTab('servico')}
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
          onClick={() => setActiveTab('sabores')}
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
          onClick={() => setActiveTab('valores')}
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
          onClick={() => setActiveTab('estilo')}
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

      {/* Tab Panels */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
        
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Itens da Descrição (Lista no Orçamento)
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
                  className="text-[11px] text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  Restaurar padrão
                </button>
              </div>

              {/* Dynamic Bullets List */}
              <div className="space-y-2">
                {data.itensDescricao.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 group">
                    <span className="text-xs font-bold text-indigo-600 mt-2 shrink-0">
                      {idx + 1}.
                    </span>
                    <textarea
                      rows={2}
                      value={bullet}
                      onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                    />
                    <button
                      onClick={() => handleRemoveBullet(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors mt-1 cursor-pointer"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Item */}
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newBulletInput}
                  onChange={(e) => setNewBulletInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBullet()}
                  placeholder="Adicionar novo item de serviço..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  onClick={handleAddBullet}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SABORES & CONFEITOS */}
        {activeTab === 'sabores' && (
          <div className="space-y-5">
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
              <div className="flex flex-wrap gap-1.5 mb-2">
                {data.saboresLista.map((sabor, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-md border border-slate-200 font-medium"
                  >
                    {sabor}
                    <button
                      onClick={() => handleRemoveSabor(idx)}
                      className="text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Input for adding custom flavor */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSaborInput}
                  onChange={(e) => setNewSaborInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSabor(newSaborInput)}
                  placeholder="Nome do sabor de brigadeiro..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  onClick={() => handleAddSabor(newSaborInput)}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium cursor-pointer shadow-xs transition-colors"
                >
                  + Sabor
                </button>
              </div>

              {/* Suggestions Chips */}
              <div className="text-[11px] text-slate-500">
                <span className="font-medium text-slate-600 block mb-1">Sugestões rápidas:</span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {flavorSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddSabor(sug)}
                      disabled={data.saboresLista.includes(sug)}
                      className={`text-[10.5px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        data.saboresLista.includes(sug)
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'
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
              <div className="flex flex-wrap gap-1.5 mb-2">
                {data.confeitosLista.map((conf, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-md border border-slate-200 font-medium"
                  >
                    {conf}
                    <button
                      onClick={() => handleRemoveConfeito(idx)}
                      className="text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Input for adding custom topping */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newConfeitoInput}
                  onChange={(e) => setNewConfeitoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddConfeito(newConfeitoInput)}
                  placeholder="Nome do confeito..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  onClick={() => handleAddConfeito(newConfeitoInput)}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium cursor-pointer shadow-xs transition-colors"
                >
                  + Confeito
                </button>
              </div>

              {/* Suggestions Chips for Toppings */}
              <div className="text-[11px] text-slate-500">
                <span className="font-medium text-slate-600 block mb-1">Sugestões de confeitos:</span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {toppingSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddConfeito(sug)}
                      disabled={data.confeitosLista.includes(sug)}
                      className={`text-[10.5px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        data.confeitosLista.includes(sug)
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'
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
                rows={2}
                value={data.condicoesPagamento}
                onChange={(e) => handleChange('condicoesPagamento', e.target.value)}
                placeholder="Ex: 50% na reserva e 50% até a semana do evento via Pix ou Cartão."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Observações / Validade */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações Adicionais / Validade da Proposta
              </label>
              <textarea
                id="input-observacoes"
                rows={2}
                value={data.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Ex: Proposta válida por 10 dias. Consulte taxa de deslocamento."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
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
        {activeTab === 'estilo' && (
          <div className="space-y-4">
            
            {/* Escolher Cor do Banner */}
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
                      handleChange('bannerType', 'vector');
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      data.bannerTheme === t.id && data.bannerType === 'vector'
                        ? 'border-indigo-600 bg-indigo-50/60 font-semibold ring-2 ring-indigo-500/20 text-indigo-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 shadow-xs flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: t.color }}
                    >
                      {data.bannerTheme === t.id && data.bannerType === 'vector' && <Check className="w-3 h-3" />}
                    </span>
                    <span className="truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload de Imagem Customizada */}
            <div className="pt-3 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Imagem Customizada de Cabeçalho</span>
                {data.bannerCustomImage && (
                  <button
                    onClick={() => handleChange('bannerType', 'vector')}
                    className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                  >
                    Usar vetor padrão
                  </button>
                )}
              </label>
              
              <div className="mt-1 flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  Carregar imagem do cabeçalho...
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {data.bannerCustomImage && (
                  <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Imagem ativa
                  </span>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
