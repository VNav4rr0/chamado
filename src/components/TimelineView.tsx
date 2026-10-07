import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HistoricoChamado, STATUS_INFO } from '../types/chamado';

interface TimelineViewProps {
  historico: HistoricoChamado[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ historico }) => {
  const theme = useTheme();

  if (!historico || historico.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
          Nenhum evento registrado.
        </Text>
      </View>
    );
  }

  const sorted = [...historico].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  return (
    <View style={styles.container}>
      {sorted.map((item, index) => {
        const isLast = index === sorted.length - 1;
        const statusConfig = STATUS_INFO[item.statusNovo] || STATUS_INFO.ABERTO;
        const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        return (
          <View key={item.id || index} style={styles.timelineRow}>
            {/* Coluna da Linha e Nó */}
            <View style={styles.nodeColumn}>
              <View
                style={[
                  styles.nodeOuterRing,
                  { backgroundColor: statusConfig.bgLight, borderColor: statusConfig.borderLight },
                ]}
              >
                <View style={[styles.nodeDot, { backgroundColor: statusConfig.color }]} />
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.verticalLine,
                    { backgroundColor: theme.colors.outlineVariant || '#e2e8f0' },
                  ]}
                />
              )}
            </View>

            {/* Conteúdo do Evento */}
            <View style={styles.eventBody}>
              <View style={styles.eventHeader}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusConfig.bgLight, borderColor: statusConfig.borderLight },
                  ]}
                >
                  <Text variant="labelSmall" style={[styles.statusText, { color: statusConfig.color }]}>
                    {item.statusNovo}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.timestampText}>
                  {dataFormatada}
                </Text>
              </View>

              <View
                style={[
                  styles.messageBox,
                  {
                    backgroundColor: theme.colors.surfaceVariant + '35',
                    borderColor: theme.colors.outlineVariant || '#e2e8f0',
                  },
                ]}
              >
                <Text
                  variant="bodySmall"
                  style={[styles.messageText, { color: theme.colors.onSurface }]}
                >
                  {item.observacao}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
  },
  nodeColumn: {
    width: 28,
    alignItems: 'center',
  },
  nodeOuterRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  eventBody: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontWeight: '800',
    fontSize: 10.5,
  },
  timestampText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  messageBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  messageText: {
    lineHeight: 18,
    fontSize: 12.5,
  },
});
