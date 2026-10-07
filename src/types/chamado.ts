export type CategoriaChamado = 'REDE' | 'HARDWARE' | 'SOFTWARE' | 'ACESSO';

export type PrioridadeChamado = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';

export type StatusChamado = 
  | 'ABERTO' 
  | 'AGUARDANDO_TECNICO' 
  | 'EM_ATENDIMENTO' 
  | 'RESOLVIDO' 
  | 'CANCELADO';

export interface HistoricoChamado {
  id: string;
  chamadoId: string;
  statusAnterior: StatusChamado | null;
  statusNovo: StatusChamado;
  data: string; // ISO string
  observacao: string;
}

export interface Chamado {
  id: string;
  usuarioId: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaChamado;
  prioridade: PrioridadeChamado;
  status: StatusChamado;
  protocolo: string | null;
  tecnicoId: number | null;
  tecnicoNome?: string | null;
  slaPrazo: string | null; // ISO string
  criadoEm: string; // ISO string
  historico?: HistoricoChamado[];
}

export interface CriarChamadoDTO {
  titulo: string;
  descricao: string;
  categoria: CategoriaChamado;
  prioridade: PrioridadeChamado;
}

export interface ChamadoCriadoResponse {
  id: string;
  status: StatusChamado;
  mensagem: string;
}

export interface Tecnico {
  id: number;
  nome: string;
  especialidade: CategoriaChamado;
  cargaAtual: number;
  capacidadeMax: number;
  ativo: boolean;
  avatar?: string;
}

export interface PainelCargaResponse {
  tecnicos: Tecnico[];
  totalCarga: number;
  totalCapacidade: number;
  percentualGeral: number;
}

export const SLA_HORAS: Record<PrioridadeChamado, number> = {
  CRITICA: 4,
  ALTA: 8,
  MEDIA: 24,
  BAIXA: 72,
};

export const CATEGORIA_INFO: Record<CategoriaChamado, {
  label: string;
  icon: string;
  color: string;
  gradient: [string, string];
  bgLight: string;
  desc: string;
}> = {
  REDE: {
    label: 'Rede',
    icon: 'wifi',
    color: '#0284c7',
    gradient: ['#0284c7', '#38bdf8'],
    bgLight: '#e0f2fe',
    desc: 'Wi-Fi, Switches, Roteadores e VPN',
  },
  HARDWARE: {
    label: 'Hardware',
    icon: 'desktop-classic',
    color: '#ea580c',
    gradient: ['#ea580c', '#fb923c'],
    bgLight: '#ffedd5',
    desc: 'Monitores, Computadores e Peças',
  },
  SOFTWARE: {
    label: 'Software',
    icon: 'code-tags',
    color: '#7c3aed',
    gradient: ['#7c3aed', '#a855f7'],
    bgLight: '#f3e8ff',
    desc: 'Sistemas, Erros, Docker e IDEs',
  },
  ACESSO: {
    label: 'Acesso',
    icon: 'shield-key-outline',
    color: '#059669',
    gradient: ['#059669', '#34d399'],
    bgLight: '#d1fae5',
    desc: 'Senhas, Permissões e E-mails',
  },
};

export const PRIORIDADE_INFO: Record<PrioridadeChamado, {
  label: string;
  color: string;
  bgLight: string;
  borderLight: string;
  horas: number;
  icon: string;
}> = {
  CRITICA: {
    label: 'Crítica',
    color: '#ef4444',
    bgLight: '#fef2f2',
    borderLight: '#fecaca',
    horas: 4,
    icon: 'fire',
  },
  ALTA: {
    label: 'Alta',
    color: '#f97316',
    bgLight: '#fff7ed',
    borderLight: '#fed7aa',
    horas: 8,
    icon: 'alert-circle-outline',
  },
  MEDIA: {
    label: 'Média',
    color: '#eab308',
    bgLight: '#fefce8',
    borderLight: '#fef08a',
    horas: 24,
    icon: 'clock-time-four-outline',
  },
  BAIXA: {
    label: 'Baixa',
    color: '#10b981',
    bgLight: '#f0fdf4',
    borderLight: '#bbf7d0',
    horas: 72,
    icon: 'check-circle-outline',
  },
};

export const STATUS_INFO: Record<StatusChamado, {
  label: string;
  color: string;
  bgLight: string;
  borderLight: string;
  icon: string;
}> = {
  ABERTO: {
    label: 'Aberto',
    color: '#3b82f6',
    bgLight: '#eff6ff',
    borderLight: '#bfdbfe',
    icon: 'clock-fast',
  },
  AGUARDANDO_TECNICO: {
    label: 'Fila de Espera',
    color: '#f59e0b',
    bgLight: '#fffbeb',
    borderLight: '#fde68a',
    icon: 'timer-sand',
  },
  EM_ATENDIMENTO: {
    label: 'Em Atendimento',
    color: '#8b5cf6',
    bgLight: '#f5f3ff',
    borderLight: '#ddd6fe',
    icon: 'progress-wrench',
  },
  RESOLVIDO: {
    label: 'Resolvido',
    color: '#10b981',
    bgLight: '#ecfdf5',
    borderLight: '#a7f3d0',
    icon: 'check-decagram',
  },
  CANCELADO: {
    label: 'Cancelado',
    color: '#94a3b8',
    bgLight: '#f8fafc',
    borderLight: '#e2e8f0',
    icon: 'close-circle-outline',
  },
};
