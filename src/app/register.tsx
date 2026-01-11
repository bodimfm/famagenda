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
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const register = useAuthStore((s) => s.register);

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !email.trim() || !password.trim()) {
        throw new Error('Preencha todos os campos');
      }
      if (password !== confirmPassword) {
        throw new Error('As senhas nao coincidem');
      }
      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      const success = await register(name, email, password);
      if (!success) {
        throw new Error('Este email ja esta em uso');
      }
      return true;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/family-setup');
    },
    onError: (err: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message);
    },
  });

  const handleRegister = () => {
    setError('');
    registerMutation.mutate();
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
          height: 200,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="absolute top-14 left-5 z-10 bg-white/20 p-2 rounded-full"
        >
          <ArrowLeft size={24} color="white" />
        </Pressable>

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
              className="items-center pt-16 pb-8"
            >
              <Text className="text-white font-bold text-2xl">Criar Conta</Text>
              <Text className="text-white/70 mt-2">Junte-se a sua familia</Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              className="flex-1 px-6"
            >
              <View className="bg-white rounded-3xl p-6 shadow-lg">
                {/* Name Input */}
                <View className="mb-4">
                  <Text className="text-darkNavy/60 text-sm font-medium mb-2">Nome</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                    <User size={20} color="#9CA3AF" />
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Seu nome"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="words"
                      className="flex-1 ml-3 text-darkNavy text-base"
                    />
                  </View>
                </View>

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
                <View className="mb-4">
                  <Text className="text-darkNavy/60 text-sm font-medium mb-2">Senha</Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                    <Lock size={20} color="#9CA3AF" />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Minimo 6 caracteres"
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

                {/* Confirm Password Input */}
                <View className="mb-6">
                  <Text className="text-darkNavy/60 text-sm font-medium mb-2">
                    Confirmar Senha
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                    <Lock size={20} color="#9CA3AF" />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Digite novamente"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      className="flex-1 ml-3 text-darkNavy text-base"
                    />
                  </View>
                </View>

                {/* Error Message */}
                {error ? (
                  <Animated.View entering={FadeInDown} className="mb-4">
                    <Text className="text-red-500 text-center">{error}</Text>
                  </Animated.View>
                ) : null}

                {/* Register Button */}
                <Pressable
                  onPress={handleRegister}
                  disabled={registerMutation.isPending}
                  className="bg-teal py-4 rounded-xl active:scale-98"
                >
                  {registerMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-center text-lg">
                      Criar Conta
                    </Text>
                  )}
                </Pressable>
              </View>

              {/* Login Link */}
              <View className="flex-row justify-center mt-6 mb-8">
                <Text className="text-darkNavy/60">Ja tem uma conta? </Text>
                <Pressable onPress={() => router.back()}>
                  <Text className="text-teal font-semibold">Entrar</Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
