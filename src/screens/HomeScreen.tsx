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
  const isAdmin = usuario.role === 'ROLE_ADMIN' || usuario.username.toLowerCase() === 'admin';

  // Estados do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estados da lista de chamados e logs
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [logs, setLogs] = useState<MensagemLog[]>([]);
  const [etapaAtiva, setEtapaAtiva] = useState<string | null>(null);

  // Estados de controle ADM
  const [filtroAba, setFiltroAba] = useState<'TODOS' | 'MEUS'>(isAdmin ? 'TODOS' : 'MEUS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ABERTO' | 'EM_PROCESSAMENTO' | 'CONCLUIDO'>('TODOS');
  const [acaoLoadingId, setAcaoLoadingId] = useState<string | null>(null);

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
        `🚀 [DISPARO] Chamado "${tit}" criado por ${usuario.username} e enviado ao broker.`
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

  const handleAtualizarStatus = async (id: string, novoStatus: string) => {
    setAcaoLoadingId(id);
    try {
      const atualizado = await ChamadoService.atualizarStatus(id, novoStatus);
      if (atualizado) {
        setChamados((prev) => prev.map((c) => (c.id === id ? { ...c, status: novoStatus } : c)));
      } else {
        setChamados((prev) => prev.map((c) => (c.id === id ? { ...c, status: novoStatus } : c)));
      }

      const log = await ChamadoService.registrarLogSimulado(
        'WORKER',
        `⚙️ [ADM-STATUS] Chamado ${id} alterado para "${novoStatus}" pelo Administrador ${usuario.username}.`,
        id
      );
      setLogs((prev) => [log, ...prev]);
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    } finally {
      setAcaoLoadingId(null);
    }
  };

  const handleExcluirChamado = async (id: string) => {
    const confirmado = typeof window !== 'undefined' && window.confirm
      ? window.confirm(`Deseja realmente excluir o chamado ${id}?`)
      : true;

    if (!confirmado) return;

    setAcaoLoadingId(id);
    try {
      await ChamadoService.deletarChamado(id);
      setChamados((prev) => prev.filter((c) => c.id !== id));

      const log = await ChamadoService.registrarLogSimulado(
        'DISPARO',
        `🗑️ [ADM-DELETE] Chamado ${id} removido do sistema pelo Administrador ${usuario.username}.`,
        id
      );
      setLogs((prev) => [log, ...prev]);
    } catch (err: any) {
      alert('Erro ao excluir chamado: ' + err.message);
    } finally {
      setAcaoLoadingId(null);
    }
  };

  const handleTesteManualMensageria = async () => {
    setEtapaAtiva('DISPARO');
    const log1 = await ChamadoService.registrarLogSimulado(
      'DISPARO',
      `⚡ [MANUAL] Disparo de evento avulso pelo ${isAdmin ? 'Administrador' : 'Usuário'} ${usuario.username}`
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
        return { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' };
      case 'EM_PROCESSAMENTO':
        return { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' };
      default:
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
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

  // Métricas para exibição administrativa
  const totalChamados = chamados.length;
  const totalAbertos = chamados.filter((c) => c.status === 'ABERTO').length;
  const totalEmProcesso = chamados.filter((c) => c.status === 'EM_PROCESSAMENTO').length;
  const totalConcluidos = chamados.filter((c) => c.status === 'CONCLUIDO').length;

  // Filtragem dos chamados
  const chamadosFiltrados = chamados.filter((c) => {
    if (isAdmin && filtroAba === 'MEUS') {
      if (c.usuarioId && c.usuarioId !== usuario.username) return false;
    } else if (!isAdmin) {
      if (c.usuarioId && c.usuarioId !== usuario.username) return false;
    }

    if (filtroStatus !== 'TODOS' && c.status !== filtroStatus) {
      return false;
    }

    return true;
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.contentWrapper}>
        {/* Topbar do Usuário Autenticado */}
        <View style={[styles.userBar, isAdmin && styles.userBarAdmin]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatarWrap, isAdmin && styles.avatarWrapAdmin]}>
              <MaterialCommunityIcons
                name={isAdmin ? 'crown' : 'account-circle'}
                size={26}
                color={isAdmin ? '#b45309' : '#4f46e5'}
              />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="titleMedium" style={styles.userNome}>
                  {usuario.nome}
                </Text>
                {isAdmin && (
                  <View style={styles.crownBadge}>
                    <Text style={styles.crownBadgeText}>👑 ADM</Text>
                  </View>
                )}
              </View>
              <Text variant="bodySmall" style={styles.userRole}>
                {isAdmin
                  ? `Perfil Administrador • ${usuario.username}`
                  : `Usuário Solicitante • ${usuario.username}`}
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

        {/* Dashboard de Métricas Administrativas */}
        {isAdmin && (
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { borderColor: '#e2e8f0' }]}>
              <Text style={styles.statNumber}>{totalChamados}</Text>
              <Text style={styles.statLabel}>Total Geral</Text>
            </View>
            <View style={[styles.statBox, { borderColor: '#fde68a', backgroundColor: '#fffbeb' }]}>
              <Text style={[styles.statNumber, { color: '#b45309' }]}>{totalAbertos}</Text>
              <Text style={[styles.statLabel, { color: '#92400e' }]}>Abertos</Text>
            </View>
            <View style={[styles.statBox, { borderColor: '#c7d2fe', backgroundColor: '#eef2ff' }]}>
              <Text style={[styles.statNumber, { color: '#4338ca' }]}>{totalEmProcesso}</Text>
              <Text style={[styles.statLabel, { color: '#3730a3' }]}>Em Andamento</Text>
            </View>
            <View style={[styles.statBox, { borderColor: '#a7f3d0', backgroundColor: '#ecfdf5' }]}>
              <Text style={[styles.statNumber, { color: '#047857' }]}>{totalConcluidos}</Text>
              <Text style={[styles.statLabel, { color: '#065f46' }]}>Concluídos</Text>
            </View>
          </View>
        )}

        {/* Layout Principal em Colunas */}
        <View style={[styles.mainGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
          {/* COLUNA 1: Formulário + Lista de Chamados */}
          <View style={[styles.column, isDesktop && { flex: 1.15 }]}>
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
                    <MaterialCommunityIcons
                      name={isAdmin ? 'shield-crown-outline' : 'format-list-bulleted'}
                      size={22}
                      color={isAdmin ? '#b45309' : '#0f172a'}
                    />
                    <Text variant="titleMedium" style={[styles.cardTitle, { marginLeft: 8 }]}>
                      {isAdmin ? 'Gerenciador de Chamados (ADM)' : 'Meus Chamados'} ({chamadosFiltrados.length})
                    </Text>
                  </View>
                  <Button compact mode="text" onPress={onRefresh} icon="refresh">
                    Atualizar
                  </Button>
                </View>

                {/* Filtros para Administrador */}
                {isAdmin && (
                  <View style={styles.adminFilterBar}>
                    {/* Alternância de Escopo */}
                    <View style={styles.scopeButtons}>
                      <TouchableOpacity
                        style={[styles.scopeBtn, filtroAba === 'TODOS' && styles.scopeBtnActive]}
                        onPress={() => setFiltroAba('TODOS')}
                      >
                        <Text style={[styles.scopeBtnText, filtroAba === 'TODOS' && styles.scopeBtnTextActive]}>
                          Todos ({totalChamados})
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.scopeBtn, filtroAba === 'MEUS' && styles.scopeBtnActive]}
                        onPress={() => setFiltroAba('MEUS')}
                      >
                        <Text style={[styles.scopeBtnText, filtroAba === 'MEUS' && styles.scopeBtnTextActive]}>
                          Abertos por Mim
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Chips de Status */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                      <Chip
                        selected={filtroStatus === 'TODOS'}
                        onPress={() => setFiltroStatus('TODOS')}
                        style={styles.statusChip}
                        textStyle={{ fontSize: 11 }}
                      >
                        Todos Status
                      </Chip>
                      <Chip
                        selected={filtroStatus === 'ABERTO'}
                        onPress={() => setFiltroStatus('ABERTO')}
                        style={styles.statusChip}
                        textStyle={{ fontSize: 11 }}
                      >
                        Abertos ({totalAbertos})
                      </Chip>
                      <Chip
                        selected={filtroStatus === 'EM_PROCESSAMENTO'}
                        onPress={() => setFiltroStatus('EM_PROCESSAMENTO')}
                        style={styles.statusChip}
                        textStyle={{ fontSize: 11 }}
                      >
                        Em Andamento ({totalEmProcesso})
                      </Chip>
                      <Chip
                        selected={filtroStatus === 'CONCLUIDO'}
                        onPress={() => setFiltroStatus('CONCLUIDO')}
                        style={styles.statusChip}
                        textStyle={{ fontSize: 11 }}
                      >
                        Concluídos ({totalConcluidos})
                      </Chip>
                    </ScrollView>
                  </View>
                )}

                {chamadosFiltrados.length === 0 ? (
                  <Text style={styles.emptyText}>
                    {isAdmin
                      ? 'Nenhum chamado encontrado para o filtro selecionado.'
                      : 'Você ainda não possui chamados abertos.'}
                  </Text>
                ) : (
                  <View style={styles.chamadosList}>
                    {chamadosFiltrados.map((item) => {
                      const badge = getCorBadgeStatus(item.status);
                      const isItemLoading = acaoLoadingId === item.id;

                      return (
                        <View key={item.id} style={styles.chamadoItem}>
                          <View style={styles.itemHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={styles.itemId}>{item.id}</Text>
                              {item.usuarioId && (
                                <View style={styles.authorBadge}>
                                  <Text style={styles.authorBadgeText}>👤 {item.usuarioId}</Text>
                                </View>
                              )}
                            </View>

                            <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                              <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                                {item.status}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.itemTitulo}>{item.titulo}</Text>
                          <Text style={styles.itemDesc}>{item.descricao}</Text>

                          <View style={styles.itemFooter}>
                            <Text style={styles.itemData}>🕒 {item.criadoEm}</Text>
                          </View>

                          {/* PAINEL DE CONTROLE EXCLUSIVO DO ADMINISTRADOR */}
                          {isAdmin && (
                            <View style={styles.adminActionRow}>
                              <View style={styles.adminActionLabelWrap}>
                                <MaterialCommunityIcons name="shield-star" size={14} color="#b45309" />
                                <Text style={styles.adminActionTitle}>Ações ADM:</Text>
                              </View>

                              <View style={styles.adminBtnGroup}>
                                {item.status !== 'EM_PROCESSAMENTO' && (
                                  <Button
                                    compact
                                    mode="contained-tonal"
                                    onPress={() => handleAtualizarStatus(item.id, 'EM_PROCESSAMENTO')}
                                    loading={isItemLoading}
                                    disabled={isItemLoading}
                                    style={styles.adminBtn}
                                    labelStyle={{ fontSize: 11 }}
                                    buttonColor="#e0e7ff"
                                    textColor="#3730a3"
                                  >
                                    Atender
                                  </Button>
                                )}

                                {item.status !== 'CONCLUIDO' && (
                                  <Button
                                    compact
                                    mode="contained-tonal"
                                    onPress={() => handleAtualizarStatus(item.id, 'CONCLUIDO')}
                                    loading={isItemLoading}
                                    disabled={isItemLoading}
                                    style={styles.adminBtn}
                                    labelStyle={{ fontSize: 11 }}
                                    buttonColor="#d1fae5"
                                    textColor="#065f46"
                                  >
                                    Concluir
                                  </Button>
                                )}

                                {item.status === 'CONCLUIDO' && (
                                  <Button
                                    compact
                                    mode="contained-tonal"
                                    onPress={() => handleAtualizarStatus(item.id, 'ABERTO')}
                                    loading={isItemLoading}
                                    disabled={isItemLoading}
                                    style={styles.adminBtn}
                                    labelStyle={{ fontSize: 11 }}
                                    buttonColor="#fef3c7"
                                    textColor="#92400e"
                                  >
                                    Reabrir
                                  </Button>
                                )}

                                <Button
                                  compact
                                  mode="outlined"
                                  onPress={() => handleExcluirChamado(item.id)}
                                  loading={isItemLoading}
                                  disabled={isItemLoading}
                                  style={[styles.adminBtn, { borderColor: '#fca5a5' }]}
                                  labelStyle={{ fontSize: 11 }}
                                  textColor="#ef4444"
                                  icon="delete-outline"
                                >
                                  Excluir
                                </Button>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </Card.Content>
            </Card>
          </View>

          {/* COLUNA 2: Simulação de Mensageria e Logs */}
          <View style={[styles.column, isDesktop && { flex: 0.85, marginLeft: 18 }]}>
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
                  Simula o disparo assíncrono e a entrega de mensagens no broker a cada novo chamado ou alteração de status.
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
    maxWidth: 1160,
  },
  userBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userBarAdmin: {
    borderColor: '#fde68a',
    backgroundColor: '#fffdfa',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapAdmin: {
    backgroundColor: '#fef3c7',
  },
  crownBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  crownBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
  },
  userNome: {
    fontWeight: '800',
    color: '#0f172a',
  },
  userRole: {
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    borderColor: '#fca5a5',
    borderRadius: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statBox: {
    flex: 1,
    minWidth: 110,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2,
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
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: '800',
    color: '#0f172a',
  },
  adminFilterBar: {
    marginBottom: 14,
    gap: 8,
  },
  scopeButtons: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 3,
  },
  scopeBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  scopeBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  scopeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  scopeBtnTextActive: {
    color: '#b45309',
  },
  chipsScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statusChip: {
    marginRight: 6,
    height: 30,
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
  authorBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  authorBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
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
  adminActionRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  adminActionLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adminActionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
  },
  adminBtnGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  adminBtn: {
    borderRadius: 6,
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
