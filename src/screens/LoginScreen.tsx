import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthService } from '../services/authService';
import { Usuario } from '../types/auth';

interface LoginScreenProps {
  onLoginSuccess: (usuario: Usuario) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [modo, setModo] = useState<'LOGIN' | 'CADASTRO'>('LOGIN');

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const userTrim = username.trim();
    const passTrim = password.trim();

    if (!userTrim || !passTrim) {
      setErrorMessage('Por favor, informe o usuário e a senha.');
      return;
    }

    if (modo === 'CADASTRO' && !nome.trim()) {
      setErrorMessage('Por favor, informe o seu nome completo para o cadastro.');
      return;
    }

    setLoading(true);

    try {
      if (modo === 'CADASTRO') {
        // Registra a conta com os dados e perfil escolhido (Comum ou ADM)
        await AuthService.register(userTrim, passTrim, nome.trim(), isAdmin);
        setSuccessMessage(
          isAdmin
            ? 'Conta de Administrador (ADM) criada com sucesso! Acessando...'
            : 'Conta criada com sucesso! Acessando...'
        );

        // Login automático com os dados inseridos
        const usuarioLogado = await AuthService.login(userTrim, passTrim);
        onLoginSuccess(usuarioLogado);
      } else {
        // Efetua login com as credenciais informadas
        const usuarioLogado = await AuthService.login(userTrim, passTrim);
        onLoginSuccess(usuarioLogado);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const alternarModo = (novoModo: 'LOGIN' | 'CADASTRO') => {
    setModo(novoModo);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.cardWrapper}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {/* Header / Logo */}
            <View style={styles.header}>
              <View style={styles.logoWrap}>
                <MaterialCommunityIcons name="shield-lock-outline" size={32} color="#4f46e5" />
              </View>
              <Text variant="headlineSmall" style={styles.title}>
                Central de Chamados
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {modo === 'LOGIN'
                  ? 'Insira o seu usuário e senha para entrar'
                  : 'Cadastre suas informações para criar sua conta'}
              </Text>
            </View>

            {/* Alternador de Abas: Entrar / Criar Conta */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, modo === 'LOGIN' && styles.tabButtonActive]}
                onPress={() => alternarModo('LOGIN')}
              >
                <Text style={[styles.tabText, modo === 'LOGIN' && styles.tabTextActive]}>
                  Entrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, modo === 'CADASTRO' && styles.tabButtonActive]}
                onPress={() => alternarModo('CADASTRO')}
              >
                <Text style={[styles.tabText, modo === 'CADASTRO' && styles.tabTextActive]}>
                  Criar Conta
                </Text>
              </TouchableOpacity>
            </View>

            {/* Feedback de Erro */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#ef4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Feedback de Sucesso */}
            {successMessage && (
              <View style={styles.successBox}>
                <MaterialCommunityIcons name="check-circle-outline" size={18} color="#10b981" />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* Campo Nome (Apenas no Cadastro) */}
            {modo === 'CADASTRO' && (
              <TextInput
                label="Seu Nome Completo"
                value={nome}
                onChangeText={(txt) => {
                  setNome(txt);
                  setErrorMessage(null);
                }}
                mode="outlined"
                outlineColor="#cbd5e1"
                activeOutlineColor="#4f46e5"
                style={styles.input}
                left={<TextInput.Icon icon="account-badge-outline" />}
                disabled={loading}
              />
            )}

            {/* Input Usuário */}
            <TextInput
              label="Nome de Usuário"
              value={username}
              onChangeText={(txt) => {
                setUsername(txt);
                setErrorMessage(null);
              }}
              mode="outlined"
              outlineColor="#cbd5e1"
              activeOutlineColor="#4f46e5"
              autoCapitalize="none"
              style={[styles.input, modo === 'CADASTRO' && { marginTop: 12 }]}
              left={<TextInput.Icon icon="account-outline" />}
              disabled={loading}
            />

            {/* Input Senha */}
            <TextInput
              label="Senha"
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                setErrorMessage(null);
              }}
              mode="outlined"
              outlineColor="#cbd5e1"
              activeOutlineColor="#4f46e5"
              secureTextEntry={!showPassword}
              style={[styles.input, { marginTop: 12 }]}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              disabled={loading}
            />

            {/* Opção de Criar Conta como Administrador (ADM) */}
            {modo === 'CADASTRO' && (
              <View style={styles.admSwitchRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name="crown" size={18} color="#f59e0b" />
                    <Text style={styles.admSwitchLabel}>Acesso de Administrador (ADM)</Text>
                  </View>
                  <Text style={styles.admSwitchDesc}>
                    Concede permissões completas de gerência e resolução de tickets.
                  </Text>
                </View>
                <Switch value={isAdmin} onValueChange={setIsAdmin} color="#f59e0b" />
              </View>
            )}

            {/* Botão de Ação */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              buttonColor={isAdmin && modo === 'CADASTRO' ? '#b45309' : '#4f46e5'}
              style={styles.actionButton}
              contentStyle={styles.buttonContent}
              icon={modo === 'LOGIN' ? 'login' : isAdmin ? 'crown' : 'account-plus'}
            >
              {modo === 'LOGIN'
                ? 'Entrar'
                : isAdmin
                ? 'Cadastrar como Administrador (ADM)'
                : 'Cadastrar e Acessar'}
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f1f5f9',
    minHeight: '100vh' as any,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 440,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardContent: {
    padding: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    fontSize: 13,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#4f46e5',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  successText: {
    color: '#047857',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  input: {
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  admSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginTop: 14,
  },
  admSwitchLabel: {
    fontWeight: '800',
    color: '#92400e',
    fontSize: 12.5,
  },
  admSwitchDesc: {
    color: '#b45309',
    fontSize: 11,
    marginTop: 2,
  },
  actionButton: {
    marginTop: 20,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 6,
  },
});
