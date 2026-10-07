import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Chamado, EventoMensageria } from '../types/chamado';
import { ChamadoService } from '../services/chamadoService';

export const HomeScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  // Estados do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [ultimoChamado, setUltimoChamado] = useState<Chamado | null>(null);

  // Estados da mensageria
  const [etapaAtual, setEtapaAtual] = useState<string | null>(null);
  const [logs, setLogs] = useState<EventoMensageria[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'SUCESSO',
      mensagem: 'Sistema pronto. Aguardando novo chamado ou disparo de mensagem.',
    },
  ]);

  const adicionarLog = (evento: EventoMensageria) => {
    setEtapaAtual(evento.tipo);
    setLogs((prev) => [evento, ...prev]);
  };

  const handleCriarChamado = async () => {
    if (!titulo.trim() || !descricao.trim()) {
      alert('Por favor, informe o título e a descrição do chamado.');
      return;
    }

    setLoading(true);
    try {
      const chamadoCriado = await ChamadoService.criarChamadoComMensageria(
        titulo,
        descricao,
        adicionarLog
      );
      setUltimoChamado(chamadoCriado);
      setTitulo('');
      setDescricao('');
    } catch (err: any) {
      adicionarLog({
        id: `err-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        tipo: 'DISPARO',
        mensagem: `❌ Erro no processo: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisparoManual = async () => {
    setLoading(true);
    try {
      await ChamadoService.simularMensageriaManual('Disparo Avulso', adicionarLog);
    } finally {
      setLoading(false);
    }
  };

  const handleLimparLogs = () => {
    setLogs([]);
    setEtapaAtual(null);
  };

  const getCorTipo = (tipo: EventoMensageria['tipo']) => {
    switch (tipo) {
      case 'DISPARO':
        return '#3b82f6';
      case 'FILA':
        return '#f59e0b';
      case 'PROCESSAMENTO':
        return '#8b5cf6';
      case 'SUCESSO':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.contentWrapper}>
        <View style={[styles.mainGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
          {/* COLUNA 1: Formulário Único de Chamado */}
          <View style={[styles.column, isDesktop && { flex: 1 }]}>
            <Card style={styles.card}>
              <Card.Content style={styles.cardPadding}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="form-select" size={24} color="#6366f1" />
                  <View style={{ marginLeft: 10 }}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                      Criar Chamado
                    </Text>
                    <Text variant="bodySmall" style={styles.sectionSubtitle}>
                      Preencha os dados para registrar e acionar a mensageria
                    </Text>
                  </View>
                </View>

                {/* Input Título */}
                <TextInput
                  label="Título do Chamado"
                  value={titulo}
                  onChangeText={setTitulo}
                  mode="outlined"
                  outlineColor="#cbd5e1"
                  activeOutlineColor="#6366f1"
                  placeholder="Ex: Instalação de software ou falha de conexão"
                  style={styles.input}
                  disabled={loading}
                />

                {/* Input Descrição */}
                <TextInput
                  label="Descrição do Problema"
                  value={descricao}
                  onChangeText={setDescricao}
                  mode="outlined"
                  outlineColor="#cbd5e1"
                  activeOutlineColor="#6366f1"
                  placeholder="Descreva detalhadamente o ocorrido..."
                  multiline
                  numberOfLines={4}
                  style={[styles.input, { marginTop: 14 }]}
                  disabled={loading}
                />

                {/* Botão de Envio */}
                <Button
                  mode="contained"
                  onPress={handleCriarChamado}
                  loading={loading}
                  disabled={loading || !titulo.trim() || !descricao.trim()}
                  icon="send-check"
                  buttonColor="#4f46e5"
                  style={styles.submitButton}
                  contentStyle={styles.buttonContent}
                >
                  Criar Chamado & Disparar Mensagem
                </Button>
              </Card.Content>
            </Card>

            {/* Card do Último Chamado Criado */}
            {ultimoChamado && (
              <Card style={[styles.card, { marginTop: 18, borderColor: '#a7f3d0' }]}>
                <Card.Content style={styles.cardPadding}>
                  <View style={styles.successHeader}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                    <Text variant="labelLarge" style={styles.successTitle}>
                      Último Chamado Registrado
                    </Text>
                  </View>

                  <View style={styles.chamadoSummary}>
                    <View style={styles.tagRow}>
                      <Text style={styles.chamadoIdText}>{ultimoChamado.id}</Text>
                      <View style={styles.badgeConcluido}>
                        <Text style={styles.badgeText}>CONFIRMADO</Text>
                      </View>
                    </View>
                    <Text variant="titleSmall" style={{ fontWeight: '700', marginTop: 6, color: '#1e293b' }}>
                      {ultimoChamado.titulo}
                    </Text>
                    <Text variant="bodySmall" style={{ color: '#64748b', marginTop: 3 }}>
                      {ultimoChamado.descricao}
                    </Text>
                    <Text variant="labelSmall" style={{ color: '#94a3b8', marginTop: 6 }}>
                      Criado às {ultimoChamado.criadoEm}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          </View>

          {/* COLUNA 2: Simulação Visual & Log de Mensageria */}
          <View style={[styles.column, isDesktop && { flex: 1, marginLeft: 20 }]}>
            <Card style={styles.card}>
              <Card.Content style={styles.cardPadding}>
                <View style={styles.cardHeaderBetween}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="broadcast" size={24} color="#059669" />
                    <View style={{ marginLeft: 10 }}>
                      <Text variant="titleMedium" style={styles.sectionTitle}>
                        Fluxo de Mensageria
                      </Text>
                      <Text variant="bodySmall" style={styles.sectionSubtitle}>
                        Acompanhe o disparo e recebimento assíncrono
                      </Text>
                    </View>
                  </View>

                  {/* Disparo Manual */}
                  <Button
                    mode="outlined"
                    compact
                    onPress={handleDisparoManual}
                    disabled={loading}
                    icon="lightning-bolt"
                    textColor="#6366f1"
                    style={{ borderColor: '#6366f1', borderRadius: 8 }}
                  >
                    Teste Manual
                  </Button>
                </View>

                {/* Pipeline Visual das Etapas */}
                <View style={styles.pipelineContainer}>
                  <View style={[styles.stepItem, etapaAtual === 'DISPARO' && styles.stepActive]}>
                    <MaterialCommunityIcons
                      name="airplane-takeoff"
                      size={18}
                      color={etapaAtual === 'DISPARO' ? '#ffffff' : '#64748b'}
                    />
                    <Text style={[styles.stepLabel, etapaAtual === 'DISPARO' && styles.stepTextActive]}>
                      1. Disparo
                    </Text>
                  </View>

                  <MaterialCommunityIcons name="chevron-right" size={16} color="#cbd5e1" />

                  <View style={[styles.stepItem, etapaAtual === 'FILA' && styles.stepActive]}>
                    <MaterialCommunityIcons
                      name="tray-full"
                      size={18}
                      color={etapaAtual === 'FILA' ? '#ffffff' : '#64748b'}
                    />
                    <Text style={[styles.stepLabel, etapaAtual === 'FILA' && styles.stepTextActive]}>
                      2. Na Fila
                    </Text>
                  </View>

                  <MaterialCommunityIcons name="chevron-right" size={16} color="#cbd5e1" />

                  <View style={[styles.stepItem, etapaAtual === 'PROCESSAMENTO' && styles.stepActive]}>
                    <MaterialCommunityIcons
                      name="cog-sync"
                      size={18}
                      color={etapaAtual === 'PROCESSAMENTO' ? '#ffffff' : '#64748b'}
                    />
                    <Text style={[styles.stepLabel, etapaAtual === 'PROCESSAMENTO' && styles.stepTextActive]}>
                      3. Worker
                    </Text>
                  </View>

                  <MaterialCommunityIcons name="chevron-right" size={16} color="#cbd5e1" />

                  <View style={[styles.stepItem, etapaAtual === 'SUCESSO' && styles.stepActiveSucesso]}>
                    <MaterialCommunityIcons
                      name="check-all"
                      size={18}
                      color={etapaAtual === 'SUCESSO' ? '#ffffff' : '#64748b'}
                    />
                    <Text style={[styles.stepLabel, etapaAtual === 'SUCESSO' && styles.stepTextActive]}>
                      4. Sucesso
                    </Text>
                  </View>
                </View>

                {/* Terminal de Logs */}
                <View style={styles.terminalWrapper}>
                  <View style={styles.terminalHeader}>
                    <View style={styles.terminalDots}>
                      <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                      <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
                      <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                    </View>
                    <Text style={styles.terminalTitle}>Event Logs em Tempo Real</Text>
                    <TouchableOpacity onPress={handleLimparLogs}>
                      <Text style={styles.clearLogsText}>Limpar</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.terminalBody} showsVerticalScrollIndicator={true}>
                    {logs.map((log) => (
                      <View key={log.id} style={styles.logRow}>
                        <Text style={styles.logTimestamp}>[{log.timestamp}]</Text>
                        <View style={[styles.typeBadge, { backgroundColor: getCorTipo(log.tipo) }]}>
                          <Text style={styles.typeBadgeText}>{log.tipo}</Text>
                        </View>
                        <Text style={styles.logMessage}>{log.mensagem}</Text>
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
  scrollContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1100,
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
  cardPadding: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionSubtitle: {
    color: '#64748b',
    marginTop: 2,
  },
  input: {
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  submitButton: {
    marginTop: 18,
    borderRadius: 10,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  successTitle: {
    fontWeight: '800',
    color: '#047857',
  },
  chamadoSummary: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chamadoIdText: {
    fontWeight: '800',
    color: '#4f46e5',
    fontSize: 13,
  },
  badgeConcluido: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  pipelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 5,
  },
  stepActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  stepActiveSucesso: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  stepTextActive: {
    color: '#ffffff',
  },
  terminalWrapper: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  terminalHeader: {
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
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  terminalTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  clearLogsText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  terminalBody: {
    maxHeight: 280,
    padding: 12,
  },
  logRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  logTimestamp: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: 'monospace' as any,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  logMessage: {
    color: '#e2e8f0',
    fontSize: 12,
    flexShrink: 1,
    fontFamily: 'monospace' as any,
  },
});
