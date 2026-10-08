export interface Chamado {
  id: string;
  titulo: string;
  descricao: string;
  status: string; // ABERTO, EM_PROCESSAMENTO, CONCLUIDO
  criadoEm: string;
  usuarioId?: string;
}

export interface CriarChamadoDTO {
  titulo: string;
  descricao: string;
}

export interface MensagemLog {
  id?: number | string;
  chamadoId?: string;
  tipo: string; // DISPARO, FILA, WORKER, SUCESSO
  mensagem: string;
  timestamp: string;
  threadName?: string;
}
