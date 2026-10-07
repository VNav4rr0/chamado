import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  Text,
  Searchbar,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChamado } from '../context/ChamadoContext';
import { ChamadoCard } from '../components/ChamadoCard';
import { Chamado, StatusChamado, STATUS_INFO, CategoriaChamado, CATEGORIA_INFO } from '../types/chamado';

interface ChamadosListScreenProps {
  onSelectChamado: (chamado: Chamado) => void;
  onOpenNovoChamado: () => void;
}

type FilterStatus = 'TODOS' | StatusChamado;

export const ChamadosListScreen: React.FC<ChamadosListScreenProps> = ({
  onSelectChamado,
  onOpenNovoChamado,
}) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { chamados, loading, refreshing, carregarDados, isDarkMode } = useChamado();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('TODOS');
  const [selectedCategory, setSelectedCategory] = useState<CategoriaChamado | 'TODAS'>('TODAS');

  const isDesktop = width >= 992;
  const isTablet = width >= 640 && width < 992;

  // Métricas
  const metrics = useMemo(() => {
    const total = chamados.length;
    const emAtendimento = chamados.filter((c) => c.status === 'EM_ATENDIMENTO').length;
    const aguardando = chamados.filter(
      (c) => c.status === 'AGUARDANDO_TECNICO' || c.status === 'ABERTO'
    ).length;
    const resolvidos = chamados.filter((c) => c.status === 'RESOLVIDO').length;
    return { total, emAtendimento, aguardando, resolvidos };
  }, [chamados]);

  // Lista filtrada
  const filteredChamados = useMemo(() => {
    return chamados.filter((item) => {
      const matchStatus =
        selectedStatus === 'TODOS' || item.status === selectedStatus;

      const matchCategory =
        selectedCategory === 'TODAS' || item.categoria === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.titulo.toLowerCase().includes(q) ||
        item.descricao.toLowerCase().includes(q) ||
        (item.protocolo && item.protocolo.toLowerCase().includes(q)) ||
        (item.tecnicoNome && item.tecnicoNome.toLowerCase().includes(q));

      return matchStatus && matchCategory && matchQuery;
    });
  }, [chamados, selectedStatus, selectedCategory, searchQuery]);

  return (
    <ScrollView
      contentContainerStyle={styles.webContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={carregarDados}
          colors={['#4f46e5']}
        />
      }
    >
      <View style={styles.maxWidthWrapper}>
        {/* Cabeçalho da Página Web */}
        <View style={styles.pageHeader}>
          <View>
            <Text variant="headlineMedium" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>
              Gestão de Chamados
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Acompanhamento de tickets em tempo real com SLA e balanceamento RabbitMQ
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onOpenNovoChamado}
            style={styles.newTicketBtnWrapper}
          >
            <LinearGradient
              colors={['#4f46e5', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.newTicketBtn}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#ffffff" />
              <Text variant="labelLarge" style={styles.newTicketBtnText}>
                Abrir Novo Chamado
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 4 Cards de Métricas em Linha para Web */}
        <View style={styles.metricsRow}>
          {/* Total */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
          >
            <View style={styles.metricCardHeader}>
              <Text variant="labelSmall" style={styles.metricLabel}>
                TOTAL DE CHAMADOS
              </Text>
              <View style={[styles.metricIconWrap, { backgroundColor: '#eef2ff' }]}>
                <MaterialCommunityIcons name="ticket-outline" size={18} color="#4f46e5" />
              </View>
            </View>
            <Text variant="headlineMedium" style={[styles.metricValue, { color: theme.colors.onSurface }]}>
              {metrics.total}
            </Text>
            <Text variant="bodySmall" style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
              Histórico consolidado
            </Text>
          </View>

          {/* Em Atendimento */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
          >
            <View style={styles.metricCardHeader}>
              <Text variant="labelSmall" style={styles.metricLabel}>
                EM ANDAMENTO
              </Text>
              <View style={[styles.metricIconWrap, { backgroundColor: '#f5f3ff' }]}>
                <MaterialCommunityIcons name="progress-wrench" size={18} color="#7c3aed" />
              </View>
            </View>
            <Text variant="headlineMedium" style={[styles.metricValue, { color: '#7c3aed' }]}>
              {metrics.emAtendimento}
            </Text>
            <Text variant="bodySmall" style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
              Técnicos alocados
            </Text>
          </View>

          {/* Na Fila */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
          >
            <View style={styles.metricCardHeader}>
              <Text variant="labelSmall" style={styles.metricLabel}>
                AGUARDANDO TÉCNICO
              </Text>
              <View style={[styles.metricIconWrap, { backgroundColor: '#fffbeb' }]}>
                <MaterialCommunityIcons name="timer-sand" size={18} color="#d97706" />
              </View>
            </View>
            <Text variant="headlineMedium" style={[styles.metricValue, { color: '#d97706' }]}>
              {metrics.aguardando}
            </Text>
            <Text variant="bodySmall" style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
              Represados no RabbitMQ
            </Text>
          </View>

          {/* Resolvidos */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
          >
            <View style={styles.metricCardHeader}>
              <Text variant="labelSmall" style={styles.metricLabel}>
                RESOLVIDOS
              </Text>
              <View style={[styles.metricIconWrap, { backgroundColor: '#ecfdf5' }]}>
                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#10b981" />
              </View>
            </View>
            <Text variant="headlineMedium" style={[styles.metricValue, { color: '#10b981' }]}>
              {metrics.resolvidos}
            </Text>
            <Text variant="bodySmall" style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
              Atendimentos finalizados
            </Text>
          </View>
        </View>

        {/* Barra de Filtros e Busca Web */}
        <View
          style={[
            styles.filterBarCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
        >
          {/* Busca Web */}
          <Searchbar
            placeholder="Buscar por protocolo (ex: CH-2026), título, descrição ou técnico..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[
              styles.webSearch,
              {
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
            inputStyle={{ fontSize: 13.5 }}
            iconColor="#4f46e5"
          />

          {/* Filtros em Abas de Status */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusScroll}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedStatus('TODOS')}
              style={[
                styles.tabFilterPill,
                selectedStatus === 'TODOS'
                  ? { backgroundColor: '#4f46e5', borderColor: '#4f46e5' }
                  : {
                      backgroundColor: 'transparent',
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                    },
              ]}
            >
              <Text
                variant="labelMedium"
                style={{
                  color: selectedStatus === 'TODOS' ? '#ffffff' : theme.colors.onSurface,
                  fontWeight: selectedStatus === 'TODOS' ? '800' : '600',
                }}
              >
                Todos ({metrics.total})
              </Text>
            </TouchableOpacity>

            {(['EM_ATENDIMENTO', 'AGUARDANDO_TECNICO', 'ABERTO', 'RESOLVIDO'] as StatusChamado[]).map(
              (statusKey) => {
                const config = STATUS_INFO[statusKey];
                const isSelected = selectedStatus === statusKey;
                const count = chamados.filter((c) => c.status === statusKey).length;

                return (
                  <TouchableOpacity
                    key={statusKey}
                    activeOpacity={0.8}
                    onPress={() => setSelectedStatus(statusKey)}
                    style={[
                      styles.tabFilterPill,
                      isSelected
                        ? { backgroundColor: config.color, borderColor: config.color }
                        : {
                            backgroundColor: 'transparent',
                            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                          },
                    ]}
                  >
                    <View
                      style={[
                        styles.miniDot,
                        { backgroundColor: isSelected ? '#ffffff' : config.color },
                      ]}
                    />
                    <Text
                      variant="labelMedium"
                      style={{
                        color: isSelected ? '#ffffff' : theme.colors.onSurface,
                        fontWeight: isSelected ? '800' : '600',
                      }}
                    >
                      {config.label} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </ScrollView>

          {/* Filtro secundário por Categoria */}
          <View style={styles.categoryFilterRow}>
            <Text variant="labelSmall" style={{ color: theme.colors.outline, fontWeight: '700', marginRight: 10 }}>
              FILTRAR POR DEPARTAMENTO:
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedCategory('TODAS')}
              style={[
                styles.categoryChip,
                selectedCategory === 'TODAS' && { backgroundColor: isDarkMode ? '#1e1b4b' : '#eef2ff' },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: selectedCategory === 'TODAS' ? '800' : '600',
                  color: selectedCategory === 'TODAS' ? '#4f46e5' : theme.colors.outline,
                }}
              >
                Todas
              </Text>
            </TouchableOpacity>

            {(['REDE', 'HARDWARE', 'SOFTWARE', 'ACESSO'] as CategoriaChamado[]).map((catKey) => {
              const cat = CATEGORIA_INFO[catKey];
              const isSelected = selectedCategory === catKey;

              return (
                <TouchableOpacity
                  key={catKey}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(catKey)}
                  style={[
                    styles.categoryChip,
                    isSelected && { backgroundColor: cat.bgLight },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={13}
                    color={isSelected ? cat.color : theme.colors.outline}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isSelected ? '800' : '600',
                      color: isSelected ? cat.color : theme.colors.outline,
                      marginLeft: 4,
                    }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Loading ou Lista em Grid Responsivo */}
        {loading && !refreshing && chamados.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text variant="bodyMedium" style={{ marginTop: 14, color: theme.colors.outline }}>
              Sincronizando fila de chamados...
            </Text>
          </View>
        ) : filteredChamados.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
          >
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="clipboard-text-search-outline" size={44} color={theme.colors.outline} />
            </View>
            <Text variant="titleMedium" style={{ fontWeight: '800', marginTop: 12 }}>
              Nenhum chamado localizado
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, textAlign: 'center', marginTop: 6, maxWidth: 440 }}>
              Não há solicitações correspondentes aos critérios de busca ou filtros selecionados.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onOpenNovoChamado}
              style={{ marginTop: 18 }}
            >
              <LinearGradient
                colors={['#4f46e5', '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyCreateBtn}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 13.5, marginLeft: 6 }}>
                  Abrir Novo Chamado
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsGrid}>
            {filteredChamados.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.gridItem,
                  {
                    width: isDesktop ? '49.2%' : isTablet ? '49%' : '100%',
                  },
                ]}
              >
                <ChamadoCard chamado={item} onPress={() => onSelectChamado(item)} />
              </View>
            ))}
          </View>
        )}
      </View>
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
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 16,
  },
  pageTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  newTicketBtnWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  newTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    cursor: 'pointer' as any,
  },
  newTicketBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    minWidth: 220,
    padding: 16,
    borderRadius: 16,
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
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  filterBarCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  webSearch: {
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    marginBottom: 14,
    elevation: 0,
  },
  statusScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  tabFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    cursor: 'pointer' as any,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    cursor: 'pointer' as any,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    paddingHorizontal: 0,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 48,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
});
