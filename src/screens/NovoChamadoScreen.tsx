import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  Text,
  TextInput,
  useTheme,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChamado } from '../context/ChamadoContext';
import {
  CategoriaChamado,
  PrioridadeChamado,
  CATEGORIA_INFO,
  PRIORIDADE_INFO,
  SLA_HORAS,
} from '../types/chamado';

interface NovoChamadoScreenProps {
  onSuccess: (chamadoId: string) => void;
  onCancel: () => void;
}

export const NovoChamadoScreen: React.FC<NovoChamadoScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { criarChamado, loading, isDarkMode, tecnicos } = useChamado();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<CategoriaChamado>('REDE');
  const [prioridade, setPrioridade] = useState<PrioridadeChamado>('MEDIA');
  const [touched, setTouched] = useState(false);

  const isDesktop = width >= 900;

  const isTituloValid = titulo.trim().length >= 5;
  const isDescricaoValid = descricao.trim().length >= 10;
  const canSubmit = isTituloValid && isDescricaoValid && !loading;

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit) return;

    try {
      const res = await criarChamado({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        prioridade,
      });
      onSuccess(res.id);
    } catch (e) {
      // Erro gerenciado no contexto
    }
  };

  const categoriaSelecionada = CATEGORIA_INFO[categoria];
  const prioridadeSelecionada = PRIORIDADE_INFO[prioridade];

  // Técnicos da categoria selecionada
  const tecnicosCategoria = tecnicos.filter((t) => t.especialidade === categoria);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={styles.webContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.maxWidthWrapper}>
          {/* Header da Página */}
          <View style={styles.pageHeader}>
            <TouchableOpacity activeOpacity={0.7} onPress={onCancel} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={18} color={theme.colors.onSurface} />
              <Text variant="labelMedium" style={{ marginLeft: 6, fontWeight: '700' }}>
                Voltar aos Chamados
              </Text>
            </TouchableOpacity>

            <Text variant="headlineMedium" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>
              Abertura de Novo Chamado
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Preencha os dados abaixo para registrar sua solicitação no sistema de suporte
            </Text>
          </View>

          {/* Layout Responsivo em Duas Colunas */}
          <View style={[styles.columnsContainer, { flexDirection: isDesktop ? 'row' : 'column' }]}>
            {/* Coluna Principal: Formulário (60%) */}
            <View style={[styles.mainColumn, isDesktop && { flex: 1.4 }]}>
              {/* 1. Seleção de Categoria */}
              <View
                style={[
                  styles.formSectionCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  },
                ]}
              >
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  1. Categoria do Problema
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 14 }}>
                  Identifique o departamento responsável para roteamento automático no RabbitMQ
                </Text>

                <View style={styles.categoriesGrid}>
                  {(['REDE', 'HARDWARE', 'SOFTWARE', 'ACESSO'] as CategoriaChamado[]).map((catKey) => {
                    const item = CATEGORIA_INFO[catKey];
                    const isSelected = categoria === catKey;

                    return (
                      <TouchableOpacity
                        key={catKey}
                        activeOpacity={0.82}
                        onPress={() => setCategoria(catKey)}
                        style={[
                          styles.categoryCard,
                          {
                            backgroundColor: isSelected
                              ? isDarkMode
                                ? 'rgba(255,255,255,0.04)'
                                : item.bgLight
                              : isDarkMode
                              ? 'rgba(255,255,255,0.02)'
                              : '#f8fafc',
                            borderColor: isSelected ? item.color : isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                      >
                        {isSelected && (
                          <View style={[styles.checkCircle, { backgroundColor: item.color }]}>
                            <MaterialCommunityIcons name="check" size={12} color="#ffffff" />
                          </View>
                        )}

                        <LinearGradient
                          colors={item.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.categoryIconWrap}
                        >
                          <MaterialCommunityIcons name={item.icon as any} size={22} color="#ffffff" />
                        </LinearGradient>

                        <Text
                          variant="titleSmall"
                          style={{
                            color: isSelected ? item.color : theme.colors.onSurface,
                            fontWeight: '800',
                            marginTop: 10,
                          }}
                        >
                          {item.label}
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{
                            color: theme.colors.outline,
                            fontSize: 11,
                            textAlign: 'center',
                            marginTop: 2,
                          }}
                        >
                          {item.desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. Seleção de Prioridade & SLA */}
              <View
                style={[
                  styles.formSectionCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                    marginTop: 18,
                  },
                ]}
              >
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  2. Nível de Prioridade & Acordo de SLA
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 14 }}>
                  O tempo máximo para atendimento é calculado a partir do nível de urgência
                </Text>

                <View style={styles.priorityGrid}>
                  {(['CRITICA', 'ALTA', 'MEDIA', 'BAIXA'] as PrioridadeChamado[]).map((prioKey) => {
                    const item = PRIORIDADE_INFO[prioKey];
                    const isSelected = prioridade === prioKey;

                    return (
                      <TouchableOpacity
                        key={prioKey}
                        activeOpacity={0.82}
                        onPress={() => setPrioridade(prioKey)}
                        style={[
                          styles.priorityCard,
                          {
                            backgroundColor: isSelected
                              ? isDarkMode
                                ? 'rgba(255,255,255,0.04)'
                                : item.bgLight
                              : isDarkMode
                              ? 'rgba(255,255,255,0.02)'
                              : '#f8fafc',
                            borderColor: isSelected ? item.color : isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                      >
                        <View style={styles.prioTopRow}>
                          <View style={[styles.prioDot, { backgroundColor: item.color }]} />
                          <Text
                            variant="labelLarge"
                            style={{
                              color: isSelected ? item.color : theme.colors.onSurface,
                              fontWeight: '800',
                            }}
                          >
                            {item.label}
                          </Text>
                        </View>
                        <Text
                          variant="labelSmall"
                          style={{
                            color: isSelected ? item.color : theme.colors.outline,
                            fontWeight: '700',
                            marginTop: 6,
                          }}
                        >
                          SLA Máximo: {item.horas} horas
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. Detalhes do Chamado */}
              <View
                style={[
                  styles.formSectionCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                    marginTop: 18,
                  },
                ]}
              >
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  3. Descrição do Chamado
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 14 }}>
                  Forneça informações precisas para agilizar o diagnóstico técnico
                </Text>

                <TextInput
                  label="Título do Chamado *"
                  placeholder="Ex: Lentidão crítica na rede sem fio do Bloco B"
                  value={titulo}
                  onChangeText={setTitulo}
                  mode="outlined"
                  outlineColor={isDarkMode ? '#334155' : '#cbd5e1'}
                  activeOutlineColor="#4f46e5"
                  style={styles.input}
                  error={touched && !isTituloValid}
                />
                {touched && !isTituloValid && (
                  <HelperText type="error" visible={true}>
                    O título deve conter pelo menos 5 caracteres.
                  </HelperText>
                )}

                <TextInput
                  label="Descrição Detalhada do Problema *"
                  placeholder="Descreva detalhadamente o ocorrido, passos para reproduzir, mensagens de erro observadas ou equipamentos com defeito..."
                  value={descricao}
                  onChangeText={setDescricao}
                  mode="outlined"
                  multiline
                  numberOfLines={5}
                  outlineColor={isDarkMode ? '#334155' : '#cbd5e1'}
                  activeOutlineColor="#4f46e5"
                  style={[styles.input, { minHeight: 130, marginTop: 10 }]}
                  error={touched && !isDescricaoValid}
                />
                {touched && !isDescricaoValid && (
                  <HelperText type="error" visible={true}>
                    A descrição deve conter no mínimo 10 caracteres explicativos.
                  </HelperText>
                )}
              </View>
            </View>

            {/* Coluna Lateral: Resumo, Arquitetura & Ações (40%) */}
            <View style={[styles.sideColumn, isDesktop && { flex: 1, marginLeft: 20 }]}>
              {/* Banner da Arquitetura RabbitMQ */}
              <View
                style={[
                  styles.sideCard,
                  {
                    backgroundColor: isDarkMode ? '#1e1b4b' : '#eef2ff',
                    borderColor: isDarkMode ? '#3730a3' : '#c7d2fe',
                  },
                ]}
              >
                <View style={styles.bannerHeader}>
                  <MaterialCommunityIcons name="lightning-bolt" size={22} color="#4f46e5" />
                  <Text variant="titleSmall" style={{ color: isDarkMode ? '#c7d2fe' : '#3730a3', fontWeight: '800', marginLeft: 8 }}>
                    Ciclo de Vida Assíncrono
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: isDarkMode ? '#a5b4fc' : '#4338ca', lineHeight: 18, marginTop: 6, fontSize: 12 }}>
                  Ao clicar em registrar, o chamado é salvo com status <Text style={{ fontWeight: '800' }}>ABERTO</Text> com resposta imediata <Text style={{ fontWeight: '800' }}>HTTP 202 Accepted</Text>. O evento é publicado no RabbitMQ e o <Text style={{ fontWeight: '800' }}>atendimento-service</Text> seleciona o técnico com a menor carga ativa da especialidade.
                </Text>
              </View>

              {/* Card de Previsão de Atendimento */}
              <View
                style={[
                  styles.sideCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                    marginTop: 18,
                  },
                ]}
              >
                <Text variant="titleSmall" style={styles.sideCardTitle}>
                  Previsão de Atendimento
                </Text>

                <View style={styles.summaryItemRow}>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Departamento:
                  </Text>
                  <View style={[styles.pillBadge, { backgroundColor: categoriaSelecionada.bgLight }]}>
                    <Text style={{ color: categoriaSelecionada.color, fontWeight: '800', fontSize: 12 }}>
                      {categoriaSelecionada.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryItemRow}>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Tempo Máximo (SLA):
                  </Text>
                  <View style={[styles.pillBadge, { backgroundColor: prioridadeSelecionada.bgLight }]}>
                    <Text style={{ color: prioridadeSelecionada.color, fontWeight: '800', fontSize: 12 }}>
                      {SLA_HORAS[prioridade]}h ({prioridadeSelecionada.label})
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryItemRow}>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Especialistas no Plantão:
                  </Text>
                  <Text variant="labelMedium" style={{ fontWeight: '700' }}>
                    {tecnicosCategoria.length} técnicos ativos
                  </Text>
                </View>

                {/* Lista rápida dos técnicos da especialidade */}
                <View style={styles.technicianMiniList}>
                  {tecnicosCategoria.map((t) => (
                    <View key={t.id} style={styles.technicianMiniItem}>
                      <Text variant="bodySmall" style={{ fontWeight: '600', fontSize: 12 }}>
                        {t.nome}
                      </Text>
                      <Text
                        variant="labelSmall"
                        style={{
                          color: t.cargaAtual >= t.capacidadeMax ? '#ef4444' : '#10b981',
                          fontWeight: '800',
                          fontSize: 11,
                        }}
                      >
                        {t.cargaAtual}/{t.capacidadeMax} chamados
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Botões de Ação */}
              <View style={styles.actionCard}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleSubmit}
                  disabled={loading}
                  style={styles.submitBtnWrapper}
                >
                  <LinearGradient
                    colors={['#4f46e5', '#6366f1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitBtnGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="send" size={18} color="#ffffff" />
                        <Text variant="labelLarge" style={styles.submitBtnText}>
                          Confirmar e Registrar Chamado
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onCancel}
                  style={[
                    styles.cancelBtn,
                    { borderColor: isDarkMode ? '#334155' : '#cbd5e1' },
                  ]}
                >
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '700' }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    cursor: 'pointer' as any,
  },
  pageTitle: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  columnsContainer: {
    gap: 16,
  },
  mainColumn: {
    flex: 1,
  },
  sideColumn: {
    flex: 1,
    marginTop: 0,
  },
  formSectionCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  sectionTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48.5%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
    cursor: 'pointer' as any,
  },
  checkCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priorityCard: {
    width: '48.5%',
    padding: 14,
    borderRadius: 14,
    cursor: 'pointer' as any,
  },
  prioTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  sideCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideCardTitle: {
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  technicianMiniList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 6,
  },
  technicianMiniItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  actionCard: {
    marginTop: 18,
    gap: 10,
  },
  submitBtnWrapper: {
    borderRadius: 14,
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
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    cursor: 'pointer' as any,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14.5,
  },
  cancelBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer' as any,
  },
});
