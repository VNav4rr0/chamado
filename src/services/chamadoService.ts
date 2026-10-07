import { api } from './api';
import { mockService } from './mockService';
import {
  Chamado,
  CriarChamadoDTO,
  PainelCargaResponse,
  ChamadoCriadoResponse,
} from '../types/chamado';

class ChamadoService {
  private useMock: boolean = true;

  public setUseMock(val: boolean) {
    this.useMock = val;
  }

  public isMockEnabled(): boolean {
    return this.useMock;
  }

  public async getChamados(usuarioId?: string): Promise<Chamado[]> {
    if (this.useMock) {
      return mockService.getChamados(usuarioId);
    }
    return api.get<Chamado[]>('/chamados');
  }

  public async getChamadoById(id: string): Promise<Chamado | null> {
    if (this.useMock) {
      return mockService.getChamadoById(id);
    }
    return api.get<Chamado>(`/chamados/${id}`);
  }

  public async criarChamado(dto: CriarChamadoDTO, usuarioId?: string): Promise<ChamadoCriadoResponse> {
    if (this.useMock) {
      return mockService.criarChamado(dto, usuarioId);
    }
    return api.post<ChamadoCriadoResponse>('/chamados', dto);
  }

  public async resolverChamado(id: string): Promise<Chamado> {
    if (this.useMock) {
      return mockService.resolverChamado(id);
    }
    return api.patch<Chamado>(`/chamados/${id}/resolver`);
  }

  public async getPainelCarga(): Promise<PainelCargaResponse> {
    if (this.useMock) {
      return mockService.getPainelCarga();
    }
    return api.get<PainelCargaResponse>('/tecnicos/carga');
  }

  public async resetData(): Promise<void> {
    if (this.useMock) {
      return mockService.resetData();
    }
  }

  public subscribeToUpdates(listener: (chamado: Chamado) => void) {
    return mockService.subscribe(listener);
  }
}

export const chamadoService = new ChamadoService();
