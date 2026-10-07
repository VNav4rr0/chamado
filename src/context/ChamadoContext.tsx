import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Chamado, CriarChamadoDTO, PainelCargaResponse, Tecnico } from '../types/chamado';
import { chamadoService } from '../services/chamadoService';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChamadoContextData {
  chamados: Chamado[];
  tecnicos: Tecnico[];
  painelCarga: PainelCargaResponse | null;
  loading: boolean;
  refreshing: boolean;
  isDarkMode: boolean;
  useMock: boolean;
  usuarioId: string;
  gatewayUrl: string;
  snackbarMessage: string | null;
  carregarDados: () => Promise<void>;
  criarChamado: (dto: CriarChamadoDTO) => Promise<{ id: string; status: string }>;
  resolverChamado: (id: string) => Promise<void>;
  toggleTheme: () => void;
  setUseMock: (value: boolean) => void;
  setUsuarioId: (id: string) => void;
  setGatewayUrl: (url: string) => void;
  resetarDados: () => Promise<void>;
  dismissSnackbar: () => void;
  showSnackbar: (msg: string) => void;
}

const ChamadoContext = createContext<ChamadoContextData>({} as ChamadoContextData);

export const ChamadoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [painelCarga, setPainelCarga] = useState<PainelCargaResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [useMock, setUseMockState] = useState<boolean>(true);
  const [usuarioId, setUsuarioIdState] = useState<string>('user-fatec-1');
  const [gatewayUrl, setGatewayUrlState] = useState<string>('http://localhost:8080');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const showSnackbar = useCallback((msg: string) => {
    setSnackbarMessage(msg);
  }, []);

  const dismissSnackbar = useCallback(() => {
    setSnackbarMessage(null);
  }, []);

  const carregarDados = useCallback(async () => {
    try {
      const [chamadosData, painelData] = await Promise.all([
        chamadoService.getChamados(usuarioId),
        chamadoService.getPainelCarga(),
      ]);
      setChamados(chamadosData);
      setPainelCarga(painelData);
      setTecnicos(painelData.tecnicos);
    } catch (error: any) {
      console.warn('Erro ao carregar dados:', error);
      showSnackbar(`Erro ao buscar dados: ${error.message || 'Falha de conexão'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usuarioId, showSnackbar]);

  // Carrega configurações salvas na inicialização
  useEffect(() => {
    (async () => {
      try {
        const [savedTheme, savedMock, savedUser, savedUrl] = await Promise.all([
          AsyncStorage.getItem('@chamados_theme'),
          AsyncStorage.getItem('@chamados_mock'),
          AsyncStorage.getItem('@chamados_user'),
          AsyncStorage.getItem('@chamados_url'),
        ]);

        if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');
        if (savedMock !== null) {
          const mockVal = savedMock === 'true';
          setUseMockState(mockVal);
          chamadoService.setUseMock(mockVal);
        }
        if (savedUser) {
          setUsuarioIdState(savedUser);
          api.setConfig({ usuarioId: savedUser });
        }
        if (savedUrl) {
          setGatewayUrlState(savedUrl);
          api.setConfig({ baseUrl: savedUrl });
        }
      } catch (e) {
        console.warn('Erro ao ler AsyncStorage inicial:', e);
      } finally {
        carregarDados();
      }
    })();
  }, [carregarDados]);

  // Registra listener para atualizações reativas do Mock (RabbitMQ simulation)
  useEffect(() => {
    const unsubscribe = chamadoService.subscribeToUpdates((chamadoAtualizado) => {
      setChamados((prev) => {
        const idx = prev.findIndex((c) => c.id === chamadoAtualizado.id);
        if (idx >= 0) {
          const clone = [...prev];
          clone[idx] = chamadoAtualizado;
          return clone;
        }
        return [chamadoAtualizado, ...prev];
      });

      // Atualiza o painel de carga simultaneamente
      chamadoService.getPainelCarga().then((painel) => {
        setPainelCarga(painel);
        setTecnicos(painel.tecnicos);
      });

      // Notifica usuário com Snackbar do evento processado
      if (chamadoAtualizado.status === 'EM_ATENDIMENTO' && chamadoAtualizado.tecnicoNome) {
        showSnackbar(`⚡ Atribuído: ${chamadoAtualizado.tecnicoNome} assumiu ${chamadoAtualizado.protocolo || 'o chamado'}`);
      } else if (chamadoAtualizado.status === 'AGUARDANDO_TECNICO') {
        showSnackbar(`⚠️ Represado: Sem técnicos disponíveis. Chamado na fila de espera.`);
      }
    });

    return () => unsubscribe();
  }, [showSnackbar]);

  const toggleTheme = () => {
    const nextVal = !isDarkMode;
    setIsDarkMode(nextVal);
    AsyncStorage.setItem('@chamados_theme', nextVal ? 'dark' : 'light');
  };

  const setUseMock = (value: boolean) => {
    setUseMockState(value);
    chamadoService.setUseMock(value);
    AsyncStorage.setItem('@chamados_mock', String(value));
    carregarDados();
  };

  const setUsuarioId = (id: string) => {
    setUsuarioIdState(id);
    api.setConfig({ usuarioId: id });
    AsyncStorage.setItem('@chamados_user', id);
    carregarDados();
  };

  const setGatewayUrl = (url: string) => {
    setGatewayUrlState(url);
    api.setConfig({ baseUrl: url });
    AsyncStorage.setItem('@chamados_url', url);
  };

  const criarChamado = async (dto: CriarChamadoDTO) => {
    setLoading(true);
    try {
      const res = await chamadoService.criarChamado(dto, usuarioId);
      await carregarDados();
      showSnackbar(`✅ Chamado criado! Status: ${res.status} (202 Accepted)`);
      return res;
    } catch (err: any) {
      showSnackbar(`❌ Falha ao abrir chamado: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resolverChamado = async (id: string) => {
    setLoading(true);
    try {
      const chamadoAtualizado = await chamadoService.resolverChamado(id);
      await carregarDados();
      showSnackbar(`🎉 Chamado ${chamadoAtualizado.protocolo || id} resolvido!`);
    } catch (err: any) {
      showSnackbar(`❌ Erro ao resolver chamado: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetarDados = async () => {
    setLoading(true);
    await chamadoService.resetData();
    await carregarDados();
    showSnackbar('🔄 Dados restaurados para o padrão inicial de fábrica');
    setLoading(false);
  };

  return (
    <ChamadoContext.Provider
      value={{
        chamados,
        tecnicos,
        painelCarga,
        loading,
        refreshing,
        isDarkMode,
        useMock,
        usuarioId,
        gatewayUrl,
        snackbarMessage,
        carregarDados,
        criarChamado,
        resolverChamado,
        toggleTheme,
        setUseMock,
        setUsuarioId,
        setGatewayUrl,
        resetarDados,
        dismissSnackbar,
        showSnackbar,
      }}
    >
      {children}
    </ChamadoContext.Provider>
  );
};

export const useChamado = () => useContext(ChamadoContext);
