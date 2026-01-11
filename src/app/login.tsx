import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { syncAndHydrateStore } from '@/lib/supabase-sync';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore((s) => s.login);

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!email.trim() || !password.trim()) {
        throw new Error('Preencha todos os campos');
      }
      const success = await login(email, password);
      if (!success) {
        throw new Error('Email ou senha incorretos');
      }
      return true;
    },
    onSuccess: async () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Sincronizar dados se usuário já tiver uma família
      const familyGroup = useAuthStore.getState().familyGroup;
      if (familyGroup?.dbId) {
        await syncAndHydrateStore(familyGroup.dbId);
      }

      router.replace('/(tabs)');
    },
    onError: (err: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message);
    },
  });

  const handleLogin = () => {
    setError('');
    loginMutation.mutate();
  };

  return (
    <View className="flex-1 bg-cream">
      <LinearGradient
        colors={['#0D3B5C', '#1B5A7D']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 280,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInUp.delay(100).springify()}
            className="items-center pt-20 pb-12"
          >
            <View className="bg-white/20 p-4 rounded-full mb-4">
              <Users size={40} color="white" />
            </View>
            <Text className="text-white font-bold text-3xl">Agenda Familia</Text>
            <Text className="text-white/70 mt-2">Entre na sua conta</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="flex-1 px-6"
          >
            <View className="bg-white rounded-3xl p-6 shadow-lg">
              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-darkNavy/60 text-sm font-medium mb-2">Email</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                  <Mail size={20} color="#9CA3AF" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="seu@email.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 ml-3 text-darkNavy text-base"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-darkNavy/60 text-sm font-medium mb-2">Senha</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                  <Lock size={20} color="#9CA3AF" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Sua senha"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    className="flex-1 ml-3 text-darkNavy text-base"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={20} color="#9CA3AF" />
                    ) : (
                      <Eye size={20} color="#9CA3AF" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <Animated.View entering={FadeInDown} className="mb-4">
                  <Text className="text-red-500 text-center">{error}</Text>
                </Animated.View>
              ) : null}

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                disabled={loginMutation.isPending}
                className="bg-teal py-4 rounded-xl active:scale-98"
              >
                {loginMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-center text-lg">
                    Entrar
                  </Text>
                )}
              </Pressable>

              {/* Forgot Password */}
              <Pressable className="mt-4">
                <Text className="text-teal text-center">
                  Esqueceu a senha?
                </Text>
              </Pressable>
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center mt-8 mb-8">
              <Text className="text-darkNavy/60">Nao tem uma conta? </Text>
              <Pressable onPress={() => router.push('/register')}>
                <Text className="text-teal font-semibold">Cadastre-se</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
