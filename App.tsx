/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect, useContext } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import FirebaseProvider, { AuthContext } from './src/firebase/provider';
import SplashScreen from './src/components/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <FirebaseProvider>
        <PaperProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AppContent />
        </PaperProvider>
      </FirebaseProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const Stack = createNativeStackNavigator();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    // auto-navigate when auth state is known and navigation is ready
    try {
      if (!loading && navigationRef && navigationRef.isReady()) {
        if (user) {
          navigationRef.navigate('Home' as any);
        } else {
          navigationRef.navigate('Login' as any);
        }
      }
    } catch (e) {
      // ignore navigation errors during startup
    }
  }, [user, loading]);

  if (showSplash) {
    return (
      <View style={styles.container}>
        <SplashScreen onDone={() => setShowSplash(false)} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={require('./src/screens/SignUpScreen').default} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="PostDetail" component={require('./src/screens/PostDetailScreen').default} options={{ title: 'Post' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
import { navigationRef } from './src/navigation/NavigationService';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
