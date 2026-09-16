export interface ProposalData {
  contractType?: 'carrinho' | 'docinhos';
  // Dados do Cabeçalho e Cliente
  data: string;
  cliente: string;
  convidados: string;
  local: string;
  
  // Horários e Duração
  horarioInicio: string;
  horarioFim: string;
  horasAtendimento: number;
  usarHorarioManual: boolean;
  horarioManual: string;

  // Itens da Descrição e Carrinho
  saboresQtd: number;
  saboresLista: string[];
  confeitosQtd: number;
  confeitosLista: string[];
  combinacoesCalculadas: number;
  
  // Lista de itens/bullets descritivos
  itensDescricao: string[];
  
  // Valores e Pagamento
  valorTotal: string;
  condicoesPagamento: string;
  observacoes: string;
  
  // Contato e Identidade
  contatoNome: string;
  contatoTelefone: string;
  contatoInstagram: string;
  
  // Configurações Visuais
  bannerType: 'vector' | 'image';
  bannerCustomImage?: string;
  bannerTheme: 'terracotta' | 'caramel' | 'rose' | 'chocolate' | 'burgundy';
  docStyle: 'original' | 'modern';
  docinhosItens?: DocinhoItem[];
  servicos?: ServiceItem[];
}

export interface DocinhoItem {
  id: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface ServiceItem {
  id: string;
  descricao: string;
  valor: number;
}

export interface PresetTemplate {
  id: string;
  nome: string;
  descricao: string;
  data: Partial<ProposalData>;
}
