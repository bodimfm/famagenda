import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Share,
} from 'react-native';
import {
  Plus,
  Check,
  Trash2,
  X,
  ChevronLeft,
  Share2,
  List,
  Briefcase,
  Heart,
  Star,
  Home,
  BookOpen,
  Music,
  Dumbbell,
  Utensils,
  Plane,
  Gift,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { useFamilyStore, CustomListItem } from '@/lib/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  list: List,
  briefcase: Briefcase,
  heart: Heart,
  star: Star,
  home: Home,
  book: BookOpen,
  music: Music,
  dumbbell: Dumbbell,
  utensils: Utensils,
  plane: Plane,
  gift: Gift,
};

export default function ListDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newItemText, setNewItemText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const customLists = useFamilyStore((s) => s.customLists);
  const addCustomListItem = useFamilyStore((s) => s.addCustomListItem);
  const toggleCustomListItem = useFamilyStore((s) => s.toggleCustomListItem);
  const removeCustomListItem = useFamilyStore((s) => s.removeCustomListItem);
  const clearCompletedCustomListItems = useFamilyStore((s) => s.clearCompletedCustomListItems);
  const members = useFamilyStore((s) => s.members);

  const list = useMemo(() => customLists.find((l) => l.id === id), [customLists, id]);

  if (!list) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <Text className="text-gray-400">Lista não encontrada</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-teal px-4 py-2 rounded-full"
        >
          <Text className="text-white font-medium">Voltar</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const IconComponent = ICONS[list.icon] || List;
  const pendingItems = list.items.filter((item) => !item.completed);
  const completedItems = list.items.filter((item) => item.completed);

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addCustomListItem(list.id, newItemText.trim(), members[0]?.id);
    setNewItemText('');
    setIsAdding(false);
  };

  const handleToggle = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleCustomListItem(list.id, itemId);
  };

  const handleRemove = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeCustomListItem(list.id, itemId);
  };

  const handleClearCompleted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearCompletedCustomListItems(list.id);
  };

  const handleShareList = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (list.items.length === 0) return;

    const ICON_EMOJIS: Record<string, string> = {
      list: '📋',
      briefcase: '💼',
      heart: '❤️',
      star: '⭐',
      home: '🏠',
      book: '📖',
      music: '🎵',
      dumbbell: '💪',
      utensils: '🍽️',
      plane: '✈️',
      gift: '🎁',
    };

    const emoji = ICON_EMOJIS[list.icon] || '📋';
    let message = `${emoji} ${list.name}\n\n`;

    if (pendingItems.length > 0) {
      message += '📌 Pendentes:\n';
      pendingItems.forEach((item) => {
        message += `○ ${item.text}\n`;
      });
    }

    if (completedItems.length > 0) {
      if (pendingItems.length > 0) message += '\n';
      message += '✅ Concluídos:\n';
      completedItems.forEach((item) => {
        message += `● ${item.text}\n`;
      });
    }

    message += '\n— Enviado pelo Agenda Familia';

    try {
      await Share.share({ message });
    } catch (err) {
      console.error(err);
    }
  };

  const getMemberById = (memberId?: string) => members.find((m) => m.id === memberId);

  const ListItemRow = ({ item, index }: { item: CustomListItem; index: number }) => {
    const member = getMemberById(item.addedBy);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        exiting={FadeOut}
        layout={Layout.springify()}
      >
        <Pressable
          onPress={() => handleToggle(item.id)}
          className="flex-row items-center bg-white rounded-xl p-4 mb-2"
        >
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center`}
            style={{
              backgroundColor: item.completed ? list.color : 'transparent',
              borderColor: item.completed ? list.color : '#D1D5DB',
            }}
          >
            {item.completed && <Check size={14} color="white" />}
          </View>
          <View className="flex-1 ml-3">
            <Text
              className={`text-base ${
                item.completed ? 'text-gray-400 line-through' : 'text-darkNavy'
              }`}
            >
              {item.text}
            </Text>
          </View>
          {member && (
            <View
              className="w-6 h-6 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: member.color }}
            >
              <Text className="text-white text-xs font-bold">{member.avatar}</Text>
            </View>
          )}
          <Pressable
            onPress={() => handleRemove(item.id)}
            className="p-1"
            hitSlop={8}
          >
            <Trash2 size={18} color="#9CA3AF" />
          </Pressable>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <Pressable
          onPress={() => router.back()}
          className="p-2 -ml-2 mr-2"
        >
          <ChevronLeft size={24} color="#0D3B5C" />
        </Pressable>
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${list.color}20` }}
        >
          <IconComponent size={20} color={list.color} />
        </View>
        <View className="flex-1">
          <Text className="text-darkNavy font-bold text-xl">{list.name}</Text>
          <Text className="text-gray-400 text-sm">
            {pendingItems.length} pendente{pendingItems.length !== 1 && 's'}
          </Text>
        </View>
        {list.items.length > 0 && (
          <Pressable
            onPress={handleShareList}
            className="p-2.5 rounded-full"
            style={{ backgroundColor: list.color }}
          >
            <Share2 size={18} color="white" />
          </Pressable>
        )}
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Add Item Section */}
        {isAdding ? (
          <Animated.View
            entering={FadeInDown.springify()}
            className="bg-white rounded-xl p-4 mb-4 flex-row items-center"
          >
            <TextInput
              value={newItemText}
              onChangeText={setNewItemText}
              placeholder="Novo item..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-darkNavy text-base"
              autoFocus
              onSubmitEditing={handleAddItem}
            />
            <Pressable
              onPress={handleAddItem}
              className="p-2 rounded-full ml-2"
              style={{ backgroundColor: list.color }}
            >
              <Check size={20} color="white" />
            </Pressable>
            <Pressable
              onPress={() => {
                setIsAdding(false);
                setNewItemText('');
              }}
              className="p-2 ml-1"
            >
              <X size={20} color="#9CA3AF" />
            </Pressable>
          </Animated.View>
        ) : (
          <Pressable
            onPress={() => setIsAdding(true)}
            className="border-2 border-dashed rounded-xl p-4 mb-4 flex-row items-center justify-center"
            style={{
              backgroundColor: `${list.color}10`,
              borderColor: `${list.color}30`,
            }}
          >
            <Plus size={20} color={list.color} />
            <Text style={{ color: list.color }} className="font-medium ml-2">
              Adicionar Item
            </Text>
          </Pressable>
        )}

        {/* Pending Items */}
        {pendingItems.length > 0 && (
          <View className="mb-4">
            <Text className="text-darkNavy font-bold text-lg mb-3">
              Pendentes ({pendingItems.length})
            </Text>
            {pendingItems.map((item, index) => (
              <ListItemRow key={item.id} item={item} index={index} />
            ))}
          </View>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-400 font-semibold">
                Concluídos ({completedItems.length})
              </Text>
              <Pressable
                onPress={handleClearCompleted}
                className="px-3 py-1 bg-gray-100 rounded-full"
              >
                <Text className="text-gray-500 text-sm">Limpar</Text>
              </Pressable>
            </View>
            {completedItems.map((item, index) => (
              <ListItemRow key={item.id} item={item} index={index} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {list.items.length === 0 && (
          <View className="items-center py-12">
            <IconComponent size={48} color="#9CA3AF" />
            <Text className="text-gray-400 mt-4 text-center">
              Lista vazia
            </Text>
            <Text className="text-gray-300 text-sm mt-1">
              Adicione seu primeiro item
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
