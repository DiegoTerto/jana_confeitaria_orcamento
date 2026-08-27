export interface ProposalData {
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
}

export interface PresetTemplate {
  id: string;
  nome: string;
  descricao: string;
  data: Partial<ProposalData>;
}
