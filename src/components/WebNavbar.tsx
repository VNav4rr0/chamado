import React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChamado } from '../context/ChamadoContext';

export type WebTabKey = 'chamados' | 'novo' | 'tecnicos' | 'config';

interface WebNavbarProps {
  activeTab: WebTabKey;
  onSelectTab: (tab: WebTabKey) => void;
  selectedChamadoId: string | null;
  onBackToChamados: () => void;
}

interface NavItem {
  key: WebTabKey;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'chamados', label: 'Meus Chamados', icon: 'ticket-confirmation-outline' },
  { key: 'novo', label: 'Abrir Chamado', icon: 'plus-circle-outline' },
  { key: 'tecnicos', label: 'Equipe Técnica', icon: 'account-group-outline' },
  { key: 'config', label: 'Configurações', icon: 'cog-outline' },
];

export const WebNavbar: React.FC<WebNavbarProps> = ({
  activeTab,
  onSelectTab,
  selectedChamadoId,
  onBackToChamados,
}) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { isDarkMode, toggleTheme, useMock, usuarioId } = useChamado();

  const isDesktop = width >= 768;

  return (
    <header
      style={{
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
        position: 'sticky' as any,
        top: 0,
        zIndex: 100,
        boxShadow: isDarkMode
          ? '0 4px 20px rgba(0,0,0,0.4)'
          : '0 2px 12px rgba(15,23,42,0.04)',
      }}
    >
      <View style={styles.innerContainer}>
        {/* Lado Esquerdo: Marca / Logo */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBackToChamados}
          style={styles.brandContainer}
        >
          <LinearGradient
            colors={['#4f46e5', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBadge}
          >
            <MaterialCommunityIcons name="headset" size={22} color="#ffffff" />
          </LinearGradient>

          <View style={styles.brandTitles}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="titleMedium" style={[styles.brandName, { color: theme.colors.onSurface }]}>
                Central de Chamados
              </Text>
              <View style={styles.enterpriseBadge}>
                <Text style={styles.enterpriseText}>PORTAL WEB</Text>
              </View>
            </View>
            <Text variant="bodySmall" style={styles.brandSubtitle}>
              Arquitetura de Microsserviços & RabbitMQ
            </Text>
          </View>
        </TouchableOpacity>

        {/* Centro: Links de Navegação Desktop */}
        <View style={styles.navLinks}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key && !selectedChamadoId;
            const activeColor = isDarkMode ? '#818cf8' : '#4f46e5';

            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.7}
                onPress={() => onSelectTab(item.key)}
                style={[
                  styles.navButton,
                  isActive && {
                    backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.15)' : '#eef2ff',
                    borderColor: isDarkMode ? 'rgba(99, 102, 241, 0.3)' : '#c7d2fe',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={18}
                  color={isActive ? activeColor : isDarkMode ? '#94a3b8' : '#64748b'}
                />
                <Text
                  variant="labelLarge"
                  style={{
                    color: isActive ? activeColor : isDarkMode ? '#cbd5e1' : '#475569',
                    fontWeight: isActive ? '800' : '600',
                    fontSize: 13.5,
                    marginLeft: 6,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Lado Direito: Status, Tema & Perfil */}
        <View style={styles.rightActions}>
          {/* Badge de Ambiente */}
          {isDesktop && (
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: useMock
                    ? isDarkMode
                      ? 'rgba(124, 58, 237, 0.15)'
                      : '#f5f3ff'
                    : isDarkMode
                    ? 'rgba(16, 185, 129, 0.15)'
                    : '#ecfdf5',
                  borderColor: useMock
                    ? isDarkMode
                      ? 'rgba(167, 139, 250, 0.3)'
                      : '#ddd6fe'
                    : isDarkMode
                    ? 'rgba(52, 211, 153, 0.3)'
                    : '#a7f3d0',
                },
              ]}
            >
              <View
                style={[
                  styles.pulseDot,
                  { backgroundColor: useMock ? '#8b5cf6' : '#10b981' },
                ]}
              />
              <Text
                variant="labelSmall"
                style={{
                  color: useMock ? '#7c3aed' : '#059669',
                  fontWeight: '800',
                  fontSize: 11,
                }}
              >
                {useMock ? 'RabbitMQ Ativo' : 'Gateway Conectado'}
              </Text>
            </View>
          )}

          {/* Botão Alternar Tema */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleTheme}
            style={[
              styles.themeToggle,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.04)',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isDarkMode ? 'weather-sunny' : 'weather-night'}
              size={18}
              color={isDarkMode ? '#fbbf24' : '#475569'}
            />
          </TouchableOpacity>

          {/* Perfil do Usuário */}
          {isDesktop && (
            <View
              style={[
                styles.userPill,
                {
                  backgroundColor: isDarkMode
                    ? 'rgba(255,255,255,0.04)'
                    : '#f8fafc',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                },
              ]}
            >
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {usuarioId.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text variant="labelMedium" style={{ fontWeight: '800', fontSize: 12 }}>
                  {usuarioId}
                </Text>
                <Text variant="bodySmall" style={{ color: '#94a3b8', fontSize: 10 }}>
                  Solicitante
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </header>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    maxWidth: 1360,
    width: '100%',
    marginHorizontal: 'auto' as any,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer' as any,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandTitles: {
    justifyContent: 'center',
  },
  brandName: {
    fontWeight: '900',
    letterSpacing: -0.4,
    fontSize: 18,
  },
  enterpriseBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  enterpriseText: {
    color: '#4f46e5',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 1,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    cursor: 'pointer' as any,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  themeToggle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer' as any,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
});
