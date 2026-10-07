import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Chamado,
  CriarChamadoDTO,
  PainelCargaResponse,
  SLA_HORAS,
  Tecnico,
  ChamadoCriadoResponse,
  HistoricoChamado,
} from '../types/chamado';
import { INITIAL_CHAMADOS, INITIAL_TECNICOS } from './mockData';

const STORAGE_CHAMADOS = '@central_chamados_chamados_v1';
const STORAGE_TECNICOS = '@central_chamados_tecnicos_v1';
const STORAGE_PROTOCOLO_SEQ = '@central_chamados_seq_v1';

type EventListener = (chamado: Chamado) => void;

class MockService {
  private listeners: EventListener[] = [];
  private currentSeq = 105;

  public subscribe(listener: EventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(chamado: Chamado) {
    this.listeners.forEach((listener) => {
      try {
        listener(chamado);
      } catch (e) {
        console.error('Erro no listener:', e);
      }
    });
  }

  public async getChamados(usuarioId?: string): Promise<Chamado[]> {
    const data = await AsyncStorage.getItem(STORAGE_CHAMADOS);
    let list: Chamado[] = data ? JSON.parse(data) : INITIAL_CHAMADOS;
    if (usuarioId) {
      list = list.filter((c) => c.usuarioId === usuarioId);
    }
    // Ordena do mais recente para o mais antigo
    return list.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  }

  public async getChamadoById(id: string): Promise<Chamado | null> {
    const list = await this.getChamados();
    return list.find((c) => c.id === id) || null;
  }

  public async getTecnicos(): Promise<Tecnico[]> {
    const data = await AsyncStorage.getItem(STORAGE_TECNICOS);
    return data ? JSON.parse(data) : INITIAL_TECNICOS;
  }

  public async getPainelCarga(): Promise<PainelCargaResponse> {
    const tecnicos = await this.getTecnicos();
    const totalCarga = tecnicos.reduce((acc, t) => acc + t.cargaAtual, 0);
    const totalCapacidade = tecnicos.reduce((acc, t) => acc + t.capacidadeMax, 0);
    const percentualGeral = totalCapacidade > 0 ? Math.round((totalCarga / totalCapacidade) * 100) : 0;

    return {
      tecnicos,
      totalCarga,
      totalCapacidade,
      percentualGeral,
    };
  }

  private async saveChamados(chamados: Chamado[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_CHAMADOS, JSON.stringify(chamados));
  }

  private async saveTecnicos(tecnicos: Tecnico[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_TECNICOS, JSON.stringify(tecnicos));
  }

  private getNextProtocolo(): string {
    this.currentSeq += 1;
    const padded = String(this.currentSeq).padStart(6, '0');
    return `CH-2026-${padded}`;
  }

  /**
   * POST /api/chamados
   * Simula a gravação no banco com status ABERTO, geração de evento no Outbox
   * e resposta imediata HTTP 202 Accepted.
   */
  public async criarChamado(dto: CriarChamadoDTO, usuarioId: string = 'user-fatec-1'): Promise<ChamadoCriadoResponse> {
    const chamados = await this.getChamados();
    const id = `c-${Date.now().toString(36)}`;
    const agora = new Date().toISOString();

    const novoChamado: Chamado = {
      id,
      usuarioId,
      titulo: dto.titulo.trim(),
      descricao: dto.descricao.trim(),
      categoria: dto.categoria,
      prioridade: dto.prioridade,
      status: 'ABERTO',
      protocolo: null,
      tecnicoId: null,
      tecnicoNome: null,
      slaPrazo: null,
      criadoEm: agora,
      historico: [
        {
          id: `h-${Date.now()}-1`,
          chamadoId: id,
          statusAnterior: null,
          statusNovo: 'ABERTO',
          data: agora,
          observacao: 'Chamado gravado com sucesso. Evento ChamadoAbertoEvent enfileirado no Outbox Transactional.',
        },
      ],
    };

    chamados.unshift(novoChamado);
    await this.saveChamados(chamados);
    this.notify(novoChamado);

    // Dispara simulação assíncrona do RabbitMQ (atendimento-service consumindo a mensagem)
    setTimeout(() => {
      this.processarEventoChamadoAberto(id);
    }, 2200);

    return {
      id,
      status: 'ABERTO',
      mensagem: 'Chamado recebido e aceito para processamento assíncrono (HTTP 202 Accepted).',
    };
  }

  /**
   * Simula o consumo da fila 'chamado.aberto' pelo atendimento-service
   */
  private async processarEventoChamadoAberto(chamadoId: string): Promise<void> {
    const chamados = await this.getChamados();
    const chamadoIndex = chamados.findIndex((c) => c.id === chamadoId);
    if (chamadoIndex === -1) return;

    const chamado = chamados[chamadoIndex];
    if (chamado.status !== 'ABERTO') return;

    const tecnicos = await this.getTecnicos();

    // Filtra técnicos da especialidade que estejam ativos e ordena por menor cargaAtual
    const disponiveis = tecnicos
      .filter((t) => t.ativo && t.especialidade === chamado.categoria)
      .sort((a, b) => a.cargaAtual - b.cargaAtual);

    const tecnicoSelecionado = disponiveis.find((t) => t.cargaAtual < t.capacidadeMax);
    const agora = new Date();

    if (tecnicoSelecionado) {
      // Atribuição com sucesso!
      tecnicoSelecionado.cargaAtual += 1;
      await this.saveTecnicos(tecnicos);

      const horasSla = SLA_HORAS[chamado.prioridade];
      const prazoSla = new Date(agora.getTime() + horasSla * 60 * 60 * 1000).toISOString();
      const protocolo = this.getNextProtocolo();

      const historicoAtualizado: HistoricoChamado = {
        id: `h-${Date.now()}-atrib`,
        chamadoId,
        statusAnterior: 'ABERTO',
        statusNovo: 'EM_ATENDIMENTO',
        data: agora.toISOString(),
        observacao: `Evento ChamadoAtribuidoEvent consumido: Técnico ${tecnicoSelecionado.nome} alocado (Carga: ${tecnicoSelecionado.cargaAtual}/${tecnicoSelecionado.capacidadeMax}). Protocolo ${protocolo} gerado. SLA de ${horasSla}h estabelecido.`,
      };

      const chamadoAtualizado: Chamado = {
        ...chamado,
        status: 'EM_ATENDIMENTO',
        protocolo,
        tecnicoId: tecnicoSelecionado.id,
        tecnicoNome: tecnicoSelecionado.nome,
        slaPrazo: prazoSla,
        historico: [...(chamado.historico || []), historicoAtualizado],
      };

      chamados[chamadoIndex] = chamadoAtualizado;
      await this.saveChamados(chamados);
      this.notify(chamadoAtualizado);
    } else {
      // Capacidade esgotada para a especialidade (AtribuicaoFalhouEvent)
      const historicoRepresado: HistoricoChamado = {
        id: `h-${Date.now()}-falha`,
        chamadoId,
        statusAnterior: 'ABERTO',
        statusNovo: 'AGUARDANDO_TECNICO',
        data: agora.toISOString(),
        observacao: `Evento AtribuicaoFalhouEvent: Todos os técnicos da especialidade ${chamado.categoria} atingiram a capacidade máxima. Chamado represado na fila de espera.`,
      };

      const chamadoAtualizado: Chamado = {
        ...chamado,
        status: 'AGUARDANDO_TECNICO',
        historico: [...(chamado.historico || []), historicoRepresado],
      };

      chamados[chamadoIndex] = chamadoAtualizado;
      await this.saveChamados(chamados);
      this.notify(chamadoAtualizado);
    }
  }

  /**
   * PATCH /api/chamados/{id}/resolver
   * Simula a resolução do chamado, liberação da carga do técnico (-1)
   * e desrepresamento de chamados em espera.
   */
  public async resolverChamado(id: string): Promise<Chamado> {
    const chamados = await this.getChamados();
    const chamadoIndex = chamados.findIndex((c) => c.id === id);
    if (chamadoIndex === -1) {
      throw new Error('Chamado não encontrado');
    }

    const chamado = chamados[chamadoIndex];
    if (chamado.status === 'RESOLVIDO') {
      return chamado;
    }

    const agora = new Date().toISOString();
    const statusAnterior = chamado.status;

    // Se havia técnico atribuído, desocupa carga (-1)
    if (chamado.tecnicoId) {
      const tecnicos = await this.getTecnicos();
      const tec = tecnicos.find((t) => t.id === chamado.tecnicoId);
      if (tec && tec.cargaAtual > 0) {
        tec.cargaAtual -= 1;
        await this.saveTecnicos(tecnicos);
      }
    }

    const historicoResolvido: HistoricoChamado = {
      id: `h-${Date.now()}-res`,
      chamadoId: id,
      statusAnterior,
      statusNovo: 'RESOLVIDO',
      data: agora,
      observacao: 'Chamado finalizado pelo operador. Evento ChamadoResolvidoEvent gerado. Carga do técnico liberada.',
    };

    const chamadoAtualizado: Chamado = {
      ...chamado,
      status: 'RESOLVIDO',
      historico: [...(chamado.historico || []), historicoResolvido],
    };

    chamados[chamadoIndex] = chamadoAtualizado;
    await this.saveChamados(chamados);
    this.notify(chamadoAtualizado);

    // Desrepresamento: se houver chamados AGUARDANDO_TECNICO da mesma categoria, tenta atendê-los agora!
    setTimeout(() => {
      this.verificarDesrepresamento(chamado.categoria);
    }, 1500);

    return chamadoAtualizado;
  }

  /**
   * Verifica se há chamados represados na categoria que agora podem ser atendidos
   */
  private async verificarDesrepresamento(categoria: string): Promise<void> {
    const chamados = await this.getChamados();
    const represado = chamados.find(
      (c) => c.categoria === categoria && c.status === 'AGUARDANDO_TECNICO'
    );
    if (represado) {
      // Re-executa processo de atribuição
      represado.status = 'ABERTO';
      await this.saveChamados(chamados);
      await this.processarEventoChamadoAberto(represado.id);
    }
  }

  /**
   * Reseta todos os dados para o estado inicial
   */
  public async resetData(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_CHAMADOS, JSON.stringify(INITIAL_CHAMADOS));
    await AsyncStorage.setItem(STORAGE_TECNICOS, JSON.stringify(INITIAL_TECNICOS));
    this.currentSeq = 105;
  }
}

export const mockService = new MockService();
