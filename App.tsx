import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { lightTheme } from './src/theme/theme';
import { Header } from './src/components/Header';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { Usuario } from './src/types/auth';
import { AuthService } from './src/services/authService';

export default function App() {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState<Usuario | null>(AuthService.getUsuarioLogado());

  const handleLoginSuccess = (usuario: Usuario) => {
    setUsuarioAutenticado(usuario);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUsuarioAutenticado(null);
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <View style={styles.rootContainer}>
          <StatusBar style="dark" />
          <Header />
          <main style={styles.main}>
            {!usuarioAutenticado ? (
              <LoginScreen onLoginSuccess={handleLoginSuccess} />
            ) : (
              <HomeScreen usuario={usuarioAutenticado} onLogout={handleLogout} />
            )}
          </main>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    minHeight: '100vh' as any,
  },
  main: {
    flex: 1,
  },
});
