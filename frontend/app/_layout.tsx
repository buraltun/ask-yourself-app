import { Stack } from 'expo-router';
import { UserProvider } from '../contexts/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
  );
}
