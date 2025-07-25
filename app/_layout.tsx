import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Le nom doit être le chemin relatif SANS .tsx */}
        <Stack.Screen name="login/presentation/Login" options={{ title: "Connexion", headerShown: false }} />
        <Stack.Screen name="home/presentation/HomeScreen" options={{ title: "Accueil", headerShown: false }}  />
        <Stack.Screen name="login/presentation/RegisterScreen" options={{ title: "Inscription", headerShown: false }}  />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}