export interface Chamado {
  id: string;
  titulo: string;
  descricao: string;
  status: 'ABERTO' | 'EM_PROCESSAMENTO' | 'CONCLUIDO';
  criadoEm: string;
}

export interface CriarChamadoDTO {
  titulo: string;
  descricao: string;
}

export interface EventoMensageria {
  id: string;
  timestamp: string;
  tipo: 'DISPARO' | 'FILA' | 'PROCESSAMENTO' | 'SUCESSO';
  mensagem: string;
  chamadoId?: string;
  payload?: any;
}
