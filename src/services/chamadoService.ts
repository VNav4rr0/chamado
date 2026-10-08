import { Chamado, MensagemLog } from '../types/chamado';
import { requestApi } from './api';

let chamadosLocais: Chamado[] = [
  {
    id: 'CH-1001',
    titulo: 'Instalação do Docker e Java 21',
    descricao: 'Preparar máquinas para desenvolvimento e testes práticos.',
    status: 'CONCLUIDO',
    criadoEm: '07/10/2026 14:30:00',
    usuarioId: 'admin',
  },
  {
    id: 'CH-1002',
    titulo: 'Instabilidade na conexão do Bloco B',
    descricao: 'Roteador do segundo andar apresenta oscilações frequentes.',
    status: 'EM_PROCESSAMENTO',
    criadoEm: '07/10/2026 15:45:00',
    usuarioId: 'user',
  },
];

let logsLocais: MensagemLog[] = [
  {
    id: 'log-1',
    tipo: 'SUCESSO',
    mensagem: 'Sistema pronto. Fila de mensageria assíncrona conectada ao banco H2.',
    timestamp: new Date().toLocaleTimeString(),
  },
];

export class ChamadoService {
  public static async listarChamados(): Promise<Chamado[]> {
    try {
      const data = await requestApi<Chamado[]>('/api/chamados');
      if (Array.isArray(data) && data.length > 0) {
        chamadosLocais = data;
        return data;
      }
    } catch (e: any) {
      console.log('Backend offline, usando dados locais de chamados:', e.message);
    }
    return [...chamadosLocais];
  }

  public static async criarChamado(
    titulo: string,
    descricao: string,
    usuarioId: string = 'admin'
  ): Promise<Chamado> {
    try {
      const novo = await requestApi<Chamado>('/api/chamados', {
        method: 'POST',
        body: JSON.stringify({ titulo: titulo.trim(), descricao: descricao.trim() }),
      });
      chamadosLocais.unshift(novo);
      return novo;
    } catch (e: any) {
      console.log('Backend offline, gerando chamado no buffer local:', e.message);
      const novoLocal: Chamado = {
        id: `CH-${Date.now().toString().slice(-4)}`,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        status: 'ABERTO',
        criadoEm: new Date().toLocaleString(),
        usuarioId,
      };
      chamadosLocais.unshift(novoLocal);
      return novoLocal;
    }
  }

  public static async obterLogsMensageria(): Promise<MensagemLog[]> {
    try {
      const logs = await requestApi<MensagemLog[]>('/api/mensageria/logs');
      if (Array.isArray(logs) && logs.length > 0) {
        return logs;
      }
    } catch (e: any) {
      // Backend offline, usa logs locais
    }
    return [...logsLocais];
  }

  public static async registrarLogSimulado(tipo: string, mensagem: string, chamadoId?: string): Promise<MensagemLog> {
    const log: MensagemLog = {
      id: `log-${Date.now()}`,
      chamadoId,
      tipo,
      mensagem,
      timestamp: new Date().toLocaleTimeString(),
      threadName: 'worker-async-pool',
    };
    logsLocais.unshift(log);
    return log;
  }
}
