import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  Text,
  Button,
  Portal,
  Dialog,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChamado } from '../context/ChamadoContext';
import {
  CATEGORIA_INFO,
  PRIORIDADE_INFO,
  STATUS_INFO,
} from '../types/chamado';
import { SlaCountdown } from '../components/SlaCountdown';
import { TimelineView } from '../components/TimelineView';

interface ChamadoDetailScreenProps {
  chamadoId: string;
  onBack: () => void;
}

export const ChamadoDetailScreen: React.FC<ChamadoDetailScreenProps> = ({
  chamadoId,
  onBack,
}) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { chamados, resolverChamado, loading, isDarkMode } = useChamado();
  const [showConfirmResolve, setShowConfirmResolve] = useState(false);

  const isDesktop = width >= 900;

  const chamado = chamados.find((c) => c.id === chamadoId);

  if (!chamado) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text variant="titleMedium" style={{ marginTop: 12 }}>
          Chamado não localizado
        </Text>
        <Button mode="contained" onPress={onBack} style={{ marginTop: 16 }}>
          Voltar para lista
        </Button>
      </View>
    );
  }

  const cat = CATEGORIA_INFO[chamado.categoria] || CATEGORIA_INFO.SOFTWARE;
  const prio = PRIORIDADE_INFO[chamado.prioridade] || PRIORIDADE_INFO.MEDIA;
  const status = STATUS_INFO[chamado.status] || STATUS_INFO.ABERTO;

  const isResolvido = chamado.status === 'RESOLVIDO';
  const isProcessando = chamado.status === 'ABERTO';
  const isAguardandoFila = chamado.status === 'AGUARDANDO_TECNICO';

  const handleConfirmResolve = async () => {
    setShowConfirmResolve(false);
    await resolverChamado(chamado.id);
  };

  return (
    <ScrollView contentContainerStyle={styles.webContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.maxWidthWrapper}>
        {/* Breadcrumb de Navegação Web */}
        <View style={styles.breadcrumbRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.breadcrumbLink}>
            <MaterialCommunityIcons name="arrow-left" size={16} color="#4f46e5" />
            <Text style={styles.breadcrumbText}>Chamados</Text>
          </TouchableOpacity>
          <Text style={{ color: '#94a3b8', marginHorizontal: 8 }}>/</Text>
          <Text style={{ color: theme.colors.outline, fontSize: 13 }}>
            Detalhes do Atendimento
          </Text>
          <Text style={{ color: '#94a3b8', marginHorizontal: 8 }}>/</Text>
          <Text style={{ fontWeight: '800', color: theme.colors.onSurface, fontSize: 13 }}>
            {chamado.protocolo || 'Aguardando Protocolo'}
          </Text>
        </View>

        {/* Banners de Estado Intermediário */}
        {isProcessando && (
          <View style={[styles.alertBanner, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
            <ActivityIndicator animating={true} size="small" color="#2563eb" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text variant="labelLarge" style={{ color: '#1e40af', fontWeight: '800' }}>
                Processamento Assíncrono no RabbitMQ...
              </Text>
              <Text variant="bodySmall" style={{ color: '#1d4ed8', marginTop: 2 }}>
                O chamado está no transactional outbox. O atendimento-service selecionará automaticamente o técnico de menor carga.
              </Text>
            </View>
          </View>
        )}

        {isAguardandoFila && (
          <View style={[styles.alertBanner, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
            <MaterialCommunityIcons name="timer-sand" size={24} color="#d97706" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text variant="labelLarge" style={{ color: '#92400e', fontWeight: '800' }}>
                Fila de Espera Ativa
              </Text>
              <Text variant="bodySmall" style={{ color: '#b45309', marginTop: 2 }}>
                Todos os especialistas de {cat.label} estão no limite de capacidade. O atendimento será aberto automaticamente na liberação de uma vaga.
              </Text>
            </View>
          </View>
        )}

        {/* Layout Web em Duas Colunas */}
        <View style={[styles.columnsContainer, { flexDirection: isDesktop ? 'row' : 'column' }]}>
          {/* Coluna Principal: Título, Descrição & Linha do Tempo (65%) */}
          <View style={[styles.mainColumn, isDesktop && { flex: 1.6 }]}>
            {/* Card Hero */}
            <View
              style={[
                styles.webCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                },
              ]}
            >
              <View style={styles.heroTopRow}>
                <View>
                  <Text variant="labelSmall" style={{ color: theme.colors.outline, fontWeight: '700' }}>
                    NÚMERO DE PROTOCOLO
                  </Text>
                  <Text variant="headlineSmall" style={styles.protocolTitle}>
                    {chamado.protocolo || 'Aguardando Geração RabbitMQ'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: status.bgLight, borderColor: status.borderLight },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text variant="labelMedium" style={{ color: status.color, fontWeight: '800' }}>
                    {status.label}
                  </Text>
                </View>
              </View>

              {/* Tags de Categoria e Prioridade */}
              <View style={styles.badgesRow}>
                <View style={[styles.badge, { backgroundColor: cat.bgLight }]}>
                  <MaterialCommunityIcons name={cat.icon as any} size={15} color={cat.color} />
                  <Text variant="labelMedium" style={{ color: cat.color, fontWeight: '800', marginLeft: 6 }}>
                    {cat.label}
                  </Text>
                </View>

                <View style={[styles.badge, { backgroundColor: prio.bgLight }]}>
                  <MaterialCommunityIcons name={prio.icon as any} size={15} color={prio.color} />
                  <Text variant="labelMedium" style={{ color: prio.color, fontWeight: '800', marginLeft: 6 }}>
                    Prioridade {prio.label} ({prio.horas}h SLA)
                  </Text>
                </View>
              </View>

              <Text variant="titleLarge" style={[styles.chamadoTitle, { color: theme.colors.onSurface }]}>
                {chamado.titulo}
              </Text>

              <View
                style={[
                  styles.descBox,
                  {
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                  },
                ]}
              >
                <Text variant="bodyMedium" style={[styles.chamadoDesc, { color: theme.colors.onSurface }]}>
                  {chamado.descricao}
                </Text>
              </View>
            </View>

            {/* Linha do Tempo Visual */}
            <View
              style={[
                styles.webCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  marginTop: 18,
                },
              ]}
            >
              <View style={styles.timelineHeader}>
                <View>
                  <Text variant="titleMedium" style={{ fontWeight: '800' }}>
                    Histórico de Eventos & Transições
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Eventos consumidos no RabbitMQ e registrados no banco
                  </Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#4f46e5' }}>
                    {chamado.historico?.length || 0} registros
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <TimelineView historico={chamado.historico || []} />
              </View>
            </View>
          </View>

          {/* Coluna Lateral: SLA, Técnico & Ações (35%) */}
          <View style={[styles.sideColumn, isDesktop && { flex: 1, marginLeft: 20 }]}>
            {/* Card de Monitoramento de SLA */}
            <View
              style={[
                styles.webCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                },
              ]}
            >
              <Text variant="titleSmall" style={styles.sideCardTitle}>
                Acordo de Nível de Serviço (SLA)
              </Text>
              <View style={{ marginTop: 8 }}>
                <SlaCountdown
                  slaPrazo={chamado.slaPrazo}
                  criadoEm={chamado.criadoEm}
                  status={chamado.status}
                />
              </View>
            </View>

            {/* Card do Técnico Responsável */}
            <View
              style={[
                styles.webCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  marginTop: 18,
                },
              ]}
            >
              <Text variant="titleSmall" style={styles.sideCardTitle}>
                Técnico Responsável
              </Text>

              <View style={styles.tecnicoProfileRow}>
                <LinearGradient
                  colors={chamado.tecnicoNome ? cat.gradient : ['#94a3b8', '#cbd5e1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tecnicoAvatar}
                >
                  <MaterialCommunityIcons
                    name={chamado.tecnicoNome ? 'account-tie' : 'account-clock'}
                    size={26}
                    color="#ffffff"
                  />
                </LinearGradient>

                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '800', fontSize: 16 }}>
                    {chamado.tecnicoNome || 'Alocação Assíncrona'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 2 }}>
                    {chamado.tecnicoNome
                      ? `Especialista em ${cat.label} (atendimento-service)`
                      : 'Aguardando atribuição pelo RabbitMQ'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Botão de Resolução */}
            {!isResolvido && (
              <View style={{ marginTop: 18 }}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => setShowConfirmResolve(true)}
                  disabled={loading}
                  style={styles.resolveBtnWrapper}
                >
                  <LinearGradient
                    colors={['#059669', '#10b981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.resolveBtnGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="check-circle" size={20} color="#ffffff" />
                        <Text variant="labelLarge" style={styles.resolveBtnText}>
                          Marcar Atendimento como Resolvido
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Confirmação de Resolução */}
      <Portal>
        <Dialog visible={showConfirmResolve} onDismiss={() => setShowConfirmResolve(false)}>
          <Dialog.Title style={{ fontWeight: '800' }}>Concluir Atendimento?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ lineHeight: 22 }}>
              A resolução finaliza o chamado, atualiza o status para <Text style={{ fontWeight: '700' }}>RESOLVIDO</Text>, libera a carga do técnico (-1) e desrepresa chamados da fila de espera do RabbitMQ.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmResolve(false)} textColor="#64748b">
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirmResolve}
              style={{ backgroundColor: '#10b981' }}
            >
              Confirmar Resolução
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  maxWidthWrapper: {
    maxWidth: 1360,
    width: '100%',
    marginHorizontal: 'auto' as any,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  breadcrumbLink: {
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer' as any,
  },
  breadcrumbText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  columnsContainer: {
    gap: 16,
  },
  mainColumn: {
    flex: 1,
  },
  sideColumn: {
    flex: 1,
  },
  webCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  protocolTitle: {
    fontWeight: '900',
    color: '#4f46e5',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chamadoTitle: {
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: -0.4,
    lineHeight: 28,
    marginBottom: 12,
  },
  descBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  chamadoDesc: {
    lineHeight: 24,
    fontSize: 14.5,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  sideCardTitle: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tecnicoProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  tecnicoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolveBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  resolveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    cursor: 'pointer' as any,
  },
  resolveBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14.5,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
});
