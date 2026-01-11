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
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { navigationRef } from './src/navigation/NavigationService';

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
  const Tab = createBottomTabNavigator();
  const { user, loading } = useContext(AuthContext);

  function MainTabs() {
    return (
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Explore" component={require('./src/screens/ExploreScreen').default} />
        <Tab.Screen name="Profile" component={require('./src/screens/ProfileScreen').default} />
      </Tab.Navigator>
    );
  }

  useEffect(() => {
    // auto-navigate when auth state is known and navigation is ready
    try {
      if (!loading && navigationRef && navigationRef.isReady()) {
        console.log('user', user);
        navigationRef.reset({
          index: 0,
          routes: [{ name: (user ? 'MainTabs' : 'Login') as any }],
        });
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
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={require('./src/screens/WelcomeScreen').default} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={require('./src/screens/SignUpScreen').default} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="CompleteProfile" component={require('./src/screens/CompleteProfileScreen').default} options={{ headerShown: false }} />
        <Stack.Screen name="PostDetail" component={require('./src/screens/PostDetailScreen').default} options={{ title: 'Post' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
