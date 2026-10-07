import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { lightTheme } from './src/theme/theme';
import { Header } from './src/components/Header';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={lightTheme}>
        <View style={styles.rootContainer}>
          <StatusBar style="dark" />
          <Header />
          <main style={styles.main}>
            <HomeScreen />
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
