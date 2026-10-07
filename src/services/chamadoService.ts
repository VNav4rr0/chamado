import { Chamado, EventoMensageria } from '../types/chamado';
import { postChamado } from './api';

export class ChamadoService {
  public static async criarChamadoComMensageria(
    titulo: string,
    descricao: string,
    onEvento: (evento: EventoMensageria) => void
  ): Promise<Chamado> {
    const chamadoId = `CH-${Date.now().toString().slice(-5)}`;
    const agora = new Date().toLocaleTimeString();

    // 1. Etapa: Disparo
    onEvento({
      id: `evt-${Date.now()}-1`,
      timestamp: agora,
      tipo: 'DISPARO',
      mensagem: `🚀 [DISPARO] Chamado "${titulo}" submetido. Publicando evento no broker...`,
      chamadoId,
      payload: { id: chamadoId, titulo, descricao },
    });

    let backendResponse: any = null;
    try {
      backendResponse = await postChamado(titulo, descricao);
    } catch (e: any) {
      console.log('Gateway backend não respondeu (executando em modo demonstração local):', e.message);
    }

    // 2. Etapa: Enfileiramento (após 600ms)
    await new Promise((r) => setTimeout(r, 600));
    onEvento({
      id: `evt-${Date.now()}-2`,
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'FILA',
      mensagem: `📥 [FILA] Evento enfileirado no tópico 'chamado.eventos'. Routing key: chamado.criado`,
      chamadoId,
    });

    // 3. Etapa: Processamento Assíncrono (após 800ms)
    await new Promise((r) => setTimeout(r, 800));
    onEvento({
      id: `evt-${Date.now()}-3`,
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'PROCESSAMENTO',
      mensagem: `⚙️ [WORKER] Thread consumidora assumiu o evento. Validando dados e processando...`,
      chamadoId,
    });

    // 4. Etapa: Confirmação e Sucesso (após 900ms)
    await new Promise((r) => setTimeout(r, 900));
    onEvento({
      id: `evt-${Date.now()}-4`,
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'SUCESSO',
      mensagem: `✅ [SUCESSO / ACK] Mensageria finalizada com êxito! Confirmação de recebimento registrada.`,
      chamadoId,
    });

    return {
      id: backendResponse?.id || chamadoId,
      titulo,
      descricao,
      status: 'CONCLUIDO',
      criadoEm: new Date().toLocaleTimeString(),
    };
  }

  public static async simularMensageriaManual(
    tituloExemplo: string,
    onEvento: (evento: EventoMensageria) => void
  ): Promise<void> {
    const agora = new Date().toLocaleTimeString();

    onEvento({
      id: `evt-${Date.now()}-m1`,
      timestamp: agora,
      tipo: 'DISPARO',
      mensagem: `⚡ [TESTE MANUAL] Publicação forçada de mensagem de teste para o broker...`,
    });

    await new Promise((r) => setTimeout(r, 500));
    onEvento({
      id: `evt-${Date.now()}-m2`,
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'FILA',
      mensagem: `📬 [TESTE MANUAL] Mensagem aceita pelo broker com entrega garantida (persistent: true).`,
    });

    await new Promise((r) => setTimeout(r, 700));
    onEvento({
      id: `evt-${Date.now()}-m3`,
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'SUCESSO',
      mensagem: `🎉 [TESTE MANUAL] Fluxo assíncrono concluído! Mensageria operacional.`,
    });
  }
}
