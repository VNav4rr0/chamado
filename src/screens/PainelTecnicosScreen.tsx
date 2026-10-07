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
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChamado } from '../context/ChamadoContext';
import { TecnicoCard } from '../components/TecnicoCard';
import { CategoriaChamado, CATEGORIA_INFO } from '../types/chamado';

export const PainelTecnicosScreen: React.FC = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { painelCarga, tecnicos, refreshing, carregarDados, isDarkMode } = useChamado();
  const [selectedCat, setSelectedCat] = useState<CategoriaChamado | 'TODAS'>('TODAS');

  const isDesktop = width >= 992;
  const isTablet = width >= 640 && width < 992;

  const totalCarga = painelCarga?.totalCarga ?? tecnicos.reduce((acc, t) => acc + t.cargaAtual, 0);
  const totalCapacidade = painelCarga?.totalCapacidade ?? tecnicos.reduce((acc, t) => acc + t.capacidadeMax, 0);
  const percentualGeral = totalCapacidade > 0 ? Math.round((totalCarga / totalCapacidade) * 100) : 0;

  const tecnicosFiltrados = useMemo(() => {
    if (selectedCat === 'TODAS') return tecnicos;
    return tecnicos.filter((t) => t.especialidade === selectedCat);
  }, [tecnicos, selectedCat]);

  const stats = useMemo(() => {
    const lotados = tecnicos.filter((t) => t.cargaAtual >= t.capacidadeMax).length;
    const disponiveis = tecnicos.filter((t) => t.cargaAtual < t.capacidadeMax).length;
    return { lotados, disponiveis, total: tecnicos.length };
  }, [tecnicos]);

  let statusCor = '#10b981'; // verde
  if (percentualGeral >= 80) {
    statusCor = '#ef4444'; // vermelho
  } else if (percentualGeral >= 55) {
    statusCor = '#f59e0b'; // amarelo
  }

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
        {/* Header da Página */}
        <View style={styles.pageHeader}>
          <View>
            <Text variant="headlineMedium" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>
              Painel de Carga dos Técnicos
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Visão de capacidade e balanceamento de carga do microsserviço de atendimento
            </Text>
          </View>
        </View>

        {/* Hero Card de Ocupação da Equipe */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
        >
          <View style={styles.heroHeader}>
            <View>
              <Text variant="titleMedium" style={styles.heroTitle}>
                Taxa de Ocupação Global da Equipe
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Sincronizado em tempo real com o atendimento-service
              </Text>
            </View>

            <View style={[styles.percentBadge, { backgroundColor: statusCor + '15' }]}>
              <Text variant="headlineMedium" style={{ color: statusCor, fontWeight: '900' }}>
                {percentualGeral}%
              </Text>
            </View>
          </View>

          {/* Barra de Progresso */}
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentualGeral}%`,
                  backgroundColor: statusCor,
                },
              ]}
            />
          </View>

          {/* 4 Blocos de Estatísticas */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {totalCarga}
              </Text>
              <Text variant="labelSmall" style={styles.statLabel}>
                CHAMADOS EM ANDAMENTO
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {totalCapacidade}
              </Text>
              <Text variant="labelSmall" style={styles.statLabel}>
                CAPACIDADE MÁXIMA
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={[styles.statValue, { color: '#10b981' }]}>
                {stats.disponiveis}
              </Text>
              <Text variant="labelSmall" style={[styles.statLabel, { color: '#10b981' }]}>
                TÉCNICOS DISPONÍVEIS
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text
                variant="headlineSmall"
                style={[
                  styles.statValue,
                  { color: stats.lotados > 0 ? '#ef4444' : theme.colors.outline },
                ]}
              >
                {stats.lotados}
              </Text>
              <Text
                variant="labelSmall"
                style={[
                  styles.statLabel,
                  { color: stats.lotados > 0 ? '#ef4444' : theme.colors.outline },
                ]}
              >
                CAPACIDADE ESGOTADA
              </Text>
            </View>
          </View>
        </View>

        {/* Banner com a Lógica de Atribuição */}
        <View
          style={[
            styles.ruleBanner,
            {
              backgroundColor: isDarkMode ? '#064e3b' : '#ecfdf5',
              borderColor: isDarkMode ? '#059669' : '#a7f3d0',
            },
          ]}
        >
          <MaterialCommunityIcons name="scale-balance" size={22} color="#10b981" />
          <Text
            variant="bodySmall"
            style={{
              color: isDarkMode ? '#d1fae5' : '#047857',
              marginLeft: 12,
              flex: 1,
              lineHeight: 18,
              fontSize: 12.5,
            }}
          >
            <Text style={{ fontWeight: '800' }}>Balanceamento de Carga Automático:</Text> O serviço de atendimento busca o técnico ativo da especialidade que possua a menor <Text style={{ fontWeight: '800' }}>cargaAtual &lt; capacidadeMax</Text>. Se todos estiverem lotados, o chamado é automaticamente represado na fila de espera.
          </Text>
        </View>

        {/* Filtro em Pills */}
        <View style={styles.filterSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Especialistas Cadastrados ({tecnicosFiltrados.length})
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedCat('TODAS')}
              style={[
                styles.pill,
                selectedCat === 'TODAS'
                  ? { backgroundColor: '#4f46e5', borderColor: '#4f46e5' }
                  : {
                      backgroundColor: theme.colors.surface,
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                    },
              ]}
            >
              <Text
                variant="labelMedium"
                style={{
                  color: selectedCat === 'TODAS' ? '#ffffff' : theme.colors.onSurface,
                  fontWeight: selectedCat === 'TODAS' ? '800' : '600',
                }}
              >
                Todas as Especialidades ({tecnicos.length})
              </Text>
            </TouchableOpacity>

            {(['REDE', 'HARDWARE', 'SOFTWARE', 'ACESSO'] as CategoriaChamado[]).map((catKey) => {
              const catInfo = CATEGORIA_INFO[catKey];
              const isSelected = selectedCat === catKey;
              const count = tecnicos.filter((t) => t.especialidade === catKey).length;

              return (
                <TouchableOpacity
                  key={catKey}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCat(catKey)}
                  style={[
                    styles.pill,
                    isSelected
                      ? { backgroundColor: catInfo.color, borderColor: catInfo.color }
                      : {
                          backgroundColor: theme.colors.surface,
                          borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                        },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={catInfo.icon as any}
                    size={14}
                    color={isSelected ? '#ffffff' : catInfo.color}
                  />
                  <Text
                    variant="labelMedium"
                    style={{
                      color: isSelected ? '#ffffff' : theme.colors.onSurface,
                      fontWeight: isSelected ? '800' : '600',
                    }}
                  >
                    {catInfo.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Grid de Técnicos Responsivo */}
        <View style={styles.gridContainer}>
          {tecnicosFiltrados.map((tec) => (
            <View
              key={tec.id}
              style={[
                styles.gridItem,
                {
                  width: isDesktop ? '49.2%' : isTablet ? '49%' : '100%',
                },
              ]}
            >
              <TecnicoCard tecnico={tec} />
            </View>
          ))}
        </View>
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
    marginBottom: 20,
  },
  pageTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  percentBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#e2e8f0',
  },
  ruleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    cursor: 'pointer' as any,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    paddingHorizontal: 0,
  },
});
