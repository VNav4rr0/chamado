import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider, Snackbar, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ChamadoProvider, useChamado } from './src/context/ChamadoContext';
import { lightTheme, darkTheme } from './src/theme/theme';
import { WebNavbar, WebTabKey } from './src/components/WebNavbar';
import { ChamadosListScreen } from './src/screens/ChamadosListScreen';
import { NovoChamadoScreen } from './src/screens/NovoChamadoScreen';
import { ChamadoDetailScreen } from './src/screens/ChamadoDetailScreen';
import { PainelTecnicosScreen } from './src/screens/PainelTecnicosScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { Chamado } from './src/types/chamado';

const MainApp: React.FC = () => {
  const { isDarkMode, snackbarMessage, dismissSnackbar } = useChamado();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [activeTab, setActiveTab] = useState<WebTabKey>('chamados');
  const [selectedChamadoId, setSelectedChamadoId] = useState<string | null>(null);

  const handleSelectChamado = (chamado: Chamado) => {
    setSelectedChamadoId(chamado.id);
  };

  const handleBackFromDetail = () => {
    setSelectedChamadoId(null);
  };

  const handleNovoChamadoSuccess = (chamadoId: string) => {
    setSelectedChamadoId(chamadoId);
    setActiveTab('chamados');
  };

  const renderCurrentScreen = () => {
    if (selectedChamadoId) {
      return (
        <ChamadoDetailScreen
          chamadoId={selectedChamadoId}
          onBack={handleBackFromDetail}
        />
      );
    }

    switch (activeTab) {
      case 'chamados':
        return (
          <ChamadosListScreen
            onSelectChamado={handleSelectChamado}
            onOpenNovoChamado={() => setActiveTab('novo')}
          />
        );
      case 'novo':
        return (
          <NovoChamadoScreen
            onSuccess={handleNovoChamadoSuccess}
            onCancel={() => setActiveTab('chamados')}
          />
        );
      case 'tecnicos':
        return <PainelTecnicosScreen />;
      case 'config':
        return <SettingsScreen />;
    }
  };

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.rootContainer, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />

        {/* Top Navbar Corporativa Web */}
        <WebNavbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setSelectedChamadoId(null);
            setActiveTab(tab);
          }}
          selectedChamadoId={selectedChamadoId}
          onBackToChamados={handleBackFromDetail}
        />

        {/* Conteúdo Principal da Página Web */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderCurrentScreen()}
        </main>

        {/* Toast Notifier Flutuante Web */}
        <Snackbar
          visible={!!snackbarMessage}
          onDismiss={dismissSnackbar}
          duration={4000}
          action={{
            label: 'FECHAR',
            onPress: dismissSnackbar,
            textColor: '#818cf8',
          }}
          style={styles.webSnackbar}
        >
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13.5 }}>
            {snackbarMessage}
          </Text>
        </Snackbar>
      </View>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ChamadoProvider>
        <MainApp />
      </ChamadoProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    minHeight: '100vh' as any,
  },
  webSnackbar: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxWidth: 480,
    alignSelf: 'flex-end',
    marginRight: 24,
    marginBottom: 24,
  },
});
