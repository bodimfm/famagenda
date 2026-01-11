import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const familyGroup = useAuthStore((s) => s.familyGroup);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!familyGroup) {
    return <Redirect href="/family-setup" />;
  }

  return <Redirect href="/(tabs)" />;
}
