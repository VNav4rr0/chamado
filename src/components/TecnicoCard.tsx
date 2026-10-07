import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tecnico, CATEGORIA_INFO } from '../types/chamado';

interface TecnicoCardProps {
  tecnico: Tecnico;
}

export const TecnicoCard: React.FC<TecnicoCardProps> = ({ tecnico }) => {
  const theme = useTheme();
  const cat = CATEGORIA_INFO[tecnico.especialidade] || CATEGORIA_INFO.SOFTWARE;

  const percentual =
    tecnico.capacidadeMax > 0
      ? Math.min(1, tecnico.cargaAtual / tecnico.capacidadeMax)
      : 0;

  const isLotado = tecnico.cargaAtual >= tecnico.capacidadeMax;
  const isQuaseLotado = percentual >= 0.75 && !isLotado;

  let progressColor = '#10b981'; // verde
  let statusBadgeBg = '#ecfdf5';
  let statusBadgeBorder = '#a7f3d0';
  let statusBadgeText = '#059669';
  let statusLabel = 'Disponível';

  if (isLotado) {
    progressColor = '#ef4444'; // vermelho
    statusBadgeBg = '#fef2f2';
    statusBadgeBorder = '#fecaca';
    statusBadgeText = '#dc2626';
    statusLabel = 'Lotado';
  } else if (isQuaseLotado) {
    progressColor = '#f59e0b'; // amarelo
    statusBadgeBg = '#fffbeb';
    statusBadgeBorder = '#fde68a';
    statusBadgeText = '#d97706';
    statusLabel = 'Carga Alta';
  }

  const initials = tecnico.nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant || '#e2e8f0',
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.profileRow}>
          <LinearGradient
            colors={cat.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>

          <View style={styles.infoCol}>
            <Text variant="titleMedium" style={[styles.name, { color: theme.colors.onSurface }]}>
              {tecnico.nome}
            </Text>
            <View style={[styles.specialtyTag, { backgroundColor: cat.bgLight }]}>
              <MaterialCommunityIcons name={cat.icon as any} size={12} color={cat.color} />
              <Text variant="labelSmall" style={{ color: cat.color, fontWeight: '700', marginLeft: 4 }}>
                {cat.label}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            { backgroundColor: statusBadgeBg, borderColor: statusBadgeBorder },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: progressColor }]} />
          <Text variant="labelSmall" style={{ color: statusBadgeText, fontWeight: '800' }}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Medidor de Ocupação */}
      <View style={styles.meterSection}>
        <View style={styles.meterHeader}>
          <Text variant="bodySmall" style={{ color: theme.colors.outline, fontWeight: '600', fontSize: 11.5 }}>
            Ocupação de Capacidade
          </Text>
          <Text variant="labelMedium" style={{ fontWeight: '800', color: progressColor }}>
            {tecnico.cargaAtual} de {tecnico.capacidadeMax} chamados ({Math.round(percentual * 100)}%)
          </Text>
        </View>

        <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${Math.round(percentual * 100)}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    cursor: 'pointer' as any,
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarGradient: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 15,
  },
  infoCol: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  specialtyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  meterSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
