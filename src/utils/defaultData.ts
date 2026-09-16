import defaultBannerImg from '../assets/images/banner.png';
import { ProposalData, PresetTemplate } from '../types';

export const DEFAULT_BANNER_IMAGE = defaultBannerImg;

export const initialProposalData: ProposalData = {
  contractType: 'carrinho',
  data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  cliente: 'Camila & Lucas',
  convidados: '100 Pessoas',
  local: 'Espaço Villa Jardim - Salão Principal',
  horarioInicio: '15:00',
  horarioFim: '19:00',
  horasAtendimento: 4,
  usarHorarioManual: false,
  horarioManual: '15:00 às 19:00 (4h de atendimento)',
  
  saboresQtd: 4,
  saboresLista: [
    'Brigadeiro Tradicional Belga',
    'Ninho com Nutella',
    'Churros com Doce de Leite',
    'Moranguinho Bicho de Pé'
  ],
  confeitosQtd: 4,
  confeitosLista: [
    'Granulado Nobre Callebaut',
    'Chocoball Crocante',
    'Amendoim Tostado',
    'Raspas de Chocolate Branco'
  ],
  combinacoesCalculadas: 16,
  
  itensDescricao: [
    'Carrinho de brigadeiros com atendimento durante 4 horas;',
    'Brigadeiro servido à vontade para todos os convidados durante o período contratado;',
    'Disponibilidade de 4 sabores de brigadeiro e 4 opções de confeitos, permitindo até 16 combinações diferentes;',
    'Fornecimento de colheres e guardanapos descartáveis;',
    'Atendimento realizado por profissional durante todo o evento.'
  ],
  
  valorTotal: '1.450,00',
  condicoesPagamento: 'Sinal de 50% na reserva da data e 50% até 5 dias úteis antes do evento. Aceitamos Pix ou Cartão de Crédito em até 3x.',
  observacoes: 'Proposta válida por 10 dias úteis a partir da data de emissão.',
  
  contatoNome: 'Jana Confeitaria',
  contatoTelefone: '(44) 99930-2941',
  contatoInstagram: '@bolos_caceiros_da_jana_',
  
  bannerType: 'image',
  bannerCustomImage: defaultBannerImg,
  bannerTheme: 'terracotta',
  docStyle: 'original'
};

export const createDocinhosProposal = (base: ProposalData = initialProposalData): ProposalData => ({
  ...base,
  contractType: 'docinhos',
  docinhosItens: [{ id: crypto.randomUUID(), nome: '', quantidade: 0, precoUnitario: 0 }],
  servicos: [],
  itensDescricao: [],
  saboresQtd: 0,
  saboresLista: [],
  confeitosQtd: 0,
  confeitosLista: [],
  combinacoesCalculadas: 0,
  valorTotal: '0,00',
});

export const createCarrinhoProposal = (base: ProposalData = initialProposalData): ProposalData => ({
  ...initialProposalData,
  cliente: base.cliente,
  data: base.data,
  convidados: base.convidados,
  local: base.local,
  horarioInicio: base.horarioInicio,
  horarioFim: base.horarioFim,
  condicoesPagamento: base.condicoesPagamento,
  observacoes: base.observacoes,
  contatoNome: base.contatoNome,
  contatoTelefone: base.contatoTelefone,
  contatoInstagram: base.contatoInstagram,
  bannerType: base.bannerType,
  bannerCustomImage: base.bannerCustomImage,
  bannerTheme: base.bannerTheme,
  docStyle: base.docStyle,
  contractType: 'carrinho',
});

export const presetTemplates: PresetTemplate[] = [
  {
    id: 'padrao-4h',
    nome: 'Carrinho Padrão (4h - 100 pessoas)',
    descricao: 'Pacote clássico com 4 sabores e 4 confeitos para 100 convidados.',
    data: {
      convidados: '100 Pessoas',
      horasAtendimento: 4,
      saboresQtd: 4,
      confeitosQtd: 4,
      combinacoesCalculadas: 16,
      valorTotal: '1.450,00'
    }
  },
  {
    id: 'aniversario-express',
    nome: 'Festa Infantil (2h - 50 pessoas)',
    descricao: 'Opção compacta ideal para aniversários e reuniões íntimas.',
    data: {
      convidados: '50 Pessoas',
      horasAtendimento: 2,
      saboresQtd: 3,
      confeitosQtd: 3,
      combinacoesCalculadas: 9,
      valorTotal: '890,00'
    }
  },
  {
    id: 'casamento-premium',
    nome: 'Casamento & 15 Anos (5h - 200 pessoas)',
    descricao: 'Pacote luxo com 6 sabores gourmet e 6 confeitos selecionados.',
    data: {
      convidados: '200 Pessoas',
      horasAtendimento: 5,
      saboresQtd: 6,
      confeitosQtd: 6,
      combinacoesCalculadas: 36,
      valorTotal: '2.400,00'
    }
  },
  {
    id: 'corporativo',
    nome: 'Evento Corporativo / Coffee Break',
    descricao: 'Atendimento corporativo com apresentação personalizada.',
    data: {
      convidados: '150 Pessoas',
      horasAtendimento: 3,
      saboresQtd: 4,
      confeitosQtd: 4,
      combinacoesCalculadas: 16,
      valorTotal: '1.600,00'
    }
  }
];

export const flavorSuggestions = [
  'Brigadeiro Tradicional Belga',
  'Ninho com Nutella',
  'Churros com Doce de Leite',
  'Moranguinho Bicho de Pé',
  'Pistache Gourmet',
  'Doce de Leite com Nozes',
  'Chocolate Meio Amargo 54%',
  'Sensação (Morango e Chocolate)',
  'Café com Cardamomo',
  'Coco Queimado',
  'Limão Siciliano com Chocolate Branco',
  'Paçoca Artesanal'
];

export const toppingSuggestions = [
  'Granulado Nobre Callebaut Ao Leite',
  'Granulado Nobre Branco',
  'Chocoball Crocante Colorido',
  'Amendoim Tostado e Moído',
  'Raspas de Chocolate Nobre',
  'Coco Ralado Tostado',
  'Pérolas de Açúcar Peroladas',
  'Ovomaltine Crocante',
  'Castanha de Caju Triturada',
  'Pistache Triturado',
  'Confeitos Coloridos Divertidos'
];
