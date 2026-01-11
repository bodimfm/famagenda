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
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  UserPlus,
  Copy,
  Share2,
  ArrowRight,
  Home,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';

type SetupStep = 'choice' | 'create' | 'join';

export default function FamilySetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>('choice');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const user = useAuthStore((s) => s.user);
  const familyGroup = useAuthStore((s) => s.familyGroup);
  const createFamilyGroup = useAuthStore((s) => s.createFamilyGroup);
  const joinFamilyGroup = useAuthStore((s) => s.joinFamilyGroup);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!familyName.trim()) {
        throw new Error('Digite o nome da familia');
      }
      createFamilyGroup(familyName);
      return true;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (err: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message);
    },
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!inviteCode.trim()) {
        throw new Error('Digite o codigo de convite');
      }
      const success = await joinFamilyGroup(inviteCode);
      if (!success) {
        throw new Error('Codigo de convite invalido');
      }
      return true;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    },
    onError: (err: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.message);
    },
  });

  const handleCopyCode = async () => {
    if (familyGroup?.inviteCode) {
      await Clipboard.setStringAsync(familyGroup.inviteCode);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareCode = async () => {
    if (familyGroup?.inviteCode) {
      try {
        await Share.share({
          message: `Junte-se a familia "${familyGroup.name}" no app Agenda Familia!\n\nCodigo de convite: ${familyGroup.inviteCode}`,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  // Show success state after creating family
  if (familyGroup && step === 'create') {
    return (
      <View className="flex-1 bg-cream">
        <LinearGradient
          colors={['#8FB096', '#6B8E72']}
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

        <SafeAreaView className="flex-1" edges={['top']}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              entering={FadeInUp.delay(100).springify()}
              className="items-center pt-16 pb-8"
            >
              <View className="bg-white/20 p-4 rounded-full mb-4">
                <Users size={40} color="white" />
              </View>
              <Text className="text-white font-bold text-2xl">
                Familia Criada!
              </Text>
              <Text className="text-white/80 mt-2 text-center px-8">
                Convide seus familiares com o codigo abaixo
              </Text>
            </Animated.View>

            {/* Invite Code Card */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              className="flex-1 px-6"
            >
              <View className="bg-white rounded-3xl p-6 shadow-lg">
                <Text className="text-darkNavy/60 text-center mb-2">
                  Codigo de Convite
                </Text>
                <Text className="text-darkNavy font-bold text-4xl text-center tracking-widest mb-6">
                  {familyGroup.inviteCode}
                </Text>

                <View className="flex-row space-x-3 mb-6">
                  <Pressable
                    onPress={handleCopyCode}
                    className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
                  >
                    <Copy size={18} color="#0D3B5C" />
                    <Text className="text-darkNavy font-medium ml-2">
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleShareCode}
                    className="flex-1 bg-teal py-3 rounded-xl flex-row items-center justify-center"
                  >
                    <Share2 size={18} color="white" />
                    <Text className="text-white font-medium ml-2">
                      Compartilhar
                    </Text>
                  </Pressable>
                </View>

                <View className="bg-sage/10 rounded-xl p-4 mb-6">
                  <Text className="text-darkNavy/70 text-center text-sm">
                    Seus familiares podem usar este codigo para entrar no grupo
                    "{familyGroup.name}"
                  </Text>
                </View>

                <Pressable
                  onPress={handleContinue}
                  className="bg-darkNavy py-4 rounded-xl flex-row items-center justify-center"
                >
                  <Home size={20} color="white" />
                  <Text className="text-white font-bold ml-2">
                    Ir para o App
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

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

      <SafeAreaView className="flex-1" edges={['top']}>
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
              <View className="bg-white/20 p-4 rounded-full mb-4">
                <Users size={40} color="white" />
              </View>
              <Text className="text-white font-bold text-2xl">
                {step === 'choice'
                  ? `Ola, ${user?.name}!`
                  : step === 'create'
                  ? 'Criar Familia'
                  : 'Entrar na Familia'}
              </Text>
              <Text className="text-white/70 mt-2 text-center px-8">
                {step === 'choice'
                  ? 'Crie um novo grupo familiar ou entre em um existente'
                  : step === 'create'
                  ? 'De um nome para sua familia'
                  : 'Digite o codigo de convite'}
              </Text>
            </Animated.View>

            {/* Content */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              className="flex-1 px-6"
            >
              {step === 'choice' ? (
                <View className="space-y-4">
                  {/* Create Family Option */}
                  <Pressable
                    onPress={() => setStep('create')}
                    className="bg-white rounded-3xl p-6 shadow-lg active:scale-98"
                  >
                    <View className="flex-row items-center">
                      <View className="bg-teal/10 p-4 rounded-2xl">
                        <Home size={28} color="#1B7C7C" />
                      </View>
                      <View className="flex-1 ml-4">
                        <Text className="text-darkNavy font-bold text-lg">
                          Criar Nova Familia
                        </Text>
                        <Text className="text-darkNavy/60 mt-1">
                          Seja o primeiro e convide os outros
                        </Text>
                      </View>
                      <ArrowRight size={24} color="#1B7C7C" />
                    </View>
                  </Pressable>

                  {/* Join Family Option */}
                  <Pressable
                    onPress={() => setStep('join')}
                    className="bg-white rounded-3xl p-6 shadow-lg active:scale-98"
                  >
                    <View className="flex-row items-center">
                      <View className="bg-sage/10 p-4 rounded-2xl">
                        <UserPlus size={28} color="#8FB096" />
                      </View>
                      <View className="flex-1 ml-4">
                        <Text className="text-darkNavy font-bold text-lg">
                          Entrar com Codigo
                        </Text>
                        <Text className="text-darkNavy/60 mt-1">
                          Use o codigo de convite da familia
                        </Text>
                      </View>
                      <ArrowRight size={24} color="#8FB096" />
                    </View>
                  </Pressable>

                  {/* Quick Start Option */}
                  <Pressable
                    onPress={() => {
                      createFamilyGroup('Minha Familia');
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      router.replace('/(tabs)');
                    }}
                    className="mt-4 py-3"
                  >
                    <Text className="text-darkNavy/50 text-center">
                      Pular por agora
                    </Text>
                  </Pressable>
                </View>
              ) : step === 'create' ? (
                <View className="bg-white rounded-3xl p-6 shadow-lg">
                  <View className="mb-6">
                    <Text className="text-darkNavy/60 text-sm font-medium mb-2">
                      Nome da Familia
                    </Text>
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                      <Home size={20} color="#9CA3AF" />
                      <TextInput
                        value={familyName}
                        onChangeText={setFamilyName}
                        placeholder="Ex: Familia Silva"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-3 text-darkNavy text-base"
                      />
                    </View>
                  </View>

                  {error ? (
                    <Text className="text-red-500 text-center mb-4">{error}</Text>
                  ) : null}

                  <Pressable
                    onPress={() => createMutation.mutate()}
                    disabled={createMutation.isPending}
                    className="bg-teal py-4 rounded-xl"
                  >
                    {createMutation.isPending ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-center text-lg">
                        Criar Familia
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setStep('choice');
                      setError('');
                    }}
                    className="mt-4"
                  >
                    <Text className="text-teal text-center">Voltar</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="bg-white rounded-3xl p-6 shadow-lg">
                  <View className="mb-6">
                    <Text className="text-darkNavy/60 text-sm font-medium mb-2">
                      Codigo de Convite
                    </Text>
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                      <UserPlus size={20} color="#9CA3AF" />
                      <TextInput
                        value={inviteCode}
                        onChangeText={(text) => setInviteCode(text.toUpperCase())}
                        placeholder="Ex: ABC123"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="characters"
                        maxLength={6}
                        className="flex-1 ml-3 text-darkNavy text-base tracking-widest font-bold"
                      />
                    </View>
                  </View>

                  {error ? (
                    <Text className="text-red-500 text-center mb-4">{error}</Text>
                  ) : null}

                  <Pressable
                    onPress={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    className="bg-sage py-4 rounded-xl"
                  >
                    {joinMutation.isPending ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-center text-lg">
                        Entrar na Familia
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setStep('choice');
                      setError('');
                    }}
                    className="mt-4"
                  >
                    <Text className="text-teal text-center">Voltar</Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
