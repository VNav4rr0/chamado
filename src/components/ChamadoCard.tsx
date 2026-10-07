import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Chamado,
  CATEGORIA_INFO,
  PRIORIDADE_INFO,
  STATUS_INFO,
} from '../types/chamado';
import { SlaCountdown } from './SlaCountdown';

interface ChamadoCardProps {
  chamado: Chamado;
  onPress: () => void;
}

export const ChamadoCard: React.FC<ChamadoCardProps> = ({ chamado, onPress }) => {
  const theme = useTheme();
  const cat = CATEGORIA_INFO[chamado.categoria] || CATEGORIA_INFO.SOFTWARE;
  const prio = PRIORIDADE_INFO[chamado.prioridade] || PRIORIDADE_INFO.MEDIA;
  const status = STATUS_INFO[chamado.status] || STATUS_INFO.ABERTO;

  const dataFormatada = new Date(chamado.criadoEm).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.cardWrapper,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant || 'rgba(0,0,0,0.06)',
        },
      ]}
    >
      {/* Barra de Acento Lateral */}
      <View style={[styles.accentBar, { backgroundColor: cat.color }]} />

      <View style={styles.innerContent}>
        {/* Topo: Protocolo + Status Pill */}
        <View style={styles.topRow}>
          <View style={styles.protocolBadge}>
            <MaterialCommunityIcons
              name={chamado.protocolo ? 'pound' : 'sync'}
              size={13}
              color={chamado.protocolo ? '#4f46e5' : '#d97706'}
            />
            <Text
              variant="labelMedium"
              style={[
                styles.protocolText,
                { color: chamado.protocolo ? '#4338ca' : '#b45309' },
              ]}
            >
              {chamado.protocolo || 'Processando Outbox...'}
            </Text>
          </View>

          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: status.bgLight,
                borderColor: status.borderLight,
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text
              variant="labelSmall"
              style={[styles.statusText, { color: status.color }]}
            >
              {status.label}
            </Text>
          </View>
        </View>

        {/* Título do Chamado */}
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.onSurface }]}
          numberOfLines={2}
        >
          {chamado.titulo}
        </Text>

        {/* Descrição Curta */}
        <Text
          variant="bodySmall"
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          numberOfLines={2}
        >
          {chamado.descricao}
        </Text>

        {/* Tags de Categoria e Prioridade */}
        <View style={styles.tagsContainer}>
          <View style={[styles.tag, { backgroundColor: cat.bgLight }]}>
            <MaterialCommunityIcons name={cat.icon as any} size={13} color={cat.color} />
            <Text variant="labelSmall" style={{ color: cat.color, fontWeight: '700', marginLeft: 4 }}>
              {cat.label}
            </Text>
          </View>

          <View style={[styles.tag, { backgroundColor: prio.bgLight }]}>
            <MaterialCommunityIcons name={prio.icon as any} size={13} color={prio.color} />
            <Text variant="labelSmall" style={{ color: prio.color, fontWeight: '700', marginLeft: 4 }}>
              {prio.label} • {prio.horas}h SLA
            </Text>
          </View>
        </View>

        {/* Bloco do Técnico */}
        <View
          style={[
            styles.tecnicoBlock,
            { backgroundColor: theme.colors.surfaceVariant + '40' },
          ]}
        >
          <View style={styles.tecnicoInfo}>
            <View
              style={[
                styles.tecnicoAvatar,
                { backgroundColor: chamado.tecnicoNome ? '#e0e7ff' : '#f1f5f9' },
              ]}
            >
              <MaterialCommunityIcons
                name={chamado.tecnicoNome ? 'account-tie' : 'account-clock-outline'}
                size={16}
                color={chamado.tecnicoNome ? '#4f46e5' : '#94a3b8'}
              />
            </View>
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text
                variant="labelSmall"
                style={{
                  fontWeight: '700',
                  color: chamado.tecnicoNome ? theme.colors.onSurface : theme.colors.outline,
                }}
                numberOfLines={1}
              >
                {chamado.tecnicoNome || 'Aguardando Atribuição RabbitMQ'}
              </Text>
            </View>
          </View>

          <Text variant="bodySmall" style={styles.dateText}>
            {dataFormatada}
          </Text>
        </View>

        {/* Barra de SLA */}
        <View style={styles.slaWrapper}>
          <SlaCountdown
            slaPrazo={chamado.slaPrazo}
            criadoEm={chamado.criadoEm}
            status={chamado.status}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    cursor: 'pointer' as any,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  accentBar: {
    width: 5,
  },
  innerContent: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  protocolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  protocolText: {
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 4,
    letterSpacing: -0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontWeight: '800',
    fontSize: 11,
  },
  title: {
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: -0.3,
    lineHeight: 22,
    marginBottom: 4,
  },
  description: {
    lineHeight: 18,
    marginBottom: 10,
    fontSize: 13,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tecnicoBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  tecnicoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tecnicoAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 6,
  },
  slaWrapper: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    paddingTop: 8,
  },
});
