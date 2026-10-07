import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  Text,
  Switch,
  TextInput,
  useTheme,
  Button,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChamado } from '../context/ChamadoContext';

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const {
    useMock,
    setUseMock,
    isDarkMode,
    toggleTheme,
    usuarioId,
    setUsuarioId,
    gatewayUrl,
    setGatewayUrl,
    resetarDados,
    loading,
  } = useChamado();

  const [inputUrl, setInputUrl] = useState(gatewayUrl);
  const [inputUser, setInputUser] = useState(usuarioId);
  const [isSaved, setIsSaved] = useState(false);

  const isDesktop = width >= 900;

  const handleSaveConnection = () => {
    setGatewayUrl(inputUrl.trim());
    setUsuarioId(inputUser.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.webContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.maxWidthWrapper}>
        {/* Header da Página */}
        <View style={styles.pageHeader}>
          <Text variant="headlineMedium" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>
            Configurações & Topologia
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Gerenciamento do ambiente de execução, integração com microsserviços e preferências
          </Text>
        </View>

        {/* Layout em Duas Colunas */}
        <View style={[styles.columnsContainer, { flexDirection: isDesktop ? 'row' : 'column' }]}>
          {/* Coluna 1: Preferências e Gateway (50%) */}
          <View style={[styles.column, isDesktop && { flex: 1 }]}>
            {/* Card: Modo de Execução */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                },
              ]}
            >
              <Text variant="titleMedium" style={styles.cardTitle}>
                Ambiente de Conexão
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 16 }}>
                Defina se a aplicação consumirá a simulação local de filas ou o Gateway Spring
              </Text>

              {/* Switch Mock */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 14 }}>
                  <View style={styles.labelWithIcon}>
                    <MaterialCommunityIcons name="rabbit" size={18} color="#7c3aed" />
                    <Text variant="bodyLarge" style={styles.switchLabel}>
                      Simulador RabbitMQ Embutido
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.switchDesc}>
                    {useMock
                      ? 'Simulação ativa de mensagens assíncronas, Outbox e balanceamento de carga local.'
                      : 'Desativado: O aplicativo realizará chamadas HTTP para o Spring Gateway na porta 8080.'}
                  </Text>
                </View>
                <Switch value={useMock} onValueChange={setUseMock} color="#4f46e5" />
              </View>

              <View style={styles.divider} />

              {/* Switch Tema Escuro */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 14 }}>
                  <View style={styles.labelWithIcon}>
                    <MaterialCommunityIcons
                      name={isDarkMode ? 'weather-night' : 'weather-sunny'}
                      size={18}
                      color={isDarkMode ? '#818cf8' : '#f59e0b'}
                    />
                    <Text variant="bodyLarge" style={styles.switchLabel}>
                      Modo Escuro (Dark Mode)
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.switchDesc}>
                    Interface noturna com alto contraste e redução de cansaço visual.
                  </Text>
                </View>
                <Switch value={isDarkMode} onValueChange={toggleTheme} color="#4f46e5" />
              </View>
            </View>

            {/* Card: Parâmetros da API Spring */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  marginTop: 18,
                },
              ]}
            >
              <Text variant="titleMedium" style={styles.cardTitle}>
                Parâmetros do Spring Cloud Gateway
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 14 }}>
                Endpoints do roteador de microsserviços na porta 8080
              </Text>

              <TextInput
                label="URL Base do Gateway"
                value={inputUrl}
                onChangeText={setInputUrl}
                mode="outlined"
                outlineColor={isDarkMode ? '#334155' : '#cbd5e1'}
                activeOutlineColor="#4f46e5"
                style={styles.input}
                placeholder="http://localhost:8080"
                left={<TextInput.Icon icon="server-network" />}
              />

              <TextInput
                label="ID do Solicitante (Header X-Usuario-Id)"
                value={inputUser}
                onChangeText={setInputUser}
                mode="outlined"
                outlineColor={isDarkMode ? '#334155' : '#cbd5e1'}
                activeOutlineColor="#4f46e5"
                style={[styles.input, { marginTop: 10 }]}
                placeholder="user-fatec-1"
                left={<TextInput.Icon icon="account-badge-outline" />}
              />

              <Button
                mode="contained-tonal"
                onPress={handleSaveConnection}
                style={{ marginTop: 14, borderRadius: 12 }}
                icon={isSaved ? 'check' : 'content-save-outline'}
              >
                {isSaved ? 'Configurações Salvas!' : 'Salvar Parâmetros de Conexão'}
              </Button>
            </View>
          </View>

          {/* Coluna 2: Topologia & Reset (50%) */}
          <View style={[styles.column, isDesktop && { flex: 1, marginLeft: 20 }]}>
            {/* Card: Topologia de Microsserviços */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                },
              ]}
            >
              <Text variant="titleMedium" style={styles.cardTitle}>
                Arquitetura de Microsserviços
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 16 }}>
                Topologia distribuída orientada a eventos RabbitMQ
              </Text>

              <View style={styles.serviceItem}>
                <View style={[styles.serviceIconWrap, { backgroundColor: '#eef2ff' }]}>
                  <MaterialCommunityIcons name="shield-check" size={20} color="#4f46e5" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="labelLarge" style={{ fontWeight: '800' }}>
                    Spring Cloud Gateway
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Porta 8080 • Validação JWT e header X-Usuario-Id
                  </Text>
                </View>
              </View>

              <View style={styles.serviceDivider} />

              <View style={styles.serviceItem}>
                <View style={[styles.serviceIconWrap, { backgroundColor: '#f5f3ff' }]}>
                  <MaterialCommunityIcons name="ticket-account" size={20} color="#7c3aed" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="labelLarge" style={{ fontWeight: '800' }}>
                    chamado-service
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Porta 8081 • Transactional Outbox Pattern e Timeline
                  </Text>
                </View>
              </View>

              <View style={styles.serviceDivider} />

              <View style={styles.serviceItem}>
                <View style={[styles.serviceIconWrap, { backgroundColor: '#ecfdf5' }]}>
                  <MaterialCommunityIcons name="account-group" size={20} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="labelLarge" style={{ fontWeight: '800' }}>
                    atendimento-service
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Porta 8082 • Alocação de Técnicos por Menor Carga e SLA
                  </Text>
                </View>
              </View>

              <View style={styles.serviceDivider} />

              <View style={styles.serviceItem}>
                <View style={[styles.serviceIconWrap, { backgroundColor: '#ffedd5' }]}>
                  <MaterialCommunityIcons name="rabbit" size={20} color="#ea580c" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="labelLarge" style={{ fontWeight: '800' }}>
                    RabbitMQ Cluster & DLQ
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Porta 5672 (AMQP) / 15672 (Management Web UI)
                  </Text>
                </View>
              </View>
            </View>

            {/* Card: Restauração */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  marginTop: 18,
                },
              ]}
            >
              <Text variant="titleMedium" style={styles.cardTitle}>
                Dados de Demonstração
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 14 }}>
                Restaura o armazenamento local com os 8 técnicos e chamados de exemplo
              </Text>

              <Button
                mode="outlined"
                textColor="#ef4444"
                style={{ borderColor: '#ef4444', borderRadius: 12 }}
                icon="refresh"
                onPress={resetarDados}
                loading={loading}
                disabled={loading}
              >
                Restaurar Dados Originais de Fábrica
              </Button>
            </View>
          </View>
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
  columnsContainer: {
    gap: 16,
  },
  column: {
    flex: 1,
  },
  card: {
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
  cardTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontWeight: '800',
  },
  switchDesc: {
    color: '#64748b',
    marginTop: 3,
    lineHeight: 17,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 14,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  serviceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
  },
});
