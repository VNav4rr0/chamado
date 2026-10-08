import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Chamado, MensagemLog } from '../types/chamado';
import { Usuario } from '../types/auth';
import { ChamadoService } from '../services/chamadoService';

interface HomeScreenProps {
  usuario: Usuario;
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ usuario, onLogout }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  // Estados do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estados da lista de chamados e logs
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [logs, setLogs] = useState<MensagemLog[]>([]);
  const [etapaAtiva, setEtapaAtiva] = useState<string | null>(null);

  // Carrega dados iniciais
  const carregarDados = async () => {
    try {
      const [listaChamados, listaLogs] = await Promise.all([
        ChamadoService.listarChamados(),
        ChamadoService.obterLogsMensageria(),
      ]);
      setChamados(listaChamados);
      setLogs(listaLogs);
    } catch (e) {
      console.warn('Erro ao carregar dados:', e);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  const handleCriarChamado = async () => {
    if (!titulo.trim() || !descricao.trim()) {
      alert('Por favor, preencha o título e a descrição do chamado.');
      return;
    }

    setLoading(true);
    const tit = titulo.trim();
    const desc = descricao.trim();

    try {
      // 1. Simulação visual do disparo da mensageria
      setEtapaAtiva('DISPARO');
      const logDisparo = await ChamadoService.registrarLogSimulado(
        'DISPARO',
        `🚀 [DISPARO] Chamado "${tit}" enviado ao broker de mensageria.`
      );
      setLogs((prev) => [logDisparo, ...prev]);

      // 2. Criação do chamado no backend
      const novo = await ChamadoService.criarChamado(tit, desc, usuario.username);
      setChamados((prev) => [novo, ...prev]);
      setTitulo('');
      setDescricao('');

      // 3. Etapa: Enfileiramento
      setTimeout(async () => {
        setEtapaAtiva('FILA');
        const logFila = await ChamadoService.registrarLogSimulado(
          'FILA',
          `📥 [FILA] Evento enfileirado no tópico 'fila.chamados.novos' para o chamado ${novo.id}.`,
          novo.id
        );
        setLogs((prev) => [logFila, ...prev]);
      }, 500);

      // 4. Etapa: Worker & Sucesso
      setTimeout(async () => {
        setEtapaAtiva('SUCESSO');
        const logSucesso = await ChamadoService.registrarLogSimulado(
          'SUCESSO',
          `✅ [SUCESSO/ACK] Notificação assíncrona despachada e gravada com sucesso!`,
          novo.id
        );
        setLogs((prev) => [logSucesso, ...prev]);
        setLoading(false);
      }, 1200);

    } catch (err: any) {
      alert('Erro ao abrir chamado: ' + err.message);
      setLoading(false);
    }
  };

  const handleTesteManualMensageria = async () => {
    setEtapaAtiva('DISPARO');
    const log1 = await ChamadoService.registrarLogSimulado(
      'DISPARO',
      '⚡ [MANUAL] Disparo de evento avulso enviado pelo usuário ' + usuario.username
    );
    setLogs((prev) => [log1, ...prev]);

    setTimeout(async () => {
      setEtapaAtiva('SUCESSO');
      const log2 = await ChamadoService.registrarLogSimulado(
        'SUCESSO',
        '🎉 [MANUAL] Mensagem assíncrona confirmada pelo broker com sucesso!'
      );
      setLogs((prev) => [log2, ...prev]);
    }, 700);
  };

  const getCorBadgeStatus = (status: string) => {
    switch (status) {
      case 'CONCLUIDO':
        return { bg: '#d1fae5', text: '#065f46' };
      case 'EM_PROCESSAMENTO':
        return { bg: '#e0e7ff', text: '#3730a3' };
      default:
        return { bg: '#fef3c7', text: '#92400e' };
    }
  };

  const getCorTipoLog = (tipo: string) => {
    switch (tipo) {
      case 'DISPARO':
        return '#3b82f6';
      case 'FILA':
        return '#f59e0b';
      case 'WORKER':
        return '#8b5cf6';
      case 'SUCESSO':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.contentWrapper}>
        {/* Topbar do Usuário Autenticado */}
        <View style={styles.userBar}>
          <View style={styles.userInfo}>
            <View style={styles.avatarWrap}>
              <MaterialCommunityIcons name="account-circle" size={32} color="#4f46e5" />
            </View>
            <View>
              <Text variant="titleMedium" style={styles.userNome}>
                {usuario.nome}
              </Text>
              <Text variant="bodySmall" style={styles.userRole}>
                Logado como: <Text style={{ fontWeight: '700' }}>{usuario.username}</Text> ({usuario.role})
              </Text>
            </View>
          </View>

          <Button
            mode="outlined"
            icon="logout"
            onPress={onLogout}
            textColor="#ef4444"
            style={styles.logoutButton}
          >
            Sair
          </Button>
        </View>

        {/* Layout Principal em Colunas */}
        <View style={[styles.mainGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
          {/* COLUNA 1: Formulário + Lista de Chamados */}
          <View style={[styles.column, isDesktop && { flex: 1.1 }]}>
            {/* Card de Formulário */}
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="ticket-outline" size={24} color="#4f46e5" />
                  <Text variant="titleMedium" style={styles.cardTitle}>
                    Abrir Novo Chamado
                  </Text>
                </View>

                <TextInput
                  label="Título do Chamado"
                  value={titulo}
                  onChangeText={setTitulo}
                  mode="outlined"
                  outlineColor="#cbd5e1"
                  activeOutlineColor="#4f46e5"
                  placeholder="Ex: Falha na conexão de rede ou impressora"
                  style={styles.input}
                  disabled={loading}
                />

                <TextInput
                  label="Descrição do Problema"
                  value={descricao}
                  onChangeText={setDescricao}
                  mode="outlined"
                  outlineColor="#cbd5e1"
                  activeOutlineColor="#4f46e5"
                  placeholder="Descreva o problema em detalhes..."
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { marginTop: 12 }]}
                  disabled={loading}
                />

                <Button
                  mode="contained"
                  onPress={handleCriarChamado}
                  loading={loading}
                  disabled={loading || !titulo.trim() || !descricao.trim()}
                  buttonColor="#4f46e5"
                  icon="send-check"
                  style={styles.buttonSubmit}
                >
                  Criar Chamado & Disparar Mensagem
                </Button>
              </Card.Content>
            </Card>

            {/* Card de Lista de Chamados */}
            <Card style={[styles.card, { marginTop: 18 }]}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeaderBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="format-list-bulleted" size={22} color="#0f172a" />
                    <Text variant="titleMedium" style={[styles.cardTitle, { marginLeft: 8 }]}>
                      Chamados Registrados ({chamados.length})
                    </Text>
                  </View>
                  <Button compact mode="text" onPress={onRefresh} icon="refresh">
                    Atualizar
                  </Button>
                </View>

                {chamados.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum chamado aberto ainda.</Text>
                ) : (
                  <View style={styles.chamadosList}>
                    {chamados.map((item) => {
                      const badge = getCorBadgeStatus(item.status);
                      return (
                        <View key={item.id} style={styles.chamadoItem}>
                          <View style={styles.itemHeader}>
                            <Text style={styles.itemId}>{item.id}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                              <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                                {item.status}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.itemTitulo}>{item.titulo}</Text>
                          <Text style={styles.itemDesc}>{item.descricao}</Text>

                          <View style={styles.itemFooter}>
                            <Text style={styles.itemData}>🕒 {item.criadoEm}</Text>
                            {item.usuarioId && (
                              <Text style={styles.itemUser}>👤 {item.usuarioId}</Text>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Card.Content>
            </Card>
          </View>

          {/* COLUNA 2: Simulação de Mensageria e Logs */}
          <View style={[styles.column, isDesktop && { flex: 0.9, marginLeft: 18 }]}>
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeaderBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="broadcast" size={22} color="#059669" />
                    <Text variant="titleMedium" style={[styles.cardTitle, { marginLeft: 8 }]}>
                      Motor de Mensageria
                    </Text>
                  </View>

                  <Button
                    compact
                    mode="outlined"
                    onPress={handleTesteManualMensageria}
                    icon="lightning-bolt"
                    textColor="#4f46e5"
                    style={{ borderColor: '#c7d2fe' }}
                  >
                    Teste Manual
                  </Button>
                </View>

                <Text variant="bodySmall" style={styles.mensageriaDesc}>
                  Simula o disparo assíncrono e a entrega de mensagens no broker a cada novo chamado.
                </Text>

                {/* Pipeline Visual das Etapas */}
                <View style={styles.pipeline}>
                  <View style={[styles.pipeStep, etapaAtiva === 'DISPARO' && styles.pipeActive]}>
                    <Text style={[styles.pipeStepText, etapaAtiva === 'DISPARO' && styles.pipeActiveText]}>
                      1. Disparo
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="arrow-right" size={14} color="#94a3b8" />

                  <View style={[styles.pipeStep, etapaAtiva === 'FILA' && styles.pipeActive]}>
                    <Text style={[styles.pipeStepText, etapaAtiva === 'FILA' && styles.pipeActiveText]}>
                      2. Fila
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="arrow-right" size={14} color="#94a3b8" />

                  <View style={[styles.pipeStep, etapaAtiva === 'SUCESSO' && styles.pipeSuccess]}>
                    <Text style={[styles.pipeStepText, etapaAtiva === 'SUCESSO' && styles.pipeActiveText]}>
                      3. ACK / Sucesso
                    </Text>
                  </View>
                </View>

                {/* Terminal de Logs */}
                <View style={styles.terminal}>
                  <View style={styles.terminalTop}>
                    <View style={styles.terminalDots}>
                      <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                      <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
                      <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                    </View>
                    <Text style={styles.terminalTitle}>Event Logs em Tempo Real</Text>
                    <TouchableOpacity onPress={() => setLogs([])}>
                      <Text style={styles.terminalClear}>Limpar</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.terminalBody} nestedScrollEnabled>
                    {logs.map((l, i) => (
                      <View key={l.id || i} style={styles.logRow}>
                        <Text style={styles.logTime}>[{l.timestamp}]</Text>
                        <View style={[styles.logBadge, { backgroundColor: getCorTipoLog(l.tipo) }]}>
                          <Text style={styles.logBadgeText}>{l.tipo}</Text>
                        </View>
                        <Text style={styles.logMsg}>{l.mensagem}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </Card.Content>
            </Card>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1120,
  },
  userBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userNome: {
    fontWeight: '800',
    color: '#0f172a',
  },
  userRole: {
    color: '#64748b',
  },
  logoutButton: {
    borderColor: '#fca5a5',
    borderRadius: 10,
  },
  mainGrid: {
    gap: 16,
  },
  column: {
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: {
    fontWeight: '800',
    color: '#0f172a',
  },
  input: {
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  buttonSubmit: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 4,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginVertical: 14,
  },
  chamadosList: {
    gap: 12,
  },
  chamadoItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemId: {
    fontWeight: '800',
    color: '#4f46e5',
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
  },
  itemDesc: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 3,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  itemData: {
    fontSize: 11,
    color: '#94a3b8',
  },
  itemUser: {
    fontSize: 11,
    color: '#94a3b8',
  },
  mensageriaDesc: {
    color: '#64748b',
    marginBottom: 14,
  },
  pipeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pipeStep: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pipeActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  pipeSuccess: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  pipeStepText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  pipeActiveText: {
    color: '#ffffff',
  },
  terminal: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  terminalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  terminalDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  terminalTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  terminalClear: {
    color: '#64748b',
    fontSize: 11,
  },
  terminalBody: {
    maxHeight: 300,
    padding: 12,
  },
  logRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  logTime: {
    color: '#64748b',
    fontSize: 10.5,
    fontFamily: 'monospace' as any,
  },
  logBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  logMsg: {
    color: '#e2e8f0',
    fontSize: 11.5,
    flexShrink: 1,
    fontFamily: 'monospace' as any,
  },
});
