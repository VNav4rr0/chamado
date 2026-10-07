import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="ticket-confirmation" size={24} color="#6366f1" />
        </View>
        <View>
          <Text variant="titleLarge" style={styles.title}>
            Central de Chamados
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Portal Simplificado com Demonstração de Mensageria
          </Text>
        </View>
      </View>
      <View style={styles.statusBadge}>
        <View style={styles.pulseDot} />
        <Text style={styles.statusText}>Mensageria Conectada</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: '#64748b',
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    gap: 7,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
});
