import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { X, Sparkles, RefreshCw, Cloud } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useMutation } from '@tanstack/react-query';
import { useFamilyStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { syncAndHydrateStore } from '@/lib/supabase-sync';
import { generateFamilyOverview } from '@/lib/openai';

interface AIPanoramaModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AIPanoramaModal({ visible, onClose }: AIPanoramaModalProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const familyGroup = useAuthStore((s) => s.familyGroup);

  const mutation = useMutation({
    mutationFn: async () => {
      // 1. Sincronizar dados do banco primeiro
      if (familyGroup?.dbId) {
        setIsSyncing(true);
        await syncAndHydrateStore(familyGroup.dbId);
        setIsSyncing(false);
      }

      // 2. Obter dados atualizados da store
      const store = useFamilyStore.getState();

      // 3. Gerar resumo com dados frescos
      return generateFamilyOverview({
        members: store.members,
        events: store.events,
        pickups: store.pickups,
        shoppingItems: store.shoppingItems,
        wishlistItems: store.wishlistItems,
        importantDates: store.importantDates,
        customLists: store.customLists,
        pets: store.pets,
      });
    },
  });

  React.useEffect(() => {
    if (visible && !mutation.data && !mutation.isPending) {
      mutation.mutate();
    }
  }, [visible]);

  const handleRefresh = () => {
    mutation.mutate();
  };

  const isLoading = isSyncing || mutation.isPending;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-cream">
        {/* Header */}
        <LinearGradient
          colors={['#0D3B5C', '#1B5A7D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-white/20 p-2 rounded-full mr-3">
                <Sparkles size={24} color="white" />
              </View>
              <View>
                <Text className="text-white font-bold text-xl">Panorama Familiar</Text>
                <Text className="text-white/70 text-sm">Resumo inteligente por IA</Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              className="bg-white/20 p-2 rounded-full"
            >
              <X size={24} color="white" />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <Animated.View
              entering={FadeIn}
              className="items-center justify-center py-16"
            >
              <ActivityIndicator size="large" color="#1B7C7C" />
              <Text className="text-darkNavy/60 mt-4 text-center">
                {isSyncing
                  ? 'Sincronizando dados...'
                  : 'Analisando as obrigacoes da familia...'}
              </Text>
              {isSyncing && (
                <View className="flex-row items-center mt-2">
                  <Cloud size={16} color="#9CA3AF" />
                  <Text className="text-darkNavy/40 text-sm ml-1">
                    Buscando dados atualizados
                  </Text>
                </View>
              )}
            </Animated.View>
          ) : mutation.isError ? (
            <Animated.View
              entering={FadeInDown}
              className="bg-red-50 rounded-2xl p-6 items-center"
            >
              <Text className="text-red-600 text-center mb-4">
                {mutation.error?.message ?? 'Erro ao gerar resumo'}
              </Text>
              <Pressable
                onPress={handleRefresh}
                className="bg-teal px-6 py-3 rounded-full flex-row items-center"
              >
                <RefreshCw size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Tentar Novamente</Text>
              </Pressable>
            </Animated.View>
          ) : mutation.data ? (
            <Animated.View entering={FadeInDown.springify()}>
              <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                <Text className="text-darkNavy text-base leading-relaxed">
                  {mutation.data}
                </Text>
              </View>

              <Pressable
                onPress={handleRefresh}
                className="flex-row items-center justify-center py-4"
              >
                <RefreshCw size={18} color="#1B7C7C" />
                <Text className="text-teal font-medium ml-2">
                  Atualizar Resumo
                </Text>
              </Pressable>
            </Animated.View>
          ) : null}

          <View className="h-8" />
        </ScrollView>
      </View>
    </Modal>
  );
}
