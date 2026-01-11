import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Gift, Plus, Star, Link as LinkIcon, Trash2, X, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { useFamilyStore, WishlistItem } from '@/lib/store';
import * as Haptics from 'expo-haptics';

type Priority = 'all' | 'high' | 'medium' | 'low';

const PRIORITIES: { key: Priority; label: string; color: string }[] = [
  { key: 'all', label: 'Todos', color: '#0D3B5C' },
  { key: 'high', label: 'Alta', color: '#E8927C' },
  { key: 'medium', label: 'Media', color: '#F5A623' },
  { key: 'low', label: 'Baixa', color: '#8FB096' },
];

export default function WishlistScreen() {
  const [selectedPriority, setSelectedPriority] = useState<Priority>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const wishlistItems = useFamilyStore((s) => s.wishlistItems);
  const addWishlistItem = useFamilyStore((s) => s.addWishlistItem);
  const removeWishlistItem = useFamilyStore((s) => s.removeWishlistItem);
  const members = useFamilyStore((s) => s.members);

  const filteredItems = useMemo(() => {
    if (selectedPriority === 'all') return wishlistItems;
    return wishlistItems.filter((item) => item.priority === selectedPriority);
  }, [wishlistItems, selectedPriority]);

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#E8927C';
      case 'medium':
        return '#F5A623';
      case 'low':
        return '#8FB096';
      default:
        return '#9CA3AF';
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addWishlistItem({
      name: newItemName.trim(),
      price: newItemPrice.trim() || undefined,
      addedBy: members[0]?.id || '1',
      priority: selectedPriority === 'all' ? 'medium' : selectedPriority,
    });
    setNewItemName('');
    setNewItemPrice('');
    setIsAdding(false);
  };

  const WishlistCard = ({ item, index }: { item: WishlistItem; index: number }) => {
    const member = getMemberById(item.addedBy);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        exiting={FadeOut}
        layout={Layout.springify()}
        className="mb-3"
      >
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <View className="h-1" style={{ backgroundColor: priorityColor }} />
          <View className="p-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-darkNavy font-bold text-base">{item.name}</Text>
                {item.description && (
                  <Text className="text-gray-400 text-sm mt-1">{item.description}</Text>
                )}
                <View className="flex-row items-center mt-2 space-x-3">
                  {item.price && (
                    <View className="bg-sage/10 px-2 py-1 rounded-full">
                      <Text className="text-sage font-semibold text-sm">{item.price}</Text>
                    </View>
                  )}
                  {item.link && (
                    <View className="flex-row items-center">
                      <LinkIcon size={14} color="#9CA3AF" />
                      <Text className="text-gray-400 text-sm ml-1">Link</Text>
                    </View>
                  )}
                </View>
              </View>
              <View className="items-end">
                <View className="flex-row items-center">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      color={priorityColor}
                      fill={
                        (item.priority === 'high' && star <= 3) ||
                        (item.priority === 'medium' && star <= 2) ||
                        (item.priority === 'low' && star <= 1)
                          ? priorityColor
                          : 'transparent'
                      }
                    />
                  ))}
                </View>
                {member && (
                  <View
                    className="mt-2 px-2 py-1 rounded-full"
                    style={{ backgroundColor: member.color + '20' }}
                  >
                    <Text style={{ color: member.color }} className="text-xs font-medium">
                      {member.name}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                removeWishlistItem(item.id);
              }}
              className="absolute top-3 right-3 p-1"
            >
              <Trash2 size={16} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-cream">
      {/* Header with gradient */}
      <LinearGradient
        colors={['#1B7C7C', '#E8927C'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white/80 text-sm">Lista de</Text>
            <Text className="text-white font-bold text-2xl">Desejos</Text>
          </View>
          <View className="bg-white/20 px-3 py-2 rounded-xl">
            <Text className="text-white font-bold text-lg">{wishlistItems.length}</Text>
            <Text className="text-white/80 text-xs">itens</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Priority Filter */}
      <View className="px-5 pt-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <View className="flex-row space-x-2">
            {PRIORITIES.map((priority) => (
              <Pressable
                key={priority.key}
                onPress={() => setSelectedPriority(priority.key)}
                className={`px-4 py-2 rounded-full ${
                  selectedPriority === priority.key ? 'bg-darkNavy' : 'bg-white'
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedPriority === priority.key ? 'text-white' : 'text-darkNavy'
                  }`}
                >
                  {priority.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* Add Item Section */}
        {isAdding ? (
          <Animated.View
            entering={FadeInDown.springify()}
            className="bg-white rounded-xl p-4 mb-4"
          >
            <TextInput
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Nome do item..."
              placeholderTextColor="#9CA3AF"
              className="text-darkNavy text-base border-b border-gray-100 pb-3 mb-3"
              autoFocus
            />
            <TextInput
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              placeholder="Preco (opcional) - ex: R$ 100"
              placeholderTextColor="#9CA3AF"
              className="text-darkNavy text-base"
            />
            <View className="flex-row justify-end mt-4 space-x-2">
              <Pressable
                onPress={() => {
                  setIsAdding(false);
                  setNewItemName('');
                  setNewItemPrice('');
                }}
                className="px-4 py-2 rounded-full bg-gray-100"
              >
                <Text className="text-gray-500">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleAddItem}
                className="px-4 py-2 rounded-full bg-teal flex-row items-center"
              >
                <Check size={16} color="white" />
                <Text className="text-white font-medium ml-1">Adicionar</Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          <Pressable
            onPress={() => setIsAdding(true)}
            className="bg-teal/10 border-2 border-dashed border-teal/30 rounded-xl p-4 mb-4 flex-row items-center justify-center"
          >
            <Plus size={20} color="#1B7C7C" />
            <Text className="text-teal font-medium ml-2">Adicionar Desejo</Text>
          </Pressable>
        )}

        {/* Wishlist Items */}
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <WishlistCard key={item.id} item={item} index={index} />
          ))
        ) : (
          <View className="items-center py-12">
            <Gift size={48} color="#9CA3AF" />
            <Text className="text-gray-400 mt-4 text-center">Nenhum item na lista</Text>
            <Text className="text-gray-300 text-sm mt-1">
              Adicione itens que a familia deseja
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
